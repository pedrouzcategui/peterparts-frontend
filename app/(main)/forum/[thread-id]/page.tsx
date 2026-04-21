import { notFound, redirect } from "next/navigation";
import { buildForumThreadPath, getForumThreadData } from "@/lib/forum";

interface LegacyThreadPageProps {
  params: Promise<{ "thread-id": string }>;
}

export default async function LegacyThreadPage({
  params,
}: LegacyThreadPageProps) {
  const threadId = (await params)["thread-id"];
  const thread = await getForumThreadData(threadId);

  if (!thread) {
    notFound();
  }

  redirect(buildForumThreadPath(thread));
}