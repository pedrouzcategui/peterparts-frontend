import type { AdminProductEditorReview } from "@/lib/admin-data";

function normalizeInlineText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeMultilineText(value: string) {
  return value.trim();
}

function normalizeCreatedAt(value: string) {
  const parsedValue = new Date(value);

  if (Number.isNaN(parsedValue.getTime())) {
    return new Date().toISOString();
  }

  return parsedValue.toISOString();
}

function normalizeRating(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round(value);
}

export function normalizeAdminProductReviews(
  values: AdminProductEditorReview[],
) {
  return values.map((value, index) => ({
    id: value.id.trim() || `review-${index + 1}`,
    reviewerName: normalizeInlineText(value.reviewerName),
    title: normalizeInlineText(value.title),
    body: normalizeMultilineText(value.body),
    rating: normalizeRating(value.rating),
    isPublished: value.isPublished !== false,
    createdAt: normalizeCreatedAt(value.createdAt),
  } satisfies AdminProductEditorReview));
}

export function parseAdminProductReviews(rawValue: string) {
  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return normalizeAdminProductReviews(
      parsedValue
        .filter(
          (value): value is {
            id?: unknown;
            reviewerName?: unknown;
            title?: unknown;
            body?: unknown;
            rating?: unknown;
            isPublished?: unknown;
            createdAt?: unknown;
          } => Boolean(value) && typeof value === "object",
        )
        .map((value) => ({
          id: typeof value.id === "string" ? value.id : "",
          reviewerName:
            typeof value.reviewerName === "string" ? value.reviewerName : "",
          title: typeof value.title === "string" ? value.title : "",
          body: typeof value.body === "string" ? value.body : "",
          rating: typeof value.rating === "number" ? value.rating : 0,
          isPublished: value.isPublished !== false,
          createdAt:
            typeof value.createdAt === "string"
              ? value.createdAt
              : new Date().toISOString(),
        } satisfies AdminProductEditorReview)),
    );
  } catch {
    return [];
  }
}

export function validateAdminProductReviews(
  reviews: AdminProductEditorReview[],
) {
  const missingReviewer = reviews.find((review) => review.reviewerName.length === 0);

  if (missingReviewer) {
    return "Cada reseña debe incluir el nombre de quien comenta.";
  }

  const invalidRating = reviews.find(
    (review) => review.rating < 1 || review.rating > 5,
  );

  if (invalidRating) {
    return "Cada reseña debe tener una calificacion entre 1 y 5 estrellas.";
  }

  return null;
}

export function summarizePublishedProductReviews(
  reviews: AdminProductEditorReview[],
) {
  const publishedReviews = reviews.filter((review) => review.isPublished);
  const reviewCount = publishedReviews.length;

  if (reviewCount === 0) {
    return {
      averageRating: 0,
      reviewCount: 0,
    };
  }

  const totalRating = publishedReviews.reduce(
    (sum, review) => sum + review.rating,
    0,
  );

  return {
    averageRating: Math.round((totalRating / reviewCount) * 100) / 100,
    reviewCount,
  };
}