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
    title: "La cuchilla de mi procesador Cuisinart no gira. ¡Ayuda!",
    content:
      "Mi procesador de alimentos Cuisinart de 14 tazas dejo de funcionar de repente. El motor enciende, pero la cuchilla no gira. Ya revise el seguro y parece estar bien. ¿A alguien le ha pasado esto? ¿Vale la pena repararlo o mejor compro uno nuevo?",
    author: mockUsers[1],
    createdAt: "2026-03-03T08:15:00Z",
    upvotes: 15,
    downvotes: 1,
    commentCount: 12,
    tags: ["Cuisinart", "Reparacion", "Procesador de alimentos"],
  },
  {
    id: "thread-3",
    title: "Mi refrigerador Whirlpool hace ruidos extranos",
    content:
      "Desde hace una semana, mi refrigerador Whirlpool side-by-side hace un ruido de clic cada pocos minutos. Sigue enfriando bien, pero el ruido me preocupa. ¿Alguna idea de que puede estar causandolo? El equipo tiene unos 3 anos.",
    author: mockUsers[2],
    createdAt: "2026-03-02T22:45:00Z",
    upvotes: 31,
    downvotes: 0,
    commentCount: 15,
    tags: ["Whirlpool", "Refrigerador", "Ruido"],
  },
  {
    id: "thread-4",
    title: "¿Donde conseguir repuestos descontinuados para un lavavajillas Bosch?",
    content:
      "Tengo un lavavajillas Bosch de 2018 que necesita un nuevo brazo rociador. El modelo fue descontinuado y me esta costando encontrar la pieza exacta. ¿Alguien conoce fuentes confiables para repuestos Bosch descontinuados? Por lo demas el equipo funciona muy bien.",
    author: mockUsers[3],
    createdAt: "2026-03-02T16:20:00Z",
    upvotes: 18,
    downvotes: 3,
    commentCount: 6,
    tags: ["Bosch", "Lavavajillas", "Descontinuado"],
  },
  {
    id: "thread-5",
    title: "¿Consejos para mantener electrodomesticos de acero inoxidable?",
    content:
      "Acabo de renovar mi cocina con electrodomesticos de acero inoxidable. Busco consejos para mantenerlos como nuevos. ¿Que productos de limpieza recomiendan? ¿Tienen trucos para evitar huellas y marcas de agua?",
    author: mockUsers[4],
    createdAt: "2026-03-02T14:00:00Z",
    upvotes: 42,
    downvotes: 1,
    commentCount: 23,
    tags: ["Mantenimiento", "Acero inoxidable", "Consejos"],
  },
  {
    id: "thread-6",
    title: "Mi horno GE no calienta parejo. ¿Problema de calibracion?",
    content:
      "Mi horno GE Profile parece tener puntos calientes. Los horneados salen cocidos de manera desigual. Ya probe con un termometro y la temperatura en el centro parece correcta. ¿Sera un problema de calibracion o del elemento calefactor?",
    author: mockUsers[0],
    createdAt: "2026-03-01T11:30:00Z",
    upvotes: 27,
    downvotes: 2,
    commentCount: 11,
    tags: ["GE", "Horno", "Calentamiento"],
  },
  {
    id: "thread-7",
    title: "El hacedor de hielo Samsung se sigue congelando",
    content:
      "El hacedor de hielo de mi refrigerador Samsung French Door se congela y deja de producir hielo. Ya lo descongele manualmente dos veces, pero el problema vuelve. ¿Existe una solucion definitiva? Parece ser una falla comun en Samsung.",
    author: mockUsers[1],
    createdAt: "2026-03-01T09:15:00Z",
    upvotes: 56,
    downvotes: 4,
    commentCount: 34,
    tags: ["Samsung", "Hacedor de hielo", "Congelador"],
  },
  {
    id: "thread-8",
    title: "¿Alguna recomendacion de campana extractora silenciosa?",
    content:
      "Quiero reemplazar mi campana extractora vieja y ruidosa. ¿Que modelos recomiendan que sean silenciosos pero potentes? Mi presupuesto esta entre $500 y $800. La cocina mide unos 200 pies cuadrados y tiene una estufa estandar de 30 pulgadas.",
    author: mockUsers[2],
    createdAt: "2026-02-28T20:00:00Z",
    upvotes: 19,
    downvotes: 0,
    commentCount: 9,
    tags: ["Campana extractora", "Recomendacion", "Cocina"],
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
      "De hecho me ha ido muy bien comprando repuestos en PeterParts. Tienen una gran seleccion de accesorios KitchenAid, precios competitivos y envio rapido.",
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
    title: "El hacedor de hielo Samsung se sigue congelando",
    threadId: "thread-7",
    visitedAt: "2026-03-03T09:00:00Z",
  },
  {
    id: "recent-2",
    title: "¿Consejos para mantener electrodomesticos de acero inoxidable?",
    threadId: "thread-5",
    visitedAt: "2026-03-02T18:30:00Z",
  },
  {
    id: "recent-3",
    title: "Mi refrigerador Whirlpool hace ruidos extranos",
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
