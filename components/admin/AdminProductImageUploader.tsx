"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PRODUCT_IMAGE_CONTENT_TYPES } from "@/lib/product-image-storage";
import { cn } from "@/lib/utils";

export interface AdminProductFormImage {
  id: string;
  kind: "existing" | "new";
  previewUrl: string;
  name: string;
  sizeBytes?: number;
  file?: File;
  sourceUrl?: string;
  appliesToAllColors: boolean;
  assignedColorIds: string[];
}

interface AdminProductImageColorOption {
  id: string;
  label: string;
  colorValue: string;
}

interface AdminProductImageUploaderProps {
  images: AdminProductFormImage[];
  availableColors: AdminProductImageColorOption[];
  onAddImages: (files: File[]) => void;
  onMoveImage: (imageId: string, direction: "backward" | "forward") => void;
  onRemoveImage: (imageId: string) => void;
  onImageVisibilityModeChange: (imageId: string, appliesToAllColors: boolean) => void;
  onImageColorAssignmentChange: (
    imageId: string,
    colorId: string,
    checked: boolean,
  ) => void | Promise<void>;
  onClear: () => void | Promise<void>;
  isSyncing?: boolean;
  disabled?: boolean;
}

function formatFileSize(size: number) {
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

export default function AdminProductImageUploader({
  images,
  availableColors,
  onAddImages,
  onMoveImage,
  onRemoveImage,
  onImageVisibilityModeChange,
  onImageColorAssignmentChange,
  onClear,
  isSyncing = false,
  disabled = false,
}: AdminProductImageUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const openFilePicker = () => {
    if (disabled) {
      return;
    }

    inputRef.current?.click();
  };

  const submitFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) {
      return;
    }

    onAddImages(Array.from(fileList));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    submitFiles(event.target.files);
    event.target.value = "";
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (!disabled) {
      setIsDragActive(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const relatedTarget = event.relatedTarget;

    if (
      relatedTarget instanceof Node &&
      event.currentTarget.contains(relatedTarget)
    ) {
      return;
    }

    setIsDragActive(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);

    if (disabled) {
      return;
    }

    submitFiles(event.dataTransfer.files);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    openFilePicker();
  };

  return (
    <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-4 shadow-xs sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <label htmlFor={inputId} className="text-sm font-semibold text-foreground">
            Imagenes del producto
          </label>
          <p className="text-sm text-muted-foreground">
            Arrastra tus imagenes aqui o agregalas por lotes. Tambien puedes reordenarlas con las flechas para definir la imagen principal y su secuencia.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              openFilePicker();
            }}
            disabled={disabled}
          >
            <ImagePlus className="h-4 w-4" />
            {images.length > 0 ? "Agregar mas" : "Seleccionar imagenes"}
          </Button>
          {images.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                onClear();
              }}
              disabled={disabled}
            >
              <Trash2 className="h-4 w-4" />
              Limpiar todo
            </Button>
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={PRODUCT_IMAGE_CONTENT_TYPES.join(",")}
        multiple
        className="sr-only"
        onChange={handleInputChange}
        disabled={disabled}
      />

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={openFilePicker}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "rounded-2xl border-2 border-dashed border-border bg-muted/30 p-6 transition-colors outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:p-8",
          isDragActive && "border-primary bg-primary/5 shadow-sm",
          disabled && "cursor-not-allowed opacity-70",
          !disabled && "cursor-pointer hover:border-primary/50 hover:bg-primary/5",
        )}
        aria-label="Agregar imagenes del producto"
      >
        <div className="flex min-h-40 flex-col items-center justify-center gap-4 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Upload className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">
              Suelta las imagenes aqui
            </p>
            <p className="text-sm text-muted-foreground">
              o haz clic en este recuadro para abrir el selector y agregar mas archivos cuando quieras.
            </p>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
              PNG, JPG, WEBP o GIF · maximo 5 MB por imagen
            </p>
          </div>
          <Button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              openFilePicker();
            }}
            disabled={disabled}
          >
            <ImagePlus className="h-4 w-4" />
            {images.length > 0 ? "Agregar mas imagenes" : "Elegir imagenes"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">
          {isSyncing
            ? "Sincronizando imagenes con Vercel Blob..."
            : images.length > 0
              ? "Las imagenes nuevas se suben a Vercel Blob en cuanto las agregas."
              : "Todavia no has agregado imagenes."}
        </p>
        <p className="font-semibold text-foreground">
          {images.length === 1
            ? "1 imagen seleccionada"
            : `${images.length} imagenes seleccionadas`}
        </p>
      </div>

      {images.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="overflow-hidden rounded-xl border border-border bg-background"
            >
              <div className="relative aspect-square bg-muted">
                <Image
                  src={image.previewUrl}
                  alt={image.name}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                  className="object-cover"
                />
                <div className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-1 text-[11px] font-semibold text-foreground shadow-sm">
                  Imagen {index + 1}
                </div>
                {index === 0 ? (
                  <div className="absolute right-2 top-2 rounded-full bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground shadow-sm">
                    Principal
                  </div>
                ) : null}
              </div>
              <div className="space-y-3 p-3">
                <p className="truncate text-sm font-medium text-foreground">
                  {image.name}
                </p>
                {availableColors.length > 0 ? (
                  <div className="space-y-3 rounded-lg border border-border/70 bg-muted/20 p-3">
                    <label className="flex items-center gap-2 text-xs font-medium text-foreground">
                      <Checkbox
                        checked={image.appliesToAllColors}
                        onCheckedChange={(checked) =>
                          onImageVisibilityModeChange(image.id, checked === true)
                        }
                        disabled={disabled}
                      />
                      Mostrar en todos los colores
                    </label>
                    <div className="space-y-2">
                      {availableColors.map((color) => (
                        <label
                          key={`${image.id}-${color.id}`}
                          className={cn(
                            "flex items-center gap-2 text-xs text-muted-foreground",
                            image.appliesToAllColors && "opacity-50",
                          )}
                        >
                          <Checkbox
                            checked={image.assignedColorIds.includes(color.id)}
                            onCheckedChange={(checked) =>
                              onImageColorAssignmentChange(
                                image.id,
                                color.id,
                                checked === true,
                              )
                            }
                            disabled={disabled || image.appliesToAllColors}
                          />
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-black/10"
                            style={{ backgroundColor: color.colorValue }}
                            aria-hidden="true"
                          />
                          <span>{color.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    className="rounded-full"
                    onClick={(event) => {
                      event.stopPropagation();
                      onMoveImage(image.id, "backward");
                    }}
                    disabled={disabled || index === 0}
                    aria-label={`Mover ${image.name} antes`}
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Antes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    className="rounded-full"
                    onClick={(event) => {
                      event.stopPropagation();
                      onMoveImage(image.id, "forward");
                    }}
                    disabled={disabled || index === images.length - 1}
                    aria-label={`Mover ${image.name} despues`}
                  >
                    Despues
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    {typeof image.sizeBytes === "number"
                      ? formatFileSize(image.sizeBytes)
                      : "Imagen actual"}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    className="h-7 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={(event) => {
                      event.stopPropagation();
                      onRemoveImage(image.id);
                    }}
                    disabled={disabled}
                    aria-label={`Eliminar ${image.name}`}
                  >
                    <X className="h-3 w-3" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}