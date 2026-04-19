"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ForumThreadStatus } from "@/lib/generated/prisma/client";
import { requireAdminActionAccess } from "@/lib/auth/admin";
import {
  buildForumThreadPath,
  hardDeleteForumThread,
  updateForumThreadModerationStatus,
} from "@/lib/forum";

function getStringValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function revalidateForumPaths(
  thread?: { id: string; slug: string },
) {
  revalidatePath("/admin/forum");
  revalidatePath("/forum");
  revalidatePath("/account");

  if (thread) {
    revalidatePath(buildForumThreadPath(thread));
  }
}

export async function approveAdminForumThreadAction(
  formData: FormData,
): Promise<void> {
  const threadId = getStringValue(formData, "threadId");

  if (!threadId) {
    throw new Error("Debes indicar una publicacion para aprobar.");
  }

  await requireAdminActionAccess();
  const thread = await updateForumThreadModerationStatus({
    threadId,
    status: ForumThreadStatus.APPROVED,
  });

  revalidateForumPaths(thread);
  redirect("/admin/forum");
}

export async function rejectAdminForumThreadAction(
  formData: FormData,
): Promise<void> {
  const threadId = getStringValue(formData, "threadId");

  if (!threadId) {
    throw new Error("Debes indicar una publicacion para rechazar.");
  }

  await requireAdminActionAccess();
  const thread = await updateForumThreadModerationStatus({
    threadId,
    status: ForumThreadStatus.REJECTED,
  });

  revalidateForumPaths(thread);
  redirect("/admin/forum");
}

export async function hardDeleteAdminForumThreadAction(
  formData: FormData,
): Promise<void> {
  const threadId = getStringValue(formData, "threadId");

  if (!threadId) {
    throw new Error("Debes indicar una publicacion para eliminar.");
  }

  const adminUser = await requireAdminActionAccess();
  await hardDeleteForumThread({
    actorId: adminUser.id,
    threadId,
  });

  revalidateForumPaths();
  redirect("/admin/forum");
}