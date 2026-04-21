import "server-only";

import { cache } from "react";
import { auth } from "@/auth";
import {
  ForumVoteDirection,
  Prisma,
} from "@/lib/generated/prisma/client";
import {
  ForumThreadStatus as PrismaForumThreadStatus,
  UserRole,
} from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import {
  type ForumComment,
  type ForumSort,
  type ForumThread,
  type ForumThreadStatus,
  type ForumUser,
  type ForumVoteState,
  getFeaturedForumTags as getMockFeaturedForumTags,
  getForumFeed as getMockForumFeed,
  getThreadById as getMockThreadById,
  slugifyForumTag,
} from "@/lib/forum-data";

const FORUM_THREAD_TITLE_MIN_LENGTH = 12;
const FORUM_THREAD_CONTENT_MIN_LENGTH = 30;
const FORUM_REPLY_CONTENT_MIN_LENGTH = 6;
const FORUM_DELETED_THREAD_PLACEHOLDER = "Publicacion retirada por el autor.";
const FORUM_DELETED_REPLY_PLACEHOLDER = "Respuesta eliminada por el autor.";

type ForumThreadPathInput = {
  id: string;
  slug: string;
};

type ForumAuthorRecord = {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  createdAt: Date;
};

type ForumThreadRecord = {
  id: string;
  slug: string;
  status: PrismaForumThreadStatus;
  moderatedAt: Date | null;
  title: string;
  content: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  authorId: string;
  author: ForumAuthorRecord;
  votes?: Array<{
    direction: ForumVoteDirection;
  }>;
  _count?: {
    replies: number;
  };
};

type ForumReplyRecord = {
  id: string;
  authorId: string;
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  author: ForumAuthorRecord;
  votes?: Array<{
    direction: ForumVoteDirection;
  }>;
  thread?: {
    id: string;
    slug: string;
    status: PrismaForumThreadStatus;
    deletedAt: Date | null;
  };
};

export interface ForumCurrentUser {
  id: string;
  email: string;
  name: string;
  firstName: string | null;
  role: UserRole;
}

export interface ForumQuestionSummary {
  count: number;
  recentThreads: ForumThread[];
}

export interface CastForumVoteResult {
  upvotes: number;
  downvotes: number;
  currentUserVote: ForumVoteState;
}

export interface AdminForumThreadSummary {
  id: string;
  slug: string;
  title: string;
  preview: string;
  tags: string[];
  status: ForumThreadStatus;
  createdAt: string;
  moderatedAt: string | null;
  commentCount: number;
  isDeleted: boolean;
  authorName: string;
  authorEmail: string;
  path: string;
}

export interface AdminForumModerationData {
  pendingThreads: AdminForumThreadSummary[];
  reviewedThreads: AdminForumThreadSummary[];
  counts: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

export interface AdminForumHeaderPendingThread {
  id: string;
  title: string;
  authorName: string;
  createdAt: string;
  path: string;
}

export interface AdminForumHeaderModerationSummary {
  pendingCount: number;
  recentPendingThreads: AdminForumHeaderPendingThread[];
}

type ForumVoteTargetType = "thread" | "reply";
type ModeratableForumThreadStatus = "APPROVED" | "REJECTED";

const ADMIN_FORUM_HEADER_PENDING_THREADS_LIMIT = 5;

function isForumUnavailableError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2021" || error.code === "P2022")
  );
}

function mapForumThreadStatus(
  status: PrismaForumThreadStatus,
): ForumThreadStatus {
  if (status === PrismaForumThreadStatus.PENDING) {
    return "pending";
  }

  if (status === PrismaForumThreadStatus.REJECTED) {
    return "rejected";
  }

  return "approved";
}

function canViewForumThread({
  authorId,
  status,
  viewerId,
  viewerRole,
}: {
  authorId: string;
  status: PrismaForumThreadStatus;
  viewerId: string | null;
  viewerRole: UserRole | null;
}): boolean {
  if (status === PrismaForumThreadStatus.APPROVED) {
    return true;
  }

  if (!viewerId) {
    return false;
  }

  return viewerId === authorId || viewerRole === UserRole.ADMIN;
}

function getDisplayName(author: ForumAuthorRecord): string {
  const fullName = [author.firstName, author.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (fullName) {
    return fullName;
  }

  if (author.name?.trim()) {
    return author.name.trim();
  }

  return author.email.split("@")[0] ?? author.email;
}

function toInitials(value: string): string {
  const tokens = value.trim().split(/\s+/).filter(Boolean);

  if (tokens.length === 0) {
    return "PP";
  }

  return tokens
    .slice(0, 2)
    .map((token) => token.charAt(0).toUpperCase())
    .join("");
}

function mapForumUser(author: ForumAuthorRecord): ForumUser {
  const name = getDisplayName(author);

  return {
    id: author.id,
    name,
    initials: toInitials(name),
    joinedDate: author.createdAt.toISOString(),
  };
}

function mapVoteDirection(
  direction: ForumVoteDirection | undefined,
): ForumVoteState {
  if (direction === ForumVoteDirection.UP) {
    return "up";
  }

  if (direction === ForumVoteDirection.DOWN) {
    return "down";
  }

  return null;
}

function toForumVoteDirection(
  direction: Exclude<ForumVoteState, null>,
): ForumVoteDirection {
  return direction === "up" ? ForumVoteDirection.UP : ForumVoteDirection.DOWN;
}

function clampVoteCount(value: number): number {
  return value < 0 ? 0 : value;
}

function isForumEntryEdited({
  createdAt,
  updatedAt,
  deletedAt,
}: {
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}): boolean {
  return Boolean(deletedAt) || updatedAt.getTime() > createdAt.getTime();
}

function applyVoteCountUpdate({
  upvotes,
  downvotes,
  previousDirection,
  nextDirection,
}: {
  upvotes: number;
  downvotes: number;
  previousDirection: ForumVoteDirection | null;
  nextDirection: ForumVoteState;
}): Pick<CastForumVoteResult, "upvotes" | "downvotes"> {
  let nextUpvotes = upvotes;
  let nextDownvotes = downvotes;

  if (previousDirection === ForumVoteDirection.UP) {
    nextUpvotes -= 1;
  }

  if (previousDirection === ForumVoteDirection.DOWN) {
    nextDownvotes -= 1;
  }

  if (nextDirection === "up") {
    nextUpvotes += 1;
  }

  if (nextDirection === "down") {
    nextDownvotes += 1;
  }

  return {
    upvotes: clampVoteCount(nextUpvotes),
    downvotes: clampVoteCount(nextDownvotes),
  };
}

function mapForumReply(reply: ForumReplyRecord): ForumComment {
  return {
    id: reply.id,
    author: mapForumUser(reply.author),
    content: reply.deletedAt ? FORUM_DELETED_REPLY_PLACEHOLDER : reply.content,
    createdAt: reply.createdAt.toISOString(),
    updatedAt: reply.updatedAt.toISOString(),
    upvotes: reply.upvotes,
    downvotes: reply.downvotes,
    currentUserVote: mapVoteDirection(reply.votes?.[0]?.direction),
    isDeleted: Boolean(reply.deletedAt),
    replies: [],
  };
}

function mapForumThread(
  thread: ForumThreadRecord,
  comments?: ForumComment[],
  viewerId?: string | null,
): ForumThread {
  return {
    id: thread.id,
    slug: thread.slug,
    status: mapForumThreadStatus(thread.status),
    moderatedAt: thread.moderatedAt?.toISOString() ?? null,
    title: thread.title,
    content: thread.deletedAt ? FORUM_DELETED_THREAD_PLACEHOLDER : thread.content,
    author: mapForumUser(thread.author),
    createdAt: thread.createdAt.toISOString(),
    updatedAt: thread.updatedAt.toISOString(),
    upvotes: thread.upvotes,
    downvotes: thread.downvotes,
    currentUserVote: mapVoteDirection(thread.votes?.[0]?.direction),
    commentCount: thread._count?.replies ?? comments?.length ?? 0,
    tags: thread.tags,
    isDeleted: Boolean(thread.deletedAt),
    isEdited: isForumEntryEdited(thread),
    canEdit: !thread.deletedAt && viewerId === thread.authorId,
    canDelete: !thread.deletedAt && viewerId === thread.authorId,
    canReply:
      !thread.deletedAt && thread.status === PrismaForumThreadStatus.APPROVED,
    comments,
  };
}

function mapAdminForumThreadSummary(
  thread: ForumThreadRecord,
): AdminForumThreadSummary {
  const authorName = getDisplayName(thread.author);

  return {
    id: thread.id,
    slug: thread.slug,
    title: thread.title,
    preview: thread.content.slice(0, 220),
    tags: thread.tags,
    status: mapForumThreadStatus(thread.status),
    createdAt: thread.createdAt.toISOString(),
    moderatedAt: thread.moderatedAt?.toISOString() ?? null,
    commentCount: thread._count?.replies ?? 0,
    isDeleted: Boolean(thread.deletedAt),
    authorName,
    authorEmail: thread.author.email,
    path: buildForumThreadPath(thread),
  };
}

function getHotScore(thread: ForumThread): number {
  return thread.commentCount * 3 + thread.upvotes - thread.downvotes;
}

function sortForumThreads(threads: ForumThread[], sort: ForumSort): ForumThread[] {
  return [...threads].sort((left, right) => {
    if (sort === "new") {
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    }

    if (sort === "top") {
      return right.upvotes - right.downvotes - (left.upvotes - left.downvotes);
    }

    return getHotScore(right) - getHotScore(left);
  });
}

function normalizeForumText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function parseForumTags(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((tag) => normalizeForumText(tag))
        .filter(Boolean)
        .slice(0, 6),
    ),
  );
}

function slugifyForumThreadTitle(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function buildForumLoginRedirectPath(redirectTo: string): string {
  return `/login?redirectTo=${encodeURIComponent(redirectTo)}`;
}

export function buildForumThreadPath({
  id,
  slug,
}: ForumThreadPathInput): string {
  return `/forum/${id}/${encodeURIComponent(slug || "pregunta")}`;
}

export const getCurrentForumUser = cache(async (): Promise<ForumCurrentUser | null> => {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();

  if (!email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name:
      user.name?.trim() ||
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.email,
    firstName: user.firstName,
    role: user.role,
  };
});

export async function getForumFeedData({
  sort = "hot",
  tag,
  authorId,
}: {
  sort?: ForumSort;
  tag?: string | null;
  authorId?: string;
} = {}): Promise<ForumThread[]> {
  try {
    const currentUser = await getCurrentForumUser();
    const viewerId = currentUser?.id ?? null;
    const normalizedTag = typeof tag === "string" && tag.length > 0 ? tag : null;
    const threads = await prisma.forumThread.findMany({
      where: {
        status: PrismaForumThreadStatus.APPROVED,
        ...(authorId ? { authorId } : {}),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
        ...(viewerId
          ? {
              votes: {
                where: {
                  userId: viewerId,
                },
                select: {
                  direction: true,
                },
              },
            }
          : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const mappedThreads = threads.map((thread) =>
      mapForumThread(thread, undefined, viewerId),
    );
    const filteredThreads = normalizedTag
      ? mappedThreads.filter((thread) =>
          thread.tags.some((threadTag) => slugifyForumTag(threadTag) === normalizedTag),
        )
      : mappedThreads;

    return sortForumThreads(filteredThreads, sort);
  } catch (error) {
    if (isForumUnavailableError(error)) {
      return authorId ? [] : getMockForumFeed({ sort, tag });
    }

    throw error;
  }
}

export async function getFeaturedForumTagsData(limit = 8): Promise<string[]> {
  try {
    const threads = await prisma.forumThread.findMany({
      where: {
        status: PrismaForumThreadStatus.APPROVED,
      },
      select: {
        tags: true,
      },
    });

    const counts = new Map<string, number>();

    for (const thread of threads) {
      for (const tag of thread.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }

    return [...counts.entries()]
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .slice(0, limit)
      .map(([tagValue]) => tagValue);
  } catch (error) {
    if (isForumUnavailableError(error)) {
      return getMockFeaturedForumTags(limit);
    }

    throw error;
  }
}

export async function getRecentForumThreads(limit = 4): Promise<ForumThread[]> {
  return getForumFeedData({ sort: "new" }).then((threads) => threads.slice(0, limit));
}

export async function getForumThreadData(
  threadId: string,
): Promise<(ForumThread & { comments: ForumComment[] }) | null> {
  try {
    const currentUser = await getCurrentForumUser();
    const viewerId = currentUser?.id ?? null;
    const viewerRole = currentUser?.role ?? null;
    const thread = await prisma.forumThread.findUnique({
      where: {
        id: threadId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true,
          },
        },
        ...(viewerId
          ? {
              votes: {
                where: {
                  userId: viewerId,
                },
                select: {
                  direction: true,
                },
              },
            }
          : {}),
        replies: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                firstName: true,
                lastName: true,
                email: true,
                createdAt: true,
              },
            },
            ...(viewerId
              ? {
                  votes: {
                    where: {
                      userId: viewerId,
                    },
                    select: {
                      direction: true,
                    },
                  },
                }
              : {}),
          },
        },
      },
    });

    if (!thread) {
      return null;
    }

    if (
      !canViewForumThread({
        authorId: thread.authorId,
        status: thread.status,
        viewerId,
        viewerRole,
      })
    ) {
      return null;
    }

    const comments = thread.replies.map((reply) => mapForumReply(reply));

    return {
      ...mapForumThread(thread, comments, viewerId),
      comments,
    };
  } catch (error) {
    if (isForumUnavailableError(error)) {
      return getMockThreadById(threadId);
    }

    throw error;
  }
}

export async function getForumQuestionSummaryForUser(
  authorId: string | null | undefined,
): Promise<ForumQuestionSummary> {
  if (!authorId) {
    return {
      count: 0,
      recentThreads: [],
    };
  }

  try {
    const currentUser = await getCurrentForumUser();
    const viewerId = currentUser?.id ?? null;
    const canSeeHidden =
      currentUser?.role === UserRole.ADMIN || viewerId === authorId;
    const threads = await prisma.forumThread.findMany({
      where: {
        authorId,
        ...(canSeeHidden ? {} : { status: PrismaForumThreadStatus.APPROVED }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const mappedThreads = threads.map((thread) =>
      mapForumThread(thread, undefined, viewerId),
    );

    return {
      count: mappedThreads.length,
      recentThreads: mappedThreads.slice(0, 3),
    };
  } catch (error) {
    if (isForumUnavailableError(error)) {
      return {
        count: 0,
        recentThreads: [],
      };
    }

    throw error;
  }
}

export async function createForumThread({
  authorId,
  title,
  content,
  tags,
}: {
  authorId: string;
  title: string;
  content: string;
  tags: string;
}): Promise<ForumThreadPathInput> {
  const normalizedTitle = normalizeForumText(title);
  const normalizedContent = normalizeForumText(content);

  if (normalizedTitle.length < FORUM_THREAD_TITLE_MIN_LENGTH) {
    throw new Error("El titulo debe tener al menos 12 caracteres.");
  }

  if (normalizedContent.length < FORUM_THREAD_CONTENT_MIN_LENGTH) {
    throw new Error("La pregunta debe tener al menos 30 caracteres.");
  }

  const parsedTags = parseForumTags(tags);
  const slug = slugifyForumThreadTitle(normalizedTitle) || "pregunta";

  return prisma.forumThread.create({
    data: {
      authorId,
      slug,
      status: PrismaForumThreadStatus.PENDING,
      title: normalizedTitle,
      content: normalizedContent,
      tags: parsedTags,
    },
    select: {
      id: true,
      slug: true,
    },
  });
}

export async function createForumReply({
  authorId,
  threadId,
  content,
}: {
  authorId: string;
  threadId: string;
  content: string;
}): Promise<ForumThreadPathInput> {
  const normalizedContent = normalizeForumText(content);

  if (normalizedContent.length < FORUM_REPLY_CONTENT_MIN_LENGTH) {
    throw new Error("La respuesta debe tener al menos 6 caracteres.");
  }

  const thread = await prisma.forumThread.findUnique({
    where: {
      id: threadId,
    },
    select: {
      id: true,
      slug: true,
      status: true,
      deletedAt: true,
    },
  });

  if (!thread) {
    throw new Error("No encontramos el hilo que intentas responder.");
  }

  if (thread.deletedAt) {
    throw new Error("No puedes responder a una publicacion retirada.");
  }

  if (thread.status !== PrismaForumThreadStatus.APPROVED) {
    throw new Error("Solo puedes responder a publicaciones aprobadas.");
  }

  await prisma.forumReply.create({
    data: {
      threadId: thread.id,
      authorId,
      content: normalizedContent,
    },
  });

  return {
    id: thread.id,
    slug: thread.slug,
  };
}

export async function updateForumThread({
  authorId,
  threadId,
  title,
  content,
  tags,
}: {
  authorId: string;
  threadId: string;
  title: string;
  content: string;
  tags: string;
}): Promise<ForumThreadPathInput> {
  const normalizedTitle = normalizeForumText(title);
  const normalizedContent = normalizeForumText(content);

  if (normalizedTitle.length < FORUM_THREAD_TITLE_MIN_LENGTH) {
    throw new Error("El titulo debe tener al menos 12 caracteres.");
  }

  if (normalizedContent.length < FORUM_THREAD_CONTENT_MIN_LENGTH) {
    throw new Error("La pregunta debe tener al menos 30 caracteres.");
  }

  const existingThread = await prisma.forumThread.findUnique({
    where: {
      id: threadId,
    },
    select: {
      id: true,
      slug: true,
      authorId: true,
      deletedAt: true,
    },
  });

  if (!existingThread) {
    throw new Error("No encontramos la publicacion que intentas editar.");
  }

  if (existingThread.authorId !== authorId) {
    throw new Error("No puedes editar una publicacion que no te pertenece.");
  }

  if (existingThread.deletedAt) {
    throw new Error("No puedes editar una publicacion retirada.");
  }

  const slug = slugifyForumThreadTitle(normalizedTitle) || "pregunta";

  await prisma.forumThread.update({
    where: {
      id: existingThread.id,
    },
    data: {
      slug,
      title: normalizedTitle,
      content: normalizedContent,
      tags: parseForumTags(tags),
    },
  });

  return {
    id: existingThread.id,
    slug,
  };
}

export async function softDeleteForumThread({
  authorId,
  threadId,
}: {
  authorId: string;
  threadId: string;
}): Promise<ForumThreadPathInput> {
  const existingThread = await prisma.forumThread.findUnique({
    where: {
      id: threadId,
    },
    select: {
      id: true,
      slug: true,
      authorId: true,
      deletedAt: true,
    },
  });

  if (!existingThread) {
    throw new Error("No encontramos la publicacion que intentas retirar.");
  }

  if (existingThread.authorId !== authorId) {
    throw new Error("No puedes retirar una publicacion que no te pertenece.");
  }

  if (!existingThread.deletedAt) {
    await prisma.forumThread.update({
      where: {
        id: existingThread.id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  return {
    id: existingThread.id,
    slug: existingThread.slug,
  };
}

export async function hardDeleteForumThread({
  actorId,
  threadId,
}: {
  actorId: string;
  threadId: string;
}): Promise<void> {
  const actingUser = await prisma.user.findUnique({
    where: {
      id: actorId,
    },
    select: {
      role: true,
    },
  });

  if (!actingUser || actingUser.role !== UserRole.ADMIN) {
    throw new Error("Solo los administradores pueden eliminar publicaciones definitivamente.");
  }

  const existingThread = await prisma.forumThread.findUnique({
    where: {
      id: threadId,
    },
    select: {
      id: true,
    },
  });

  if (!existingThread) {
    throw new Error("No encontramos la publicacion que intentas eliminar.");
  }

  await prisma.forumThread.delete({
    where: {
      id: existingThread.id,
    },
  });
}

export async function updateForumReply({
  authorId,
  replyId,
  content,
}: {
  authorId: string;
  replyId: string;
  content: string;
}): Promise<ForumThreadPathInput> {
  const normalizedContent = normalizeForumText(content);

  if (normalizedContent.length < FORUM_REPLY_CONTENT_MIN_LENGTH) {
    throw new Error("La respuesta debe tener al menos 6 caracteres.");
  }

  const existingReply = await prisma.forumReply.findUnique({
    where: {
      id: replyId,
    },
    select: {
      id: true,
      authorId: true,
      deletedAt: true,
      thread: {
        select: {
          id: true,
          slug: true,
          deletedAt: true,
        },
      },
    },
  });

  if (!existingReply) {
    throw new Error("No encontramos la respuesta que intentas editar.");
  }

  if (existingReply.authorId !== authorId) {
    throw new Error("No puedes editar una respuesta que no te pertenece.");
  }

  if (existingReply.deletedAt) {
    throw new Error("No puedes editar una respuesta eliminada.");
  }

  if (existingReply.thread.deletedAt) {
    throw new Error("No puedes editar una respuesta de una publicacion retirada.");
  }

  await prisma.forumReply.update({
    where: {
      id: replyId,
    },
    data: {
      content: normalizedContent,
    },
  });

  return {
    id: existingReply.thread.id,
    slug: existingReply.thread.slug,
  };
}

export async function softDeleteForumReply({
  authorId,
  replyId,
}: {
  authorId: string;
  replyId: string;
}): Promise<ForumThreadPathInput> {
  const existingReply = await prisma.forumReply.findUnique({
    where: {
      id: replyId,
    },
    select: {
      id: true,
      authorId: true,
      deletedAt: true,
      thread: {
        select: {
          id: true,
          slug: true,
          deletedAt: true,
        },
      },
    },
  });

  if (!existingReply) {
    throw new Error("No encontramos la respuesta que intentas eliminar.");
  }

  if (existingReply.authorId !== authorId) {
    throw new Error("No puedes eliminar una respuesta que no te pertenece.");
  }

  if (existingReply.thread.deletedAt) {
    throw new Error("No puedes eliminar una respuesta de una publicacion retirada.");
  }

  if (!existingReply.deletedAt) {
    await prisma.forumReply.update({
      where: {
        id: replyId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  return {
    id: existingReply.thread.id,
    slug: existingReply.thread.slug,
  };
}

export async function getAdminForumModerationData(): Promise<AdminForumModerationData> {
  try {
    const threads = await prisma.forumThread.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const mappedThreads = threads.map((thread) =>
      mapAdminForumThreadSummary(thread),
    );
    const pendingThreads = mappedThreads.filter(
      (thread) => thread.status === "pending",
    );
    const reviewedThreads = mappedThreads
      .filter((thread) => thread.status !== "pending")
      .sort((left, right) => {
        const leftDate = new Date(left.moderatedAt ?? left.createdAt).getTime();
        const rightDate = new Date(right.moderatedAt ?? right.createdAt).getTime();
        return rightDate - leftDate;
      });

    return {
      pendingThreads,
      reviewedThreads,
      counts: {
        pending: pendingThreads.length,
        approved: mappedThreads.filter((thread) => thread.status === "approved")
          .length,
        rejected: mappedThreads.filter((thread) => thread.status === "rejected")
          .length,
      },
    };
  } catch (error) {
    if (isForumUnavailableError(error)) {
      return {
        pendingThreads: [],
        reviewedThreads: [],
        counts: {
          pending: 0,
          approved: 0,
          rejected: 0,
        },
      };
    }

    throw error;
  }
}

export async function getAdminHeaderModerationSummary(): Promise<AdminForumHeaderModerationSummary> {
  try {
    const [pendingCount, pendingThreads] = await prisma.$transaction([
      prisma.forumThread.count({
        where: {
          status: PrismaForumThreadStatus.PENDING,
        },
      }),
      prisma.forumThread.findMany({
        where: {
          status: PrismaForumThreadStatus.PENDING,
        },
        select: {
          id: true,
          slug: true,
          title: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              email: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: ADMIN_FORUM_HEADER_PENDING_THREADS_LIMIT,
      }),
    ]);

    return {
      pendingCount,
      recentPendingThreads: pendingThreads.map((thread) => ({
        id: thread.id,
        title: thread.title,
        authorName: getDisplayName(thread.author),
        createdAt: thread.createdAt.toISOString(),
        path: buildForumThreadPath(thread),
      })),
    };
  } catch (error) {
    if (isForumUnavailableError(error)) {
      return {
        pendingCount: 0,
        recentPendingThreads: [],
      };
    }

    throw error;
  }
}

export async function updateForumThreadModerationStatus({
  threadId,
  status,
}: {
  threadId: string;
  status: ModeratableForumThreadStatus;
}): Promise<ForumThreadPathInput> {
  const existingThread = await prisma.forumThread.findUnique({
    where: {
      id: threadId,
    },
    select: {
      id: true,
      slug: true,
      deletedAt: true,
    },
  });

  if (!existingThread) {
    throw new Error("No encontramos la publicacion que intentas moderar.");
  }

  if (existingThread.deletedAt) {
    throw new Error("No puedes moderar una publicacion retirada.");
  }

  await prisma.forumThread.update({
    where: {
      id: existingThread.id,
    },
    data: {
      status,
      moderatedAt: new Date(),
    },
  });

  return {
    id: existingThread.id,
    slug: existingThread.slug,
  };
}

export async function castForumVote({
  userId,
  entityType,
  entityId,
  direction,
}: {
  userId: string;
  entityType: ForumVoteTargetType;
  entityId: string;
  direction: Exclude<ForumVoteState, null>;
}): Promise<CastForumVoteResult> {
  const requestedDirection = toForumVoteDirection(direction);

  if (entityType === "thread") {
    return prisma.$transaction(async (transaction) => {
      const thread = await transaction.forumThread.findUnique({
        where: {
          id: entityId,
        },
        select: {
          id: true,
          deletedAt: true,
          status: true,
          upvotes: true,
          downvotes: true,
        },
      });

      if (
        !thread ||
        thread.deletedAt ||
        thread.status !== PrismaForumThreadStatus.APPROVED
      ) {
        throw new Error("No encontramos el hilo que intentas votar.");
      }

      const existingVote = await transaction.forumThreadVote.findUnique({
        where: {
          threadId_userId: {
            threadId: entityId,
            userId,
          },
        },
        select: {
          id: true,
          direction: true,
        },
      });

      const nextDirection =
        existingVote?.direction === requestedDirection ? null : direction;
      const nextCounts = applyVoteCountUpdate({
        upvotes: thread.upvotes,
        downvotes: thread.downvotes,
        previousDirection: existingVote?.direction ?? null,
        nextDirection,
      });

      if (nextDirection === null && existingVote) {
        await transaction.forumThreadVote.delete({
          where: {
            id: existingVote.id,
          },
        });
      } else if (existingVote) {
        await transaction.forumThreadVote.update({
          where: {
            id: existingVote.id,
          },
          data: {
            direction: requestedDirection,
          },
        });
      } else {
        await transaction.forumThreadVote.create({
          data: {
            threadId: entityId,
            userId,
            direction: requestedDirection,
          },
        });
      }

      await transaction.forumThread.update({
        where: {
          id: entityId,
        },
        data: nextCounts,
      });

      return {
        ...nextCounts,
        currentUserVote: nextDirection,
      };
    });
  }

  return prisma.$transaction(async (transaction) => {
    const reply = await transaction.forumReply.findUnique({
      where: {
        id: entityId,
      },
      select: {
        id: true,
        deletedAt: true,
        upvotes: true,
        downvotes: true,
        thread: {
          select: {
            deletedAt: true,
            status: true,
          },
        },
      },
    });

    if (
      !reply ||
      reply.deletedAt ||
      reply.thread.deletedAt ||
      reply.thread.status !== PrismaForumThreadStatus.APPROVED
    ) {
      throw new Error("No encontramos la respuesta que intentas votar.");
    }

    const existingVote = await transaction.forumReplyVote.findUnique({
      where: {
        replyId_userId: {
          replyId: entityId,
          userId,
        },
      },
      select: {
        id: true,
        direction: true,
      },
    });

    const nextDirection =
      existingVote?.direction === requestedDirection ? null : direction;
    const nextCounts = applyVoteCountUpdate({
      upvotes: reply.upvotes,
      downvotes: reply.downvotes,
      previousDirection: existingVote?.direction ?? null,
      nextDirection,
    });

    if (nextDirection === null && existingVote) {
      await transaction.forumReplyVote.delete({
        where: {
          id: existingVote.id,
        },
      });
    } else if (existingVote) {
      await transaction.forumReplyVote.update({
        where: {
          id: existingVote.id,
        },
        data: {
          direction: requestedDirection,
        },
      });
    } else {
      await transaction.forumReplyVote.create({
        data: {
          replyId: entityId,
          userId,
          direction: requestedDirection,
        },
      });
    }

    await transaction.forumReply.update({
      where: {
        id: entityId,
      },
      data: nextCounts,
    });

    return {
      ...nextCounts,
      currentUserVote: nextDirection,
    };
  });
}