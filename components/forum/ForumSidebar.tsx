import Link from "next/link";
import { Clock, PenSquare, Flame, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { mockRecentPublications, formatRelativeTime } from "@/lib/forum-data";

/**
 * ForumSidebar — Server Component
 * Shows recent publications and quick actions
 */
export default function ForumSidebar() {
  return (
    <aside className="space-y-4">
      {/* Create Thread CTA */}
      <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">Have a question?</h3>
          <p className="text-sm text-red-100 mb-3">
            Ask the PeterParts community for help with your appliances.
          </p>
          <Button
            variant="secondary"
            className="w-full bg-white text-red-600 hover:bg-red-50"
          >
            <PenSquare className="h-4 w-4 mr-2" />
            Create Thread
          </Button>
        </CardContent>
      </Card>

      {/* Quick Filters */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Browse</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <nav className="space-y-1">
            <Link
              href="/forum"
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-red-500 text-white"
            >
              <Flame className="h-4 w-4" />
              Hot
            </Link>
            <Link
              href="/forum?sort=new"
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            >
              <Clock className="h-4 w-4" />
              New
            </Link>
            <Link
              href="/forum?sort=top"
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            >
              <TrendingUp className="h-4 w-4" />
              Top
            </Link>
          </nav>
        </CardContent>
      </Card>

      {/* Recent Publications */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Recent Publications
            </CardTitle>
            <button
              type="button"
              className="text-xs text-red-500 hover:underline"
            >
              Clear
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-1">
            {mockRecentPublications.map((pub, index) => (
              <div key={pub.id}>
                <Link
                  href={`/forum/${pub.threadId}`}
                  className="block py-2 group"
                >
                  <p className="text-sm line-clamp-2 group-hover:text-red-500 transition-colors">
                    {pub.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatRelativeTime(pub.visitedAt)}
                  </p>
                </Link>
                {index < mockRecentPublications.length - 1 && (
                  <Separator className="my-1" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Popular Tags */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Popular Tags</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex flex-wrap gap-2">
            {[
              "KitchenAid",
              "Whirlpool",
              "Samsung",
              "Repair",
              "Parts",
              "DIY",
              "Refrigerator",
              "Oven",
            ].map((tag) => (
              <Link
                key={tag}
                href={`/forum?tag=${tag.toLowerCase()}`}
                className="text-xs px-2.5 py-1 rounded-full bg-muted hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Community Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            About PeterParts Forum
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <p className="text-sm text-muted-foreground mb-3">
            A community for appliance enthusiasts to share tips, ask questions,
            and help each other with repairs and maintenance.
          </p>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-2 rounded-lg bg-muted">
              <p className="text-lg font-bold">2.4k</p>
              <p className="text-xs text-muted-foreground">Members</p>
            </div>
            <div className="p-2 rounded-lg bg-muted">
              <p className="text-lg font-bold">156</p>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
