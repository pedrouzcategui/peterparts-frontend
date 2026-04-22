"use client";

import { upload } from "@vercel/blob/client";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AdminMarkdownEditor from "@/components/admin/AdminMarkdownEditor";
import AdminProductImageUploader, {
  type AdminProductFormImage,
} from "@/components/admin/AdminProductImageUploader";
import AdminTagInput from "@/components/admin/AdminTagInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  AdminColorSuggestion,
  AdminExchangeRate,
  AdminManagedCategory,
  AdminManagedCategoryOption,
  AdminProductEditorColor,
  AdminProductEditorData,
  AdminProductEditorReview,
} from "@/lib/admin-data";
import { formatExchangeRate, roundMoney } from "@/lib/currency";
import {
  PREDEFINED_PRODUCT_COLORS,
  resolveProductColorValue,
} from "@/lib/product-colors";
import {
  normalizeAdminProductReviews,
  summarizePublishedProductReviews,
  validateAdminProductReviews,
} from "@/lib/product-reviews";
import {
  buildProductImageUploadPath,
  getProductImageExtension,
  validateProductImageFile,
} from "@/lib/product-image-storage";

type ProductStatus = "active" | "draft" | "archived";

interface ProductFormState {
  name: string;
  brand: string;
  primaryCategoryId: string;
  categoryLabels: string[];
  priceUsd: string;
  priceVes: string;
  stock: string;
  status: ProductStatus;
  featuredRank: string;
  description: string;
}

interface CategoryFormState {
  name: string;
  slug: string;
  description: string;
}

interface ProductColorState {
  id: string;
  label: string;
  colorValue: string;
  available: boolean;
}

type ProductReviewState = AdminProductEditorReview;

interface AdminProductFormProps {
  mode: "create" | "edit";
  existingBrands: string[];
  managedCategories: AdminManagedCategoryOption[];
  categoryLabelSuggestions: string[];
  colorSuggestions: AdminColorSuggestion[];
  latestExchangeRate: AdminExchangeRate | null;
  initialProduct?: AdminProductEditorData;
}

const ADD_BRAND_VALUE = "__add_brand__";
const DEFAULT_COLOR_PICKER_VALUE =
  PREDEFINED_PRODUCT_COLORS[0]?.colorValue ?? "#cfd6dc";

function sortBrands(values: string[]) {
  return [...values].sort((left, right) => left.localeCompare(right, "es"));
}

function sortCategoryOptions(values: AdminManagedCategoryOption[]) {
  return [...values].sort((left, right) =>
    left.displayName.localeCompare(right.displayName, "es"),
  );
}

function mergeCategoryOptions(
  currentValues: AdminManagedCategoryOption[],
  nextValues: AdminManagedCategoryOption[],
) {
  const optionsById = new Map<string, AdminManagedCategoryOption>();

  for (const option of currentValues) {
    optionsById.set(option.id, option);
  }

  for (const option of nextValues) {
    optionsById.set(option.id, option);
  }

  return sortCategoryOptions(Array.from(optionsById.values()));
}

function createEmptyCategoryForm(): CategoryFormState {
  return {
    name: "",
    slug: "",
    description: "",
  };
}

function createClientStateId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeTextValue(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function sortAssignedColorIds(colorIds: string[], colors: ProductColorState[]) {
  const colorOrder = new Map(colors.map((color, index) => [color.id, index]));

  return Array.from(new Set(colorIds)).sort(
    (left, right) =>
      (colorOrder.get(left) ?? Number.MAX_SAFE_INTEGER) -
      (colorOrder.get(right) ?? Number.MAX_SAFE_INTEGER),
  );
}

function createInitialColors(
  initialProduct?: AdminProductEditorData,
): ProductColorState[] {
  return (initialProduct?.colors ?? []).map((color, index) => ({
    id: color.id || `existing-color-${index}-${color.label}`,
    label: color.label,
    colorValue: resolveProductColorValue(color.label, color.colorValue),
    available: color.available,
  }));
}

function createInitialReviews(
  initialProduct?: AdminProductEditorData,
): ProductReviewState[] {
  return normalizeAdminProductReviews(initialProduct?.reviews ?? []);
}

function createEmptyReview(): ProductReviewState {
  return {
    id: createClientStateId("review"),
    reviewerName: "",
    title: "",
    body: "",
    rating: 5,
    isPublished: true,
    createdAt: new Date().toISOString(),
  };
}

function formatReviewDate(value: string) {
  const parsedValue = new Date(value);

  if (Number.isNaN(parsedValue.getTime())) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedValue);
}

function resolvePrimaryColorId(
  colors: ProductColorState[],
  preferredLabel?: string | null,
) {
  if (colors.length === 0) {
    return null;
  }

  const normalizedPreferredLabel = preferredLabel
    ? normalizeTextValue(preferredLabel).toLocaleLowerCase("es")
    : "";

  if (normalizedPreferredLabel) {
    const preferredColor = colors.find(
      (color) =>
        color.available &&
        color.label.toLocaleLowerCase("es") === normalizedPreferredLabel,
    );

    if (preferredColor) {
      return preferredColor.id;
    }
  }

  const firstAvailableColor = colors.find((color) => color.available);

  return firstAvailableColor?.id ?? colors[0]?.id ?? null;
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return items;
  }

  const nextItems = [...items];
  const [item] = nextItems.splice(fromIndex, 1);

  if (!item) {
    return items;
  }

  nextItems.splice(toIndex, 0, item);
  return nextItems;
}

function mapManagedCategoryToOption(
  category: AdminManagedCategory,
): AdminManagedCategoryOption {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    displayName: category.name,
  };
}

function buildImageId(file: File) {
  return `new-${file.name}-${file.size}-${file.lastModified}`;
}

function revokeImagePreview(image: AdminProductFormImage) {
  if (image.previewUrl.startsWith("blob:")) {
    URL.revokeObjectURL(image.previewUrl);
  }
}

function isUploadedNewImage(
  image: AdminProductFormImage,
): image is AdminProductFormImage & { kind: "new"; sourceUrl: string } {
  return (
    image.kind === "new" &&
    typeof image.sourceUrl === "string" &&
    image.sourceUrl.length > 0
  );
}

async function uploadProductImage(file: File, imageId: string) {
  const validationError = validateProductImageFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  const extension = getProductImageExtension(file.type);

  if (!extension) {
    throw new Error(`El archivo ${file.name} no es una imagen compatible.`);
  }

  return upload(buildProductImageUploadPath(imageId, file.name, extension), file, {
    access: "public",
    contentType: file.type,
    handleUploadUrl: "/api/admin/product-images",
    multipart: file.size > 4 * 1024 * 1024,
  });
}

async function deleteTemporaryProductImages(urls: string[]) {
  if (urls.length === 0) {
    return;
  }

  const response = await fetch("/api/admin/product-images", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ urls }),
  });

  if (response.ok) {
    return;
  }

  const result = (await response.json().catch(() => null)) as {
    message?: string;
  } | null;

  throw new Error(result?.message ?? "No se pudieron eliminar las imagenes.");
}

function createInitialFormState(
  defaultBrand: string,
  defaultCategoryId: string,
  initialProduct?: AdminProductEditorData,
): ProductFormState {
  if (!initialProduct) {
    return {
      name: "",
      brand: defaultBrand,
      primaryCategoryId: defaultCategoryId,
      categoryLabels: [],
      priceUsd: "",
      priceVes: "",
      stock: "0",
      status: "draft",
      featuredRank: "",
      description: "",
    };
  }

  return {
    name: initialProduct.name,
    brand: initialProduct.brand,
    primaryCategoryId: initialProduct.primaryCategoryId || defaultCategoryId,
    categoryLabels: initialProduct.categoryLabels,
    priceUsd: initialProduct.priceUsd.toFixed(2),
    priceVes:
      typeof initialProduct.priceVes === "number"
        ? initialProduct.priceVes.toFixed(2)
        : "",
    stock: String(initialProduct.stock),
    status: initialProduct.status,
    featuredRank:
      typeof initialProduct.featuredRank === "number"
        ? String(initialProduct.featuredRank)
        : "",
    description: initialProduct.description,
  };
}

function createInitialImages(
  initialColors: ProductColorState[],
  initialProduct?: AdminProductEditorData,
): AdminProductFormImage[] {
  if (!initialProduct) {
    return [];
  }

  const validColorIds = new Set(initialColors.map((color) => color.id));

  return initialProduct.images.map((image, index) => ({
    id: `existing-${image.id}`,
    kind: "existing",
    previewUrl: image.url,
    name:
      image.altText.trim() ||
      image.url.split("/").pop() ||
      `Imagen ${index + 1}`,
    sourceUrl: image.url,
    appliesToAllColors: image.colorIds.length === 0,
    assignedColorIds: sortAssignedColorIds(
      image.colorIds.filter((colorId) => validColorIds.has(colorId)),
      initialColors,
    ),
  }));
}

export default function AdminProductForm({
  mode,
  existingBrands,
  managedCategories,
  categoryLabelSuggestions,
  colorSuggestions,
  latestExchangeRate,
  initialProduct,
}: AdminProductFormProps) {
  const router = useRouter();
  const initialColors = createInitialColors(initialProduct);
  const [brandOptions, setBrandOptions] = useState(() =>
    sortBrands(existingBrands),
  );
  const [categoryOptions, setCategoryOptions] = useState(() =>
    sortCategoryOptions(managedCategories),
  );
  const defaultBrand = initialProduct?.brand ?? brandOptions[0] ?? "";
  const defaultCategoryId =
    initialProduct?.primaryCategoryId ?? managedCategories[0]?.id ?? "";
  const [formValues, setFormValues] = useState<ProductFormState>(() =>
    createInitialFormState(defaultBrand, defaultCategoryId, initialProduct),
  );
  const [selectedImages, setSelectedImages] = useState<AdminProductFormImage[]>(
    () => createInitialImages(initialColors, initialProduct),
  );
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [categoryFormValues, setCategoryFormValues] =
    useState<CategoryFormState>(createEmptyCategoryForm);
  const [productColors, setProductColors] = useState<ProductColorState[]>(() =>
    initialColors,
  );
  const [productReviews, setProductReviews] = useState<ProductReviewState[]>(
    () => createInitialReviews(initialProduct),
  );
  const [colorDraftLabel, setColorDraftLabel] = useState("");
  const [colorDraftValue, setColorDraftValue] = useState(
    DEFAULT_COLOR_PICKER_VALUE,
  );
  const [primaryColorId, setPrimaryColorId] = useState<string | null>(
    () =>
      resolvePrimaryColorId(
        createInitialColors(initialProduct),
        initialProduct?.primaryColor,
      ),
  );
  const [isCreatingBrand, setIsCreatingBrand] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncingImages, setIsSyncingImages] = useState(false);
  const [hasManualVesPrice, setHasManualVesPrice] = useState(
    Boolean(initialProduct?.priceVes),
  );
  const [isNavigating, startTransition] = useTransition();
  const selectedImagesRef = useRef<AdminProductFormImage[]>(selectedImages);

  useEffect(() => {
    selectedImagesRef.current = selectedImages;
  }, [selectedImages]);

  useEffect(() => {
    setCategoryOptions((currentOptions) =>
      mergeCategoryOptions(currentOptions, managedCategories),
    );
  }, [managedCategories]);

  useEffect(() => {
    return () => {
      selectedImagesRef.current.forEach(revokeImagePreview);
    };
  }, []);

  useEffect(() => {
    setSelectedImages((currentImages) => {
      if (productColors.length === 0) {
        let hasChanges = false;
        const nextImages = currentImages.map((image) => {
          if (image.appliesToAllColors && image.assignedColorIds.length === 0) {
            return image;
          }

          hasChanges = true;

          return {
            ...image,
            appliesToAllColors: true,
            assignedColorIds: [],
          };
        });

        return hasChanges ? nextImages : currentImages;
      }

      const validColorIds = new Set(productColors.map((color) => color.id));
      let hasChanges = false;

      const nextImages = currentImages.map((image) => {
        const assignedColorIds = sortAssignedColorIds(
          image.assignedColorIds.filter((colorId) => validColorIds.has(colorId)),
          productColors,
        );

        if (image.appliesToAllColors) {
          if (assignedColorIds.length === 0) {
            return image;
          }

          hasChanges = true;

          return {
            ...image,
            assignedColorIds: [],
          };
        }

        if (assignedColorIds.length === 0) {
          hasChanges = true;

          return {
            ...image,
            appliesToAllColors: true,
            assignedColorIds: [],
          };
        }

        if (assignedColorIds.length !== image.assignedColorIds.length) {
          hasChanges = true;

          return {
            ...image,
            assignedColorIds,
          };
        }

        return image;
      });

      return hasChanges ? nextImages : currentImages;
    });
  }, [productColors]);

  const isBusy =
    isSubmitting ||
    isNavigating ||
    isCreatingBrand ||
    isCreatingCategory ||
    isSyncingImages;
  const isFeaturedProduct = formValues.featuredRank.trim().length > 0;
  const categorySuggestions = categoryLabelSuggestions;
  const normalizedProductReviews = normalizeAdminProductReviews(productReviews);
  const publishedReviewSummary = summarizePublishedProductReviews(
    normalizedProductReviews,
  );
  const unpublishedReviewCount =
    normalizedProductReviews.length - publishedReviewSummary.reviewCount;
  const selectedPrimaryColor = productColors.find(
    (color) => color.id === primaryColorId,
  );
  const colorSuggestionOptions = Array.from(
    [...PREDEFINED_PRODUCT_COLORS, ...colorSuggestions].reduce(
      (suggestionsByLabel, suggestion) => {
        const normalizedLabel = normalizeTextValue(suggestion.label);

        if (!normalizedLabel) {
          return suggestionsByLabel;
        }

        const key = normalizedLabel.toLocaleLowerCase("es");

        if (!suggestionsByLabel.has(key)) {
          suggestionsByLabel.set(key, {
            label: normalizedLabel,
            colorValue: resolveProductColorValue(
              normalizedLabel,
              suggestion.colorValue,
            ),
          });
        }

        return suggestionsByLabel;
      },
      new Map<string, AdminColorSuggestion>(),
    ).values(),
  );
  const visibleColorSuggestions = colorSuggestionOptions.filter((suggestion) => {
    const alreadySelected = productColors.some(
      (color) =>
        color.label.toLocaleLowerCase("es") ===
        suggestion.label.toLocaleLowerCase("es"),
    );

    if (alreadySelected) {
      return false;
    }

    const normalizedDraftValue = normalizeTextValue(colorDraftLabel).toLocaleLowerCase("es");

    if (!normalizedDraftValue) {
      return true;
    }

    return suggestion.label.toLocaleLowerCase("es").includes(normalizedDraftValue);
  });

  const handleInputChange = <Key extends keyof ProductFormState>(
    key: Key,
    value: ProductFormState[Key],
  ) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  };

  const handleCategoryFormChange = <Key extends keyof CategoryFormState>(
    key: Key,
    value: CategoryFormState[Key],
  ) => {
    setCategoryFormValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  };

  const applyCurrentExchangeRate = () => {
    if (!latestExchangeRate) {
      toast.info(
        "No hay una tasa activa para calcular el precio en bolivares.",
      );
      return;
    }

    const priceUsd = Number(formValues.priceUsd);

    if (!Number.isFinite(priceUsd) || priceUsd < 0) {
      toast.error("Ingresa primero un precio USD valido.");
      return;
    }

    setFormValues((currentValues) => ({
      ...currentValues,
      priceVes: roundMoney(priceUsd * latestExchangeRate.rate).toFixed(2),
    }));
    setHasManualVesPrice(false);
  };

  const handleUsdPriceChange = (value: string) => {
    setFormValues((currentValues) => {
      if (hasManualVesPrice || !latestExchangeRate || value.trim() === "") {
        return {
          ...currentValues,
          priceUsd: value,
        };
      }

      const parsedPrice = Number(value);

      return {
        ...currentValues,
        priceUsd: value,
        priceVes:
          Number.isFinite(parsedPrice) && parsedPrice >= 0
            ? roundMoney(parsedPrice * latestExchangeRate.rate).toFixed(2)
            : "",
      };
    });
  };

  const handleVesPriceChange = (value: string) => {
    setHasManualVesPrice(true);
    handleInputChange("priceVes", value);
  };

  const handleFeaturedToggle = (checked: boolean) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      featuredRank: checked ? currentValues.featuredRank || "1" : "",
    }));
  };

  const handleAddImages = async (files: File[]) => {
    if (files.length === 0) {
      return;
    }

    const existingIds = new Set(
      selectedImagesRef.current.map((image) => image.id),
    );
    const filesToUpload = files
      .map((file) => ({ file, imageId: buildImageId(file) }))
      .filter(({ imageId }) => !existingIds.has(imageId));

    if (filesToUpload.length === 0) {
      toast.info("Esas imagenes ya estaban agregadas.");
      return;
    }

    const uploadedUrls: string[] = [];
    const nextImages: AdminProductFormImage[] = [];

    try {
      setIsSyncingImages(true);

      for (const { file, imageId } of filesToUpload) {
        const uploadedImage = await uploadProductImage(file, imageId);

        uploadedUrls.push(uploadedImage.url);
        nextImages.push({
          id: imageId,
          kind: "new",
          previewUrl: uploadedImage.url,
          name: file.name,
          sizeBytes: file.size,
          sourceUrl: uploadedImage.url,
          appliesToAllColors: true,
          assignedColorIds: [],
        });
      }

      setSelectedImages((currentImages) => [...currentImages, ...nextImages]);
    } catch (error) {
      await deleteTemporaryProductImages(uploadedUrls).catch(() => undefined);
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudieron subir las imagenes.",
      );
    } finally {
      setIsSyncingImages(false);
    }
  };

  const handleMoveImage = (
    imageId: string,
    direction: "backward" | "forward",
  ) => {
    setSelectedImages((currentImages) => {
      const imageIndex = currentImages.findIndex((image) => image.id === imageId);

      if (imageIndex === -1) {
        return currentImages;
      }

      const nextIndex = direction === "backward" ? imageIndex - 1 : imageIndex + 1;

      return moveItem(currentImages, imageIndex, nextIndex);
    });
  };

  const handleRemoveImage = async (imageId: string) => {
    const imageToRemove = selectedImagesRef.current.find(
      (image) => image.id === imageId,
    );

    if (!imageToRemove) {
      return;
    }

    try {
      setIsSyncingImages(true);

      if (isUploadedNewImage(imageToRemove)) {
        await deleteTemporaryProductImages([imageToRemove.sourceUrl]);
      }

      revokeImagePreview(imageToRemove);
      setSelectedImages((currentImages) =>
        currentImages.filter((image) => image.id !== imageId),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la imagen.",
      );
    } finally {
      setIsSyncingImages(false);
    }
  };

  const clearSelectedImages = async () => {
    const currentImages = selectedImagesRef.current;
    const uploadedImageUrls = currentImages
      .filter(isUploadedNewImage)
      .map((image) => image.sourceUrl);

    try {
      setIsSyncingImages(true);
      await deleteTemporaryProductImages(uploadedImageUrls);

      currentImages.forEach(revokeImagePreview);
      setSelectedImages([]);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudieron limpiar las imagenes.",
      );
    } finally {
      setIsSyncingImages(false);
    }
  };

  const handleBrandSelect = (value: string) => {
    if (value === ADD_BRAND_VALUE) {
      setIsBrandModalOpen(true);
      return;
    }

    handleInputChange("brand", value);
  };

  const handleCreateBrand = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedBrand = newBrandName.trim();

    if (!trimmedBrand) {
      toast.error("Ingresa un nombre de marca.");
      return;
    }

    const existingBrand = brandOptions.find(
      (brand) => brand.toLowerCase() === trimmedBrand.toLowerCase(),
    );

    if (existingBrand) {
      handleInputChange("brand", existingBrand);
      setIsBrandModalOpen(false);
      setNewBrandName("");
      toast.info("La marca ya existia y fue seleccionada.");
      return;
    }

    try {
      setIsCreatingBrand(true);

      const response = await fetch("/api/admin/brands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmedBrand }),
      });

      const result = (await response.json().catch(() => null)) as {
        message?: string;
        brand?: { name: string };
      } | null;

      if (!response.ok || !result?.brand?.name) {
        throw new Error(result?.message ?? "No se pudo crear la marca.");
      }

      const createdBrandName = result.brand.name;

      setBrandOptions((currentBrands) =>
        sortBrands([...currentBrands, createdBrandName]),
      );
      handleInputChange("brand", createdBrandName);
      setIsBrandModalOpen(false);
      setNewBrandName("");
      toast.success("Marca creada correctamente.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo crear la marca.",
      );
    } finally {
      setIsCreatingBrand(false);
    }
  };

  const handleCreateCategory = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const trimmedName = categoryFormValues.name.trim();
    const trimmedSlug = categoryFormValues.slug.trim();
    const trimmedDescription = categoryFormValues.description.trim();

    if (!trimmedName) {
      toast.error("Ingresa un nombre para la categoria.");
      return;
    }

    const existingCategory = categoryOptions.find(
      (category) => category.name.toLowerCase() === trimmedName.toLowerCase(),
    );

    if (existingCategory) {
      handleInputChange("primaryCategoryId", existingCategory.id);
      setIsCategoryModalOpen(false);
      setCategoryFormValues(createEmptyCategoryForm());
      toast.info("La categoria ya existia y fue seleccionada.");
      return;
    }

    try {
      setIsCreatingCategory(true);

      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          slug: trimmedSlug || undefined,
          description: trimmedDescription || undefined,
        }),
      });

      const result = (await response.json().catch(() => null)) as {
        message?: string;
        category?: AdminManagedCategory;
      } | null;

      if (!response.ok || !result?.category) {
        throw new Error(result?.message ?? "No se pudo crear la categoria.");
      }

      const createdCategoryOption = mapManagedCategoryToOption(result.category);

      setCategoryOptions((currentCategories) =>
        sortCategoryOptions([...currentCategories, createdCategoryOption]),
      );
      handleInputChange("primaryCategoryId", createdCategoryOption.id);
      setIsCategoryModalOpen(false);
      setCategoryFormValues(createEmptyCategoryForm());
      toast.success("Categoria creada correctamente.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo crear la categoria.",
      );
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleAddColor = (rawLabel: string, rawColorValue: string) => {
    const normalizedLabel = normalizeTextValue(rawLabel);

    if (!normalizedLabel) {
      return;
    }

    const existingColor = productColors.find(
      (color) => color.label.toLocaleLowerCase("es") === normalizedLabel.toLocaleLowerCase("es"),
    );

    if (existingColor) {
      setPrimaryColorId((currentPrimaryColorId) =>
        currentPrimaryColorId ?? resolvePrimaryColorId(productColors, existingColor.label),
      );
      setColorDraftLabel("");
      setColorDraftValue(existingColor.colorValue);
      toast.info("Ese color ya fue agregado.");
      return;
    }

    const nextColors = [
      ...productColors,
      {
        id: createClientStateId("color"),
        label: normalizedLabel,
        colorValue: resolveProductColorValue(normalizedLabel, rawColorValue),
        available: true,
      },
    ];

    setProductColors(nextColors);
    setPrimaryColorId(resolvePrimaryColorId(nextColors, normalizedLabel));
    setColorDraftLabel("");
    setColorDraftValue(DEFAULT_COLOR_PICKER_VALUE);
  };

  const handleRemoveColor = (colorId: string) => {
    const nextColors = productColors.filter((color) => color.id !== colorId);
    const currentPrimaryLabel = productColors.find(
      (color) => color.id === primaryColorId,
    )?.label;

    setProductColors(nextColors);
    setPrimaryColorId(
      resolvePrimaryColorId(
        nextColors,
        colorId === primaryColorId ? null : currentPrimaryLabel,
      ),
    );
  };

  const handleColorAvailabilityChange = (colorId: string, available: boolean) => {
    const nextColors = productColors.map((color) =>
      color.id === colorId ? { ...color, available } : color,
    );
    const currentPrimaryLabel = productColors.find(
      (color) => color.id === primaryColorId,
    )?.label;

    setProductColors(nextColors);
    setPrimaryColorId(
      resolvePrimaryColorId(nextColors, currentPrimaryLabel),
    );
  };

  const handleColorLabelChange = (colorId: string, value: string) => {
    const normalizedLabel = value.replace(/\s+/g, " ");
    const currentPrimaryLabel = productColors.find(
      (color) => color.id === primaryColorId,
    )?.label;
    const nextColors = productColors.map((color) =>
      color.id === colorId ? { ...color, label: normalizedLabel } : color,
    );

    setProductColors(nextColors);
    setPrimaryColorId(
      resolvePrimaryColorId(
        nextColors,
        colorId === primaryColorId ? normalizedLabel : currentPrimaryLabel,
      ),
    );
  };

  const handleColorValueChange = (colorId: string, colorValue: string) => {
    setProductColors((currentColors) =>
      currentColors.map((color) =>
        color.id === colorId ? { ...color, colorValue } : color,
      ),
    );
  };

  const handleAddReview = () => {
    setProductReviews((currentReviews) => [
      ...currentReviews,
      createEmptyReview(),
    ]);
  };

  const handleReviewChange = <Key extends keyof ProductReviewState>(
    reviewId: string,
    key: Key,
    value: ProductReviewState[Key],
  ) => {
    setProductReviews((currentReviews) =>
      currentReviews.map((review) =>
        review.id === reviewId ? { ...review, [key]: value } : review,
      ),
    );
  };

  const handleRemoveReview = (reviewId: string) => {
    setProductReviews((currentReviews) =>
      currentReviews.filter((review) => review.id !== reviewId),
    );
  };

  const handleSetPrimaryColor = (colorId: string) => {
    setPrimaryColorId(colorId);
  };

  const handleImageVisibilityModeChange = (
    imageId: string,
    appliesToAllColors: boolean,
  ) => {
    setSelectedImages((currentImages) =>
      currentImages.map((image) => {
        if (image.id !== imageId) {
          return image;
        }

        if (appliesToAllColors) {
          return {
            ...image,
            appliesToAllColors: true,
            assignedColorIds: [],
          };
        }

        const fallbackColorId = selectedPrimaryColor?.id ?? productColors[0]?.id;

        return {
          ...image,
          appliesToAllColors: false,
          assignedColorIds: fallbackColorId ? [fallbackColorId] : [],
        };
      }),
    );
  };

  const handleImageColorAssignmentChange = (
    imageId: string,
    colorId: string,
    checked: boolean,
  ) => {
    setSelectedImages((currentImages) =>
      currentImages.map((image) => {
        if (image.id !== imageId) {
          return image;
        }

        const assignedColorIds = checked
          ? sortAssignedColorIds([...image.assignedColorIds, colorId], productColors)
          : image.assignedColorIds.filter((assignedColorId) => assignedColorId !== colorId);

        if (assignedColorIds.length === 0) {
          return {
            ...image,
            appliesToAllColors: true,
            assignedColorIds: [],
          };
        }

        return {
          ...image,
          appliesToAllColors: false,
          assignedColorIds,
        };
      }),
    );
  };

  const handleCancel = async () => {
    const uploadedImageUrls = selectedImagesRef.current
      .filter(isUploadedNewImage)
      .map((image) => image.sourceUrl);

    try {
      setIsSyncingImages(true);
      await deleteTemporaryProductImages(uploadedImageUrls);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudieron limpiar las imagenes temporales.",
      );
    } finally {
      setIsSyncingImages(false);
    }

    startTransition(() => {
      router.push("/admin/products");
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSyncingImages) {
      toast.info("Espera a que terminen de sincronizarse las imagenes.");
      return;
    }

    if (!formValues.primaryCategoryId) {
      toast.error("Debes seleccionar una categoria principal.");
      return;
    }

    if (selectedImages.length === 0) {
      toast.error("Debes agregar al menos una imagen del producto.");
      return;
    }

    if (
      formValues.featuredRank.trim() &&
      !/^[1-9]\d*$/.test(formValues.featuredRank.trim())
    ) {
      toast.error("El orden destacado debe ser un numero entero mayor a cero.");
      return;
    }

    const seenColorLabels = new Set<string>();

    for (const color of productColors) {
      const normalizedLabel = normalizeTextValue(color.label);

      if (!normalizedLabel) {
        toast.error("Cada color debe tener un nombre.");
        return;
      }

      const key = normalizedLabel.toLocaleLowerCase("es");

      if (seenColorLabels.has(key)) {
        toast.error("No puedes repetir nombres de color en el mismo producto.");
        return;
      }

      seenColorLabels.add(key);
    }

    const invalidSpecificImage = selectedImages.find(
      (image) => !image.appliesToAllColors && image.assignedColorIds.length === 0,
    );

    if (invalidSpecificImage) {
      toast.error("Cada imagen especifica debe tener al menos un color asignado.");
      return;
    }

    if (
      productColors.length > 0 &&
      !selectedImages.some((image) => image.appliesToAllColors)
    ) {
      const uncoveredColors = productColors.filter(
        (color) =>
          !selectedImages.some((image) => image.assignedColorIds.includes(color.id)),
      );

      if (uncoveredColors.length > 0) {
        toast.error(
          `Cada color debe tener al menos una imagen asignada o existir una imagen global. Faltan: ${uncoveredColors
            .map((color) => normalizeTextValue(color.label))
            .join(", ")}.`,
        );
        return;
      }
    }

    const reviewValidationError = validateAdminProductReviews(
      normalizedProductReviews,
    );

    if (reviewValidationError) {
      toast.error(reviewValidationError);
      return;
    }

    const payload = new FormData();

    payload.append("name", formValues.name);
    payload.append("brand", formValues.brand);
    payload.append("primaryCategoryId", formValues.primaryCategoryId);
    payload.append("categoryLabels", JSON.stringify(formValues.categoryLabels));
    payload.append("priceUsd", formValues.priceUsd);
    payload.append("priceVes", formValues.priceVes);
    payload.append("stock", formValues.stock);
    payload.append("status", formValues.status);
    payload.append("featuredRank", formValues.featuredRank.trim());
    payload.append("description", formValues.description);
    payload.append(
      "colors",
      JSON.stringify(
        productColors.map((color) => ({
          id: color.id,
          label: normalizeTextValue(color.label),
          colorValue: resolveProductColorValue(color.label, color.colorValue),
          available: color.available,
        } satisfies AdminProductEditorColor)),
      ),
    );
    payload.append(
      "imageColorAssignments",
      JSON.stringify(
        selectedImages.map((image) => ({
          imageId: image.id,
          appliesToAllColors: image.appliesToAllColors,
          colorIds: image.appliesToAllColors ? [] : image.assignedColorIds,
        })),
      ),
    );
    payload.append("primaryColor", selectedPrimaryColor?.label ?? "");

    const retainedImageUrls = selectedImages
      .filter(
        (
          image,
        ): image is AdminProductFormImage & {
          kind: "existing";
          sourceUrl: string;
        } => image.kind === "existing" && typeof image.sourceUrl === "string",
      )
      .map((image) => image.sourceUrl);

    payload.append("retainedImageUrls", JSON.stringify(retainedImageUrls));
    payload.append(
      "imageOrder",
      JSON.stringify(
        selectedImages.map((image) => ({
          id: image.id,
          kind: image.kind,
          ...(image.sourceUrl
            ? { sourceUrl: image.sourceUrl }
            : {}),
        })),
      ),
    );
    payload.append(
      "uploadedImages",
      JSON.stringify(
        selectedImages
          .filter(isUploadedNewImage)
          .map((image) => ({
            id: image.id,
            url: image.sourceUrl,
          })),
      ),
    );
    payload.append("reviews", JSON.stringify(normalizedProductReviews));

    try {
      setIsSubmitting(true);

      const endpoint =
        mode === "create"
          ? "/api/admin/products"
          : `/api/admin/products/${initialProduct?.id ?? ""}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(endpoint, {
        method,
        body: payload,
      });

      const result = (await response.json().catch(() => null)) as {
        message?: string;
        resetUploadedImages?: boolean;
      } | null;

      if (!response.ok) {
        if (result?.resetUploadedImages) {
          setSelectedImages((currentImages) =>
            currentImages.filter((image) => {
              if (image.kind === "existing") {
                return true;
              }

              revokeImagePreview(image);
              return false;
            }),
          );
          toast.info(
            "Las imagenes nuevas se limpiaron despues del error. Debes subirlas otra vez.",
          );
        }

        throw new Error(result?.message ?? "No se pudo guardar el producto.");
      }

      toast.success(
        mode === "create"
          ? "Producto creado correctamente."
          : "Producto actualizado correctamente.",
      );
      startTransition(() => {
        router.push("/admin/products");
        router.refresh();
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el producto.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "create" ? "Crear producto" : "Editar producto"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nombre del producto
                </label>
                <Input
                  id="name"
                  value={formValues.name}
                  onChange={(event) =>
                    handleInputChange("name", event.target.value)
                  }
                  placeholder="Ingresa el nombre del producto"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="brand" className="text-sm font-medium">
                  Marca
                </label>
                <Select
                  value={formValues.brand || undefined}
                  onValueChange={handleBrandSelect}
                >
                  <SelectTrigger
                    id="brand"
                    className="w-full"
                    aria-label="Marca"
                  >
                    <SelectValue placeholder="Selecciona una marca" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    {brandOptions.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                    <SelectItem value={ADD_BRAND_VALUE}>
                      + Agregar marca...
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Selecciona una marca existente o agrega una nueva desde el
                  modal.
                </p>
              </div>
              <div className="md:col-span-2">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label htmlFor="primary-category" className="text-sm font-medium">
                    Categoria principal
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="sm:self-start"
                    onClick={() => setIsCategoryModalOpen(true)}
                    disabled={isBusy}
                  >
                    Anadir una nueva categoria
                  </Button>
                </div>
                <Select
                  value={formValues.primaryCategoryId || undefined}
                  onValueChange={(value) =>
                    handleInputChange("primaryCategoryId", value)
                  }
                  disabled={categoryOptions.length === 0 || isBusy}
                >
                  <SelectTrigger
                    id="primary-category"
                    className="mt-2 w-full"
                    aria-label="Categoria principal"
                  >
                    <SelectValue placeholder="Selecciona una categoria" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    {categoryOptions.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {categoryOptions.length === 0 ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Primero crea una categoria desde este formulario o gestionala en
                    {" "}
                    <Link href="/admin/categories" className="underline underline-offset-2">
                      Categorias
                    </Link>
                    .
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Esta categoria define la clasificacion principal del producto. Si no existe todavia, puedes anadirla sin salir de esta vista.
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <AdminTagInput
                  id="category-labels"
                  label="Badges de categoria"
                  values={formValues.categoryLabels}
                  suggestions={categorySuggestions}
                  placeholder="Escribe una etiqueta y usa coma para agregarla"
                  helperText="Estas etiquetas adicionales se guardan como badges del producto. Tambien veras abajo badges ya usados en otros productos para reutilizarlos rapido."
                  onChange={(values) => handleInputChange("categoryLabels", values)}
                />
              </div>
              <div className="space-y-4 rounded-xl border border-border/70 bg-muted/20 p-4 md:col-span-2">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Producto destacado</label>
                    <p className="text-xs text-muted-foreground">
                      Activa esta opcion para mostrar el producto en la seccion de destacados de la portada.
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Checkbox
                      checked={isFeaturedProduct}
                      onCheckedChange={(checked) =>
                        handleFeaturedToggle(checked === true)
                      }
                      disabled={isBusy}
                    />
                    Mostrar en destacados
                  </label>
                </div>
                <div className="space-y-2 sm:max-w-xs">
                  <label htmlFor="featured-rank" className="text-sm font-medium">
                    Orden en destacados
                  </label>
                  <Input
                    id="featured-rank"
                    type="number"
                    min="1"
                    step="1"
                    value={formValues.featuredRank}
                    onChange={(event) =>
                      handleInputChange("featuredRank", event.target.value)
                    }
                    placeholder="1"
                    disabled={isBusy || !isFeaturedProduct}
                  />
                  <p className="text-xs text-muted-foreground">
                    Usa numeros ascendentes. El producto con orden 1 aparece primero.
                  </p>
                </div>
              </div>
              <div className="space-y-4 rounded-xl border border-border/70 bg-muted/20 p-4 md:col-span-2">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <label htmlFor="product-colors" className="text-sm font-medium">
                      Colores
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Este bloque es opcional. Si el producto tiene colores o acabados, define el nombre y el valor real del color para usarlo en el storefront y en los filtros.
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/admin/colors">Biblioteca de colores</Link>
                  </Button>
                </div>
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_130px_auto] md:items-end">
                  <div className="flex-1 space-y-2">
                    <label htmlFor="product-colors" className="text-xs font-medium text-muted-foreground">
                      Nombre del color
                    </label>
                    <Input
                      id="product-colors"
                      value={colorDraftLabel}
                      placeholder="Ejemplo: Rojo imperial"
                      onChange={(event) => setColorDraftLabel(event.target.value)}
                      onKeyDown={(event) => {
                        if (["Enter", "Tab", ","].includes(event.key)) {
                          event.preventDefault();
                          handleAddColor(colorDraftLabel, colorDraftValue);
                        }
                      }}
                      onBlur={() => handleAddColor(colorDraftLabel, colorDraftValue)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="product-color-value" className="text-xs font-medium text-muted-foreground">
                      Valor del color
                    </label>
                    <div className="flex h-10 items-center gap-3 rounded-md border border-input bg-background px-3">
                      <input
                        id="product-color-value"
                        type="color"
                        value={colorDraftValue}
                        onChange={(event) => setColorDraftValue(event.target.value)}
                        className="h-6 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
                        aria-label="Valor del color"
                      />
                      <span className="text-xs font-medium uppercase text-muted-foreground">
                        {colorDraftValue}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAddColor(colorDraftLabel, colorDraftValue)}
                    disabled={isBusy}
                  >
                    Agregar color
                  </Button>
                </div>
                {visibleColorSuggestions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {visibleColorSuggestions.map((suggestion) => (
                      <Button
                        key={`${suggestion.label}-${suggestion.colorValue}`}
                        type="button"
                        variant="outline"
                        size="xs"
                        className="rounded-full"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() =>
                          handleAddColor(suggestion.label, suggestion.colorValue)
                        }
                        disabled={isBusy}
                      >
                        <span
                          className="mr-2 h-3 w-3 rounded-full border border-black/10"
                          style={{ backgroundColor: suggestion.colorValue }}
                          aria-hidden="true"
                        />
                        {suggestion.label}
                      </Button>
                    ))}
                  </div>
                ) : null}
                {productColors.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Este producto no tiene colores configurados todavia.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {productColors.map((color) => {
                      const isPrimaryColor = primaryColorId === color.id;

                      return (
                        <div
                          key={color.id}
                          className="grid gap-4 rounded-xl border border-border/70 bg-background px-4 py-4 lg:grid-cols-[minmax(0,1fr)_200px_auto]"
                        >
                          <div className="min-w-0 space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">
                              Nombre
                            </label>
                            <div className="flex items-center gap-3">
                              <span
                                className="h-5 w-5 shrink-0 rounded-full border border-black/10"
                                style={{ backgroundColor: color.colorValue }}
                                aria-hidden="true"
                              />
                              <Input
                                value={color.label}
                                onChange={(event) =>
                                  handleColorLabelChange(color.id, event.target.value)
                                }
                                placeholder="Nombre del color"
                                disabled={isBusy}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {isPrimaryColor
                                ? "Este color se mostrara como principal en el storefront."
                                : color.available
                                  ? "Disponible para seleccion en el producto."
                                  : "No disponible por ahora."}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">
                              Valor real
                            </label>
                            <div className="flex h-10 items-center gap-3 rounded-md border border-input bg-background px-3">
                              <input
                                type="color"
                                value={color.colorValue}
                                onChange={(event) =>
                                  handleColorValueChange(color.id, event.target.value)
                                }
                                className="h-6 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
                                aria-label={`Valor del color ${color.label}`}
                                disabled={isBusy}
                              />
                              <span className="text-xs font-medium uppercase text-muted-foreground">
                                {color.colorValue}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                            <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                              <Checkbox
                                checked={color.available}
                                onCheckedChange={(checked) =>
                                  handleColorAvailabilityChange(color.id, checked === true)
                                }
                                disabled={isBusy}
                              />
                              Disponible
                            </label>
                            <Button
                              type="button"
                              variant={isPrimaryColor ? "default" : "outline"}
                              size="xs"
                              className="rounded-full"
                              onClick={() => handleSetPrimaryColor(color.id)}
                              disabled={isBusy || !color.available || isPrimaryColor}
                            >
                              {isPrimaryColor ? "Color principal" : "Marcar principal"}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="xs"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleRemoveColor(color.id)}
                              disabled={isBusy}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="price-usd" className="text-sm font-medium">
                  Precio USD
                </label>
                <Input
                  id="price-usd"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formValues.priceUsd}
                  onChange={(event) => handleUsdPriceChange(event.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="price-ves" className="text-sm font-medium">
                    Precio VES
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      asChild
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto px-0 text-xs"
                    >
                      <Link href="/admin/exchange-rates">Gestionar tasa</Link>
                    </Button>
                    {latestExchangeRate ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto px-0 text-xs"
                        onClick={applyCurrentExchangeRate}
                      >
                        Usar tasa actual
                      </Button>
                    ) : null}
                  </div>
                </div>
                <Input
                  id="price-ves"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formValues.priceVes}
                  onChange={(event) => handleVesPriceChange(event.target.value)}
                  placeholder="0.00"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {latestExchangeRate
                    ? `Referencia actual: 1 USD = ${formatExchangeRate(latestExchangeRate.rate)} VES.`
                    : "Ingresa el precio en bolivares manualmente o registra una tasa activa para autocalcularlo."}
                </p>
              </div>
              <div className="space-y-2">
                <label htmlFor="stock" className="text-sm font-medium">
                  Inventario
                </label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formValues.stock}
                  onChange={(event) =>
                    handleInputChange("stock", event.target.value)
                  }
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Estado
                </label>
                <select
                  id="status"
                  value={formValues.status}
                  onChange={(event) =>
                    handleInputChange(
                      "status",
                      event.target.value as ProductStatus,
                    )
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="active">Activo</option>
                  <option value="draft">Borrador</option>
                  <option value="archived">Archivado</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <AdminProductImageUploader
                  images={selectedImages}
                  availableColors={productColors.map((color) => ({
                    id: color.id,
                    label: color.label,
                    colorValue: color.colorValue,
                  }))}
                  onAddImages={handleAddImages}
                  onMoveImage={handleMoveImage}
                  onRemoveImage={handleRemoveImage}
                  onImageVisibilityModeChange={handleImageVisibilityModeChange}
                  onImageColorAssignmentChange={handleImageColorAssignmentChange}
                  onClear={clearSelectedImages}
                  isSyncing={isSyncingImages}
                  disabled={isBusy}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Descripcion
                </label>
                <AdminMarkdownEditor
                  value={formValues.description}
                  onChange={(value) => handleInputChange("description", value)}
                  placeholder="Escribe la descripcion en markdown. Puedes usar titulos, listas, enlaces, negritas y mas."
                />
                <p className="text-xs text-muted-foreground">
                  La descripcion se guarda en markdown para que tambien pueda
                  renderizarse en la tienda.
                </p>
              </div>
              <div className="space-y-4 rounded-xl border border-border/70 bg-muted/20 p-4 md:col-span-2">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Resenas</label>
                    <p className="text-xs text-muted-foreground">
                      Agrega resenas manuales para este producto. Solo las
                      publicadas actualizan la calificacion visible en la tienda.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddReview}
                    disabled={isBusy}
                  >
                    Agregar resena
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-border/70 bg-background px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Publicadas
                    </p>
                    <p className="mt-1 text-2xl font-semibold">
                      {publishedReviewSummary.reviewCount}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/70 bg-background px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      No publicadas
                    </p>
                    <p className="mt-1 text-2xl font-semibold">
                      {unpublishedReviewCount}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/70 bg-background px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Promedio visible
                    </p>
                    <p className="mt-1 text-2xl font-semibold">
                      {publishedReviewSummary.averageRating.toFixed(1)}
                    </p>
                  </div>
                </div>
                {productReviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Este producto todavia no tiene resenas configuradas en el
                    panel administrativo.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {productReviews.map((review, index) => (
                      <div
                        key={review.id}
                        className="space-y-4 rounded-xl border border-border/70 bg-background p-4"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-sm font-medium">
                              Resena {index + 1}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Registrada el {formatReviewDate(review.createdAt)}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleRemoveReview(review.id)}
                            disabled={isBusy}
                          >
                            Eliminar
                          </Button>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_140px]">
                          <div className="space-y-2">
                            <label
                              htmlFor={`reviewer-${review.id}`}
                              className="text-xs font-medium text-muted-foreground"
                            >
                              Nombre del cliente
                            </label>
                            <Input
                              id={`reviewer-${review.id}`}
                              value={review.reviewerName}
                              onChange={(event) =>
                                handleReviewChange(
                                  review.id,
                                  "reviewerName",
                                  event.target.value,
                                )
                              }
                              placeholder="Ejemplo: Maria G."
                              disabled={isBusy}
                            />
                          </div>
                          <div className="space-y-2">
                            <label
                              htmlFor={`review-title-${review.id}`}
                              className="text-xs font-medium text-muted-foreground"
                            >
                              Titulo
                            </label>
                            <Input
                              id={`review-title-${review.id}`}
                              value={review.title}
                              onChange={(event) =>
                                handleReviewChange(
                                  review.id,
                                  "title",
                                  event.target.value,
                                )
                              }
                              placeholder="Resumen corto de la experiencia"
                              disabled={isBusy}
                            />
                          </div>
                          <div className="space-y-2">
                            <label
                              htmlFor={`review-rating-${review.id}`}
                              className="text-xs font-medium text-muted-foreground"
                            >
                              Calificacion
                            </label>
                            <select
                              id={`review-rating-${review.id}`}
                              value={String(review.rating)}
                              onChange={(event) =>
                                handleReviewChange(
                                  review.id,
                                  "rating",
                                  Number(event.target.value),
                                )
                              }
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              disabled={isBusy}
                            >
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <option key={rating} value={rating}>
                                  {rating} estrella{rating === 1 ? "" : "s"}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor={`review-body-${review.id}`}
                            className="text-xs font-medium text-muted-foreground"
                          >
                            Comentario
                          </label>
                          <textarea
                            id={`review-body-${review.id}`}
                            className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-6"
                            value={review.body}
                            onChange={(event) =>
                              handleReviewChange(
                                review.id,
                                "body",
                                event.target.value,
                              )
                            }
                            placeholder="Describe la experiencia del cliente con el producto."
                            disabled={isBusy}
                          />
                        </div>
                        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <Checkbox
                            checked={review.isPublished}
                            onCheckedChange={(checked) =>
                              handleReviewChange(
                                review.id,
                                "isPublished",
                                checked === true,
                              )
                            }
                            disabled={isBusy}
                          />
                          Publicar en la tienda
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isBusy}>
                {isSubmitting
                  ? mode === "create"
                    ? "Guardando producto..."
                    : "Actualizando producto..."
                  : mode === "create"
                    ? "Crear producto"
                    : "Guardar cambios"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isBusy}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anadir una nueva categoria</DialogTitle>
            <DialogDescription>
              Crea la categoria principal sin salir del formulario del producto.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="new-category-name" className="text-sm font-medium">
                Nombre de la categoria
              </label>
              <Input
                id="new-category-name"
                value={categoryFormValues.name}
                onChange={(event) =>
                  handleCategoryFormChange("name", event.target.value)
                }
                placeholder="Ejemplo: Carbones"
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="new-category-slug" className="text-sm font-medium">
                Slug
              </label>
              <Input
                id="new-category-slug"
                value={categoryFormValues.slug}
                onChange={(event) =>
                  handleCategoryFormChange("slug", event.target.value)
                }
                placeholder="carbones"
              />
              <p className="text-xs text-muted-foreground">
                Puedes dejarlo vacio para generarlo automaticamente.
              </p>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="new-category-description"
                className="text-sm font-medium"
              >
                Descripcion
              </label>
              <textarea
                id="new-category-description"
                className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-6"
                value={categoryFormValues.description}
                onChange={(event) =>
                  handleCategoryFormChange("description", event.target.value)
                }
                placeholder="Describe brevemente que incluye esta categoria."
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setCategoryFormValues(createEmptyCategoryForm());
                }}
                disabled={isCreatingCategory}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreatingCategory}>
                {isCreatingCategory
                  ? "Guardando categoria..."
                  : "Guardar categoria"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isBrandModalOpen} onOpenChange={setIsBrandModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar marca</DialogTitle>
            <DialogDescription>
              Crea una nueva marca sin salir del formulario del producto.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateBrand} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="new-brand-name" className="text-sm font-medium">
                Nombre de la marca
              </label>
              <Input
                id="new-brand-name"
                value={newBrandName}
                onChange={(event) => setNewBrandName(event.target.value)}
                placeholder="Ejemplo: Breville"
                required
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsBrandModalOpen(false);
                  setNewBrandName("");
                }}
                disabled={isCreatingBrand}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreatingBrand}>
                {isCreatingBrand ? "Guardando marca..." : "Guardar marca"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
