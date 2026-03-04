import type { Metadata } from "next";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ForumThreadCard from "@/components/forum/ForumThreadCard";
import ForumSidebar from "@/components/forum/ForumSidebar";
import { mockThreads } from "@/lib/forum-data";

export const metadata: Metadata = {
  title: "Forum",
  description:
    "Join the PeterParts community forum. Ask questions, share tips, and get help with your kitchen appliances.",
};

export default function ForumPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Community Forum</h1>
        <p className="text-muted-foreground">
          Ask questions, share tips, and connect with other appliance enthusiasts.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1">
          {/* Search and sort */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search forum..."
                className="pl-9"
              />
            </div>
          </div>

          {/* Thread list */}
          <div className="space-y-3">
            {mockThreads.map((thread) => (
              <ForumThreadCard key={thread.id} thread={thread} />
            ))}
          </div>

          {/* Load more */}
          <div className="mt-6 text-center">
            <button
              type="button"
              className="text-sm text-red-500 hover:underline font-medium"
            >
              Load more threads
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 shrink-0">
          <ForumSidebar />
        </div>
      </div>
    </div>
  );
}
