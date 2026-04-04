"use server";

import { redirect } from "next/navigation";
import {
  buildForumLoginRedirectPath,
  createForumReply,
  createForumThread,
  getCurrentForumUser,
  hardDeleteForumThread,
  softDeleteForumThread,
  softDeleteForumReply,
  updateForumThread,
  updateForumReply,
} from "@/lib/forum";

function getStringValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function createForumThreadAction(formData: FormData): Promise<void> {
  const currentUser = await getCurrentForumUser();

  if (!currentUser) {
    redirect(buildForumLoginRedirectPath("/forum/new"));
  }

  const thread = await createForumThread({
    authorId: currentUser.id,
    title: getStringValue(formData, "title"),
    content: getStringValue(formData, "content"),
    tags: getStringValue(formData, "tags"),
  });

  redirect(`/forum/${thread.slug}`);
}

export async function createForumReplyAction(formData: FormData): Promise<void> {
  const threadIdOrSlug = getStringValue(formData, "threadIdOrSlug");
  const currentUser = await getCurrentForumUser();

  if (!currentUser) {
    redirect(buildForumLoginRedirectPath(`/forum/${threadIdOrSlug}`));
  }

  const thread = await createForumReply({
    authorId: currentUser.id,
    threadIdOrSlug,
    content: getStringValue(formData, "content"),
  });

  redirect(`/forum/${thread.slug}#reply-form`);
}

export async function updateForumThreadAction(formData: FormData): Promise<void> {
  const threadIdOrSlug = getStringValue(formData, "threadIdOrSlug");
  const currentUser = await getCurrentForumUser();

  if (!currentUser) {
    redirect(buildForumLoginRedirectPath(`/forum/${threadIdOrSlug}`));
  }

  const thread = await updateForumThread({
    authorId: currentUser.id,
    threadIdOrSlug,
    title: getStringValue(formData, "title"),
    content: getStringValue(formData, "content"),
    tags: getStringValue(formData, "tags"),
  });

  redirect(`/forum/${thread.slug}`);
}

export async function softDeleteForumThreadAction(formData: FormData): Promise<void> {
  const threadIdOrSlug = getStringValue(formData, "threadIdOrSlug");
  const currentUser = await getCurrentForumUser();

  if (!currentUser) {
    redirect(buildForumLoginRedirectPath(`/forum/${threadIdOrSlug}`));
  }

  const thread = await softDeleteForumThread({
    authorId: currentUser.id,
    threadIdOrSlug,
  });

  redirect(`/forum/${thread.slug}`);
}

export async function hardDeleteForumThreadAction(formData: FormData): Promise<void> {
  const threadIdOrSlug = getStringValue(formData, "threadIdOrSlug");
  const currentUser = await getCurrentForumUser();

  if (!currentUser) {
    redirect(buildForumLoginRedirectPath(`/forum/${threadIdOrSlug}`));
  }

  await hardDeleteForumThread({
    actorId: currentUser.id,
    threadIdOrSlug,
  });

  redirect("/forum");
}

export async function updateForumReplyAction(formData: FormData): Promise<void> {
  const replyId = getStringValue(formData, "replyId");
  const threadIdOrSlug = getStringValue(formData, "threadIdOrSlug");
  const currentUser = await getCurrentForumUser();

  if (!currentUser) {
    redirect(buildForumLoginRedirectPath(`/forum/${threadIdOrSlug}`));
  }

  const thread = await updateForumReply({
    authorId: currentUser.id,
    replyId,
    content: getStringValue(formData, "content"),
  });

  redirect(`/forum/${thread.slug}#comment-${replyId}`);
}

export async function softDeleteForumReplyAction(formData: FormData): Promise<void> {
  const replyId = getStringValue(formData, "replyId");
  const threadIdOrSlug = getStringValue(formData, "threadIdOrSlug");
  const currentUser = await getCurrentForumUser();

  if (!currentUser) {
    redirect(buildForumLoginRedirectPath(`/forum/${threadIdOrSlug}`));
  }

  const thread = await softDeleteForumReply({
    authorId: currentUser.id,
    replyId,
  });

  redirect(`/forum/${thread.slug}#comment-${replyId}`);
}