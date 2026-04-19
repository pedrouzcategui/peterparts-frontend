"use server";

import { redirect } from "next/navigation";
import {
  buildForumLoginRedirectPath,
  buildForumThreadPath,
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

function getThreadPathValue(formData: FormData): string {
  return getStringValue(formData, "threadPath") || "/forum";
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

  redirect(buildForumThreadPath(thread));
}

export async function createForumReplyAction(formData: FormData): Promise<void> {
  const threadId = getStringValue(formData, "threadId");
  const threadPath = getThreadPathValue(formData);
  const currentUser = await getCurrentForumUser();

  if (!currentUser) {
    redirect(buildForumLoginRedirectPath(threadPath));
  }

  const thread = await createForumReply({
    authorId: currentUser.id,
    threadId,
    content: getStringValue(formData, "content"),
  });

  redirect(`${buildForumThreadPath(thread)}#reply-form`);
}

export async function updateForumThreadAction(formData: FormData): Promise<void> {
  const threadId = getStringValue(formData, "threadId");
  const threadPath = getThreadPathValue(formData);
  const currentUser = await getCurrentForumUser();

  if (!currentUser) {
    redirect(buildForumLoginRedirectPath(threadPath));
  }

  const thread = await updateForumThread({
    authorId: currentUser.id,
    threadId,
    title: getStringValue(formData, "title"),
    content: getStringValue(formData, "content"),
    tags: getStringValue(formData, "tags"),
  });

  redirect(buildForumThreadPath(thread));
}

export async function softDeleteForumThreadAction(formData: FormData): Promise<void> {
  const threadId = getStringValue(formData, "threadId");
  const threadPath = getThreadPathValue(formData);
  const currentUser = await getCurrentForumUser();

  if (!currentUser) {
    redirect(buildForumLoginRedirectPath(threadPath));
  }

  const thread = await softDeleteForumThread({
    authorId: currentUser.id,
    threadId,
  });

  redirect(buildForumThreadPath(thread));
}

export async function hardDeleteForumThreadAction(formData: FormData): Promise<void> {
  const threadId = getStringValue(formData, "threadId");
  const threadPath = getThreadPathValue(formData);
  const currentUser = await getCurrentForumUser();

  if (!currentUser) {
    redirect(buildForumLoginRedirectPath(threadPath));
  }

  await hardDeleteForumThread({
    actorId: currentUser.id,
    threadId,
  });

  redirect("/forum");
}

export async function updateForumReplyAction(formData: FormData): Promise<void> {
  const replyId = getStringValue(formData, "replyId");
  const threadPath = getThreadPathValue(formData);
  const currentUser = await getCurrentForumUser();

  if (!currentUser) {
    redirect(buildForumLoginRedirectPath(threadPath));
  }

  const thread = await updateForumReply({
    authorId: currentUser.id,
    replyId,
    content: getStringValue(formData, "content"),
  });

  redirect(`${buildForumThreadPath(thread)}#comment-${replyId}`);
}

export async function softDeleteForumReplyAction(formData: FormData): Promise<void> {
  const replyId = getStringValue(formData, "replyId");
  const threadPath = getThreadPathValue(formData);
  const currentUser = await getCurrentForumUser();

  if (!currentUser) {
    redirect(buildForumLoginRedirectPath(threadPath));
  }

  const thread = await softDeleteForumReply({
    authorId: currentUser.id,
    replyId,
  });

  redirect(`${buildForumThreadPath(thread)}#comment-${replyId}`);
}