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

export type ForumVoteState = "up" | "down" | null;

export interface ForumComment {
  id: string;
  author: ForumUser;
  content: string;
  createdAt: string;
  updatedAt?: string;
  upvotes: number;
  downvotes: number;
  currentUserVote?: ForumVoteState;
  isDeleted?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  replies?: ForumComment[];
}

export interface ForumThread {
  id: string;
  slug?: string;
  title: string;
  content: string;
  author: ForumUser;
  createdAt: string;
  updatedAt?: string;
  upvotes: number;
  downvotes: number;
  currentUserVote?: ForumVoteState;
  commentCount: number;
  tags: string[];
  isDeleted?: boolean;
  isEdited?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  comments?: ForumComment[];
}

export interface RecentPublication {
  id: string;
  title: string;
  threadId: string;
  visitedAt: string;
}

export type ForumSort = "hot" | "new" | "top";

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
    title: "¿Cuales son los mejores repuestos para una KitchenAid Stand Mixer?",
    content:
      "Tengo una KitchenAid Artisan Stand Mixer de unos 5 anos. El accesorio batidor ya muestra desgaste y estoy buscando repuestos de buena calidad. ¿Alguien ha probado piezas de terceros frente a repuestos originales? Busco recomendaciones sobre donde comprar y que evitar.",
    author: mockUsers[0],
    createdAt: "2026-03-03T10:30:00Z",
    upvotes: 24,
    downvotes: 2,
    commentCount: 8,
    tags: ["KitchenAid", "Repuestos", "Batidora"],
  },
  {
    id: "thread-2",
    title: "La cuchilla de mi Cuisinart no gira. ¿Sera el acople?",
    content:
      "Mi equipo Cuisinart enciende, pero la cuchilla no gira. Ya revise el seguro y todo parece estar bien, asi que sospecho del acople o de algun engranaje interno. ¿A alguien le ha pasado? ¿Que pieza conviene revisar primero?",
    author: mockUsers[1],
    createdAt: "2026-03-03T08:15:00Z",
    upvotes: 15,
    downvotes: 1,
    commentCount: 12,
    tags: ["Cuisinart", "Reparacion", "Acople"],
  },
  {
    id: "thread-3",
    title: "Mi batidora Whirlpool perdio fuerza en velocidad media",
    content:
      "Desde hace unos dias mi batidora Whirlpool suena normal, pero en velocidad media le cuesta mover mezclas ligeras. Antes no hacia eso. ¿Podria ser desgaste del engranaje, carbones o algun problema de regulacion?",
    author: mockUsers[2],
    createdAt: "2026-03-02T22:45:00Z",
    upvotes: 31,
    downvotes: 0,
    commentCount: 15,
    tags: ["Whirlpool", "Batidora", "Engranaje"],
  },
  {
    id: "thread-4",
    title: "¿Donde conseguir repuestos descontinuados para una batidora Cuisinart?",
    content:
      "Tengo una batidora Cuisinart de 2018 y necesito cambiar una pieza del tren de engranajes. El modelo fue descontinuado y me esta costando encontrar el repuesto exacto. ¿Alguien conoce fuentes confiables para piezas viejas o equivalencias que si funcionen?",
    author: mockUsers[3],
    createdAt: "2026-03-02T16:20:00Z",
    upvotes: 18,
    downvotes: 3,
    commentCount: 6,
    tags: ["Cuisinart", "Repuestos", "Descontinuado"],
  },
  {
    id: "thread-5",
    title: "¿Consejos para mantener tazones y accesorios de acero inoxidable?",
    content:
      "Quiero mantener en buen estado los tazones y accesorios de acero inoxidable de mis batidoras. ¿Que productos recomiendan para limpiarlos sin rayarlos? ¿Tienen algun truco para evitar manchas, grasa pegada o marcas de agua?",
    author: mockUsers[4],
    createdAt: "2026-03-02T14:00:00Z",
    upvotes: 42,
    downvotes: 1,
    commentCount: 23,
    tags: ["Mantenimiento", "Acero inoxidable", "Accesorios"],
  },
  {
    id: "thread-6",
    title: "Mi KitchenAid cambia de velocidad sola. ¿Problema de gobernador?",
    content:
      "Mi KitchenAid empieza mezclando bien, pero a mitad del uso sube o baja de velocidad sin que yo toque la palanca. He visto que algunos hablan del gobernador o del centrifugo. ¿Alguien ha cambiado esa pieza y soluciono el problema?",
    author: mockUsers[0],
    createdAt: "2026-03-01T11:30:00Z",
    upvotes: 27,
    downvotes: 2,
    commentCount: 11,
    tags: ["KitchenAid", "Gobernador", "Velocidad"],
  },
  {
    id: "thread-7",
    title: "Mi KitchenAid esta botando grasa por el cabezal",
    content:
      "Mi KitchenAid empezo a botar grasa por el cabezal despues de varios meses sin uso. Funciona, pero me preocupa dañar la mezcla o que falte lubricacion interna. ¿Conviene limpiar y relubricar o cambiar algun sello o engranaje de una vez?",
    author: mockUsers[1],
    createdAt: "2026-03-01T09:15:00Z",
    upvotes: 56,
    downvotes: 4,
    commentCount: 34,
    tags: ["KitchenAid", "Grasa", "Mantenimiento"],
  },
  {
    id: "thread-8",
    title: "¿Que accesorio vale mas la pena para una batidora?",
    content:
      "Quiero comprar un accesorio nuevo para mi batidora y estoy entre el batidor de borde flexible, el globo y el gancho amasador. Si solo pudieran empezar con uno, ¿cual les ha dado mas utilidad en la cocina diaria?",
    author: mockUsers[2],
    createdAt: "2026-02-28T20:00:00Z",
    upvotes: 19,
    downvotes: 0,
    commentCount: 9,
    tags: ["Accesorios", "Batidora", "Recomendacion"],
  },
];

// Mock comments for thread-1
export const mockCommentsThread1: ForumComment[] = [
  {
    id: "comment-1",
    author: mockUsers[1],
    content:
      "He usado tanto repuestos originales como de terceros. Para el batidor en particular, te recomendaria quedarte con el original. El recubrimiento de los de terceros suele desgastarse mas rapido. Puedes conseguir piezas KitchenAid autenticas en su web oficial o con distribuidores autorizados.",
    createdAt: "2026-03-03T11:00:00Z",
    upvotes: 12,
    downvotes: 0,
    replies: [
      {
        id: "comment-1-1",
        author: mockUsers[0],
        content:
          "¡Gracias! ¿Recuerdas mas o menos cuanto pagaste por el batidor original?",
        createdAt: "2026-03-03T11:15:00Z",
        upvotes: 3,
        downvotes: 0,
      },
      {
        id: "comment-1-2",
        author: mockUsers[1],
        content:
          "Entre $35 y $40, si mal no recuerdo. Vale la pena por la calidad.",
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
      "De hecho me ha ido muy bien comprando repuestos en PeterParts. Tienen buena seleccion de accesorios, engranajes y piezas para KitchenAid, Cuisinart y Whirlpool, con envio rapido.",
    createdAt: "2026-03-03T12:00:00Z",
    upvotes: 8,
    downvotes: 1,
  },
  {
    id: "comment-3",
    author: mockUsers[4],
    content:
      "Consejo: si tu batidora ya no tiene garantia, considera comprar el batidor de borde flexible. Raspa los lados mientras mezcla y es una gran mejora frente al batidor plano estandar.",
    createdAt: "2026-03-03T13:30:00Z",
    upvotes: 15,
    downvotes: 0,
    replies: [
      {
        id: "comment-3-1",
        author: mockUsers[2],
        content:
          "Totalmente de acuerdo. El batidor de borde flexible cambia todo para mezclas espesas.",
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
    title: "Mi KitchenAid esta botando grasa por el cabezal",
    threadId: "thread-7",
    visitedAt: "2026-03-03T09:00:00Z",
  },
  {
    id: "recent-2",
    title: "¿Consejos para mantener tazones y accesorios de acero inoxidable?",
    threadId: "thread-5",
    visitedAt: "2026-03-02T18:30:00Z",
  },
  {
    id: "recent-3",
    title: "Mi batidora Whirlpool perdio fuerza en velocidad media",
    threadId: "thread-3",
    visitedAt: "2026-03-02T15:00:00Z",
  },
  {
    id: "recent-4",
    title: "¿Cuales son los mejores repuestos para una KitchenAid Stand Mixer?",
    threadId: "thread-1",
    visitedAt: "2026-03-01T20:00:00Z",
  },
];

function getHotScore(thread: ForumThread): number {
  return thread.commentCount * 3 + thread.upvotes - thread.downvotes;
}

export function normalizeForumSort(
  value: string | string[] | null | undefined
): ForumSort {
  if (value === "new" || value === "top") {
    return value;
  }

  return "hot";
}

export function slugifyForumTag(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getForumFeed({
  sort = "hot",
  tag,
}: {
  sort?: ForumSort;
  tag?: string | null;
} = {}): ForumThread[] {
  const filteredThreads = tag
    ? mockThreads.filter((thread) =>
        thread.tags.some((threadTag) => slugifyForumTag(threadTag) === tag)
      )
    : mockThreads;

  return [...filteredThreads].sort((left, right) => {
    if (sort === "new") {
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    }

    if (sort === "top") {
      return right.upvotes - right.downvotes - (left.upvotes - left.downvotes);
    }

    return getHotScore(right) - getHotScore(left);
  });
}

export function getFeaturedForumTags(limit = 8): string[] {
  const tagCounts = new Map<string, number>();

  for (const thread of mockThreads) {
    for (const tag of thread.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  return [...tagCounts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([tag]) => tag);
}

// Helper function to format relative time
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "justo ahora";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} min`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `hace ${diffInHours} h`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `hace ${diffInDays} d`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `hace ${diffInWeeks} sem`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `hace ${diffInMonths} mes${diffInMonths === 1 ? "" : "es"}`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `hace ${diffInYears} ano${diffInYears === 1 ? "" : "s"}`;
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
