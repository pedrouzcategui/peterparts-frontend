/**
 * Forum types and mock data
 */

export interface ForumUser {
  id: string;
  name: string;
  avatar?: string;
  initials: string;
  joinedDate: string;
}

export interface ForumComment {
  id: string;
  author: ForumUser;
  content: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  replies?: ForumComment[];
}

export interface ForumThread {
  id: string;
  title: string;
  content: string;
  author: ForumUser;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  tags: string[];
  comments?: ForumComment[];
}

export interface RecentPublication {
  id: string;
  title: string;
  threadId: string;
  visitedAt: string;
}

// Mock users
export const mockUsers: ForumUser[] = [
  {
    id: "user-1",
    name: "Carlos Méndez",
    initials: "CM",
    joinedDate: "2024-06-15",
  },
  {
    id: "user-2",
    name: "María García",
    initials: "MG",
    joinedDate: "2024-08-20",
  },
  {
    id: "user-3",
    name: "Juan Rodríguez",
    initials: "JR",
    joinedDate: "2025-01-10",
  },
  {
    id: "user-4",
    name: "Ana López",
    initials: "AL",
    joinedDate: "2025-02-05",
  },
  {
    id: "user-5",
    name: "Pedro Sánchez",
    initials: "PS",
    joinedDate: "2024-11-22",
  },
];

// Mock threads
export const mockThreads: ForumThread[] = [
  {
    id: "thread-1",
    title: "Best replacement parts for KitchenAid Stand Mixer?",
    content:
      "I have a KitchenAid Artisan Stand Mixer that's about 5 years old. The beater attachment is starting to show wear and I'm looking for quality replacement parts. Has anyone had experience with third-party vs OEM parts? Looking for recommendations on where to buy and what to avoid.",
    author: mockUsers[0],
    createdAt: "2026-03-03T10:30:00Z",
    upvotes: 24,
    downvotes: 2,
    commentCount: 8,
    tags: ["KitchenAid", "Parts", "Mixer"],
  },
  {
    id: "thread-2",
    title: "Cuisinart food processor blade not spinning - help!",
    content:
      "My Cuisinart 14-cup food processor suddenly stopped working. The motor runs but the blade doesn't spin. I've checked the safety lock and it seems fine. Has anyone encountered this issue? Is it worth repairing or should I just buy a new one?",
    author: mockUsers[1],
    createdAt: "2026-03-03T08:15:00Z",
    upvotes: 15,
    downvotes: 1,
    commentCount: 12,
    tags: ["Cuisinart", "Repair", "Food Processor"],
  },
  {
    id: "thread-3",
    title: "Whirlpool refrigerator making strange noises",
    content:
      "For the past week, my Whirlpool side-by-side refrigerator has been making a clicking noise every few minutes. The cooling seems fine but the noise is concerning. Any ideas what could be causing this? The fridge is about 3 years old.",
    author: mockUsers[2],
    createdAt: "2026-03-02T22:45:00Z",
    upvotes: 31,
    downvotes: 0,
    commentCount: 15,
    tags: ["Whirlpool", "Refrigerator", "Noise"],
  },
  {
    id: "thread-4",
    title: "Where to find discontinued Bosch dishwasher parts?",
    content:
      "I have a Bosch dishwasher model from 2018 that needs a new spray arm. The model has been discontinued and I'm having trouble finding the exact part. Does anyone know reliable sources for discontinued Bosch parts? The dishwasher works great otherwise.",
    author: mockUsers[3],
    createdAt: "2026-03-02T16:20:00Z",
    upvotes: 18,
    downvotes: 3,
    commentCount: 6,
    tags: ["Bosch", "Dishwasher", "Discontinued"],
  },
  {
    id: "thread-5",
    title: "Tips for maintaining stainless steel appliances?",
    content:
      "Just renovated my kitchen with all stainless steel appliances. Looking for tips on how to keep them looking new. What cleaning products do you recommend? Any tricks to avoid fingerprints and water spots?",
    author: mockUsers[4],
    createdAt: "2026-03-02T14:00:00Z",
    upvotes: 42,
    downvotes: 1,
    commentCount: 23,
    tags: ["Maintenance", "Stainless Steel", "Tips"],
  },
  {
    id: "thread-6",
    title: "GE oven not heating evenly - calibration issue?",
    content:
      "My GE Profile oven seems to have hot spots. Baked goods come out unevenly cooked. I've tried using an oven thermometer and the temperature seems accurate at the center. Is this a calibration issue or could it be a heating element problem?",
    author: mockUsers[0],
    createdAt: "2026-03-01T11:30:00Z",
    upvotes: 27,
    downvotes: 2,
    commentCount: 11,
    tags: ["GE", "Oven", "Heating"],
  },
  {
    id: "thread-7",
    title: "Samsung ice maker keeps freezing over",
    content:
      "The ice maker in my Samsung French door refrigerator keeps freezing over and stops producing ice. I've defrosted it manually twice now but the problem keeps coming back. Is there a permanent fix for this? Seems like a common Samsung issue.",
    author: mockUsers[1],
    createdAt: "2026-03-01T09:15:00Z",
    upvotes: 56,
    downvotes: 4,
    commentCount: 34,
    tags: ["Samsung", "Ice Maker", "Freezer"],
  },
  {
    id: "thread-8",
    title: "Recommendation for quiet range hood?",
    content:
      "Looking to replace my old, noisy range hood. What are your recommendations for a quiet but powerful range hood? Budget is around $500-800. Kitchen is about 200 sq ft with a standard 30\" range.",
    author: mockUsers[2],
    createdAt: "2026-02-28T20:00:00Z",
    upvotes: 19,
    downvotes: 0,
    commentCount: 9,
    tags: ["Range Hood", "Recommendation", "Kitchen"],
  },
];

// Mock comments for thread-1
export const mockCommentsThread1: ForumComment[] = [
  {
    id: "comment-1",
    author: mockUsers[1],
    content:
      "I've used both OEM and third-party parts. For the beater specifically, I'd recommend sticking with OEM. The coating on third-party ones tends to chip faster. You can find genuine KitchenAid parts on their official website or through authorized dealers.",
    createdAt: "2026-03-03T11:00:00Z",
    upvotes: 12,
    downvotes: 0,
    replies: [
      {
        id: "comment-1-1",
        author: mockUsers[0],
        content:
          "Thanks! Do you remember roughly how much you paid for the OEM beater?",
        createdAt: "2026-03-03T11:15:00Z",
        upvotes: 3,
        downvotes: 0,
      },
      {
        id: "comment-1-2",
        author: mockUsers[1],
        content:
          "Around $35-40 if I remember correctly. Worth it for the quality.",
        createdAt: "2026-03-03T11:30:00Z",
        upvotes: 5,
        downvotes: 0,
      },
    ],
  },
  {
    id: "comment-2",
    author: mockUsers[3],
    content:
      "I've had good luck with parts from PeterParts actually! They have a great selection of KitchenAid accessories and the prices are competitive. Plus fast shipping.",
    createdAt: "2026-03-03T12:00:00Z",
    upvotes: 8,
    downvotes: 1,
  },
  {
    id: "comment-3",
    author: mockUsers[4],
    content:
      "Pro tip: If your mixer is out of warranty, consider getting the flex edge beater. It scrapes the sides as it mixes and is a great upgrade from the standard flat beater.",
    createdAt: "2026-03-03T13:30:00Z",
    upvotes: 15,
    downvotes: 0,
    replies: [
      {
        id: "comment-3-1",
        author: mockUsers[2],
        content:
          "Second this! The flex edge beater is a game changer for thick batters.",
        createdAt: "2026-03-03T14:00:00Z",
        upvotes: 6,
        downvotes: 0,
      },
    ],
  },
];

// Mock recent publications (user's viewing history)
export const mockRecentPublications: RecentPublication[] = [
  {
    id: "recent-1",
    title: "Samsung ice maker keeps freezing over",
    threadId: "thread-7",
    visitedAt: "2026-03-03T09:00:00Z",
  },
  {
    id: "recent-2",
    title: "Tips for maintaining stainless steel appliances?",
    threadId: "thread-5",
    visitedAt: "2026-03-02T18:30:00Z",
  },
  {
    id: "recent-3",
    title: "Whirlpool refrigerator making strange noises",
    threadId: "thread-3",
    visitedAt: "2026-03-02T15:00:00Z",
  },
  {
    id: "recent-4",
    title: "Best replacement parts for KitchenAid Stand Mixer?",
    threadId: "thread-1",
    visitedAt: "2026-03-01T20:00:00Z",
  },
];

// Helper function to format relative time
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}mo ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y ago`;
}

// Get thread by ID with comments
export function getThreadById(id: string): (ForumThread & { comments: ForumComment[] }) | null {
  const thread = mockThreads.find((t) => t.id === id);
  if (!thread) return null;

  // For demo, only thread-1 has detailed comments
  const comments = id === "thread-1" ? mockCommentsThread1 : [];

  return {
    ...thread,
    comments,
  };
}
