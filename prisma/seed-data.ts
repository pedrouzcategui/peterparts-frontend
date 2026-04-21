export interface SeedForumUser {
  id: string;
  name: string;
  joinedDate: string;
}

export interface SeedForumReply {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
}

export interface SeedForumThread {
  id: string;
  slug: string;
  status: "approved" | "pending" | "rejected";
  moderatedAt?: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  tags: string[];
  replies: SeedForumReply[];
}

export const reviewAuthorNames = [
  "Lucia Herrera",
  "Mateo Rojas",
  "Valentina Castro",
  "Diego Navarro",
  "Camila Ortega",
  "Sofia Marquez",
  "Javier Paredes",
  "Elena Fuentes",
  "Tomas Salazar",
  "Paula Benitez",
  "Andres Molina",
  "Daniela Vega",
  "Alvaro Prieto",
  "Beatriz Leon",
  "Rafael Campos",
  "Natalia Perdomo",
  "Josefina Duarte",
  "Martin Aguirre",
  "Adriana Bello",
  "Ricardo Sosa",
];

export const reviewTitleTemplates = [
  "Muy buena compra para el hogar",
  "Cumple muy bien con lo prometido",
  "Se nota la calidad desde el primer uso",
  "Buena relacion entre precio y resultado",
  "Rendimiento estable en el dia a dia",
  "Mejor de lo que esperaba",
  "Ideal para uso frecuente",
  "Volveria a comprar este modelo",
];

export const reviewOpeningSentences = [
  "Llego bien empacado y fue facil ponerlo a trabajar desde el primer dia.",
  "La instalacion fue sencilla y el equipo se sintio solido apenas lo saque de la caja.",
  "Lo compre para uso frecuente en casa y la experiencia inicial fue bastante positiva.",
  "Despues de varias semanas de uso se mantiene firme y responde como esperaba.",
  "Se nota que es un producto pensado para trabajar sin complicaciones en la cocina.",
];

export const reviewPerformanceSentences = [
  "El funcionamiento ha sido parejo incluso en jornadas largas de uso.",
  "Hasta ahora no ha presentado fallas y el rendimiento sigue siendo consistente.",
  "La respuesta del equipo ha sido estable y se siente confiable para el uso diario.",
  "Ha resuelto justo lo que necesitabamos sin ruidos raros ni piezas flojas.",
  "Me gusto que mantiene un ritmo constante y no da sensacion de fragilidad.",
];

export const reviewClosingSentences = [
  "Si alguien busca una opcion confiable, este modelo vale la pena.",
  "Por ahora la compra se siente acertada y lo recomendaria sin problema.",
  "Quede conforme con la calidad general y con la experiencia de compra.",
  "No me arrepiento de haberlo elegido y volveria a comprar en esta linea.",
  "En conjunto transmite buena calidad y ha funcionado mejor de lo esperado.",
];

export const seedForumUsers: SeedForumUser[] = [
  {
    id: "user-1",
    name: "Carlos Mendez",
    joinedDate: "2024-06-15",
  },
  {
    id: "user-2",
    name: "Maria Garcia",
    joinedDate: "2024-08-20",
  },
  {
    id: "user-3",
    name: "Juan Rodriguez",
    joinedDate: "2025-01-10",
  },
  {
    id: "user-4",
    name: "Ana Lopez",
    joinedDate: "2025-02-05",
  },
  {
    id: "user-5",
    name: "Pedro Sanchez",
    joinedDate: "2024-11-22",
  },
  {
    id: "user-6",
    name: "Laura Figueroa",
    joinedDate: "2025-04-18",
  },
  {
    id: "user-7",
    name: "Diego Morales",
    joinedDate: "2025-07-09",
  },
  {
    id: "user-8",
    name: "Gabriela Torres",
    joinedDate: "2025-09-02",
  },
];

export const seedForumThreads: SeedForumThread[] = [
  {
    id: "thread-1",
    slug: "vale-la-pena-cambiar-el-engranaje-de-una-kitchenaid-artisan-de-5-anos",
    status: "approved",
    moderatedAt: "2026-03-03T11:10:00Z",
    title: "Vale la pena cambiar el engranaje de una KitchenAid Artisan de 5 anos?",
    content:
      "Mi KitchenAid Artisan ha empezado a sonar mas de lo normal cuando amaso masas densas. Un tecnico me dijo que probablemente sea el engranaje principal y que conviene reemplazarlo antes de que dañe otras piezas. Quisiera saber si alguien ya hizo esta reparacion y si el cambio realmente devolvio el rendimiento original.",
    authorId: "user-1",
    createdAt: "2026-03-03T10:30:00Z",
    upvotes: 26,
    downvotes: 1,
    tags: ["KitchenAid", "Repuestos", "Batidora"],
    replies: [
      {
        id: "reply-1",
        authorId: "user-2",
        content:
          "Yo cambie ese engranaje hace unos meses y la diferencia fue clara. La batidora dejo de hacer el golpeteo y volvio a mezclar con fuerza pareja.",
        createdAt: "2026-03-03T11:02:00Z",
        upvotes: 11,
        downvotes: 0,
      },
      {
        id: "reply-2",
        authorId: "user-6",
        content:
          "Si abres la maquina, aprovecha de revisar grasa y retenes. En varios casos el problema empieza por falta de lubricacion y el engranaje ya llega castigado.",
        createdAt: "2026-03-03T11:18:00Z",
        upvotes: 8,
        downvotes: 0,
      },
      {
        id: "reply-3",
        authorId: "user-1",
        content:
          "Buen dato. Voy a pedir el kit completo para no abrirla dos veces y les cuento como me va.",
        createdAt: "2026-03-03T11:35:00Z",
        upvotes: 4,
        downvotes: 0,
      },
    ],
  },
  {
    id: "thread-2",
    slug: "mi-cafetera-cuisinart-calienta-pero-el-cafe-sale-muy-claro",
    status: "approved",
    moderatedAt: "2026-03-02T09:40:00Z",
    title: "Mi cafetera Cuisinart calienta, pero el cafe sale muy claro",
    content:
      "Tengo una Cuisinart de 14 tazas y desde hace una semana el cafe sale menos concentrado aunque uso la misma cantidad de cafe molido. Ya limpie el filtro y revise la jarra, pero no veo nada raro. No se si puede ser un problema del flujo de agua o de la temperatura real.",
    authorId: "user-2",
    createdAt: "2026-03-02T08:15:00Z",
    upvotes: 17,
    downvotes: 0,
    tags: ["Cuisinart", "Cafe", "Mantenimiento"],
    replies: [
      {
        id: "reply-4",
        authorId: "user-7",
        content:
          "Cuando me paso algo parecido era acumulacion de sarro. Hice dos ciclos de limpieza y el sabor volvio a la normalidad.",
        createdAt: "2026-03-02T08:54:00Z",
        upvotes: 6,
        downvotes: 0,
      },
      {
        id: "reply-5",
        authorId: "user-3",
        content:
          "Tambien revisa la tapa del deposito. Si no sella bien, el paso de agua cambia y la extraccion queda floja.",
        createdAt: "2026-03-02T09:11:00Z",
        upvotes: 5,
        downvotes: 0,
      },
    ],
  },
  {
    id: "thread-3",
    slug: "el-vaso-del-cuisinart-14-cup-food-processor-pierde-ajuste-con-mezclas-densas",
    status: "approved",
    moderatedAt: "2026-03-01T13:05:00Z",
    title: "El vaso del Cuisinart 14-Cup Food Processor pierde ajuste con mezclas densas",
    content:
      "Mi Cuisinart 14-Cup Food Processor sigue cortando bien, pero cuando proceso mezclas mas densas siento que la tapa y el vaso ya no ajustan tan firmes como antes. Antes de comprar piezas nuevas queria saber si a alguien le funciono cambiar solo el aro de sellado o si conviene pedir el conjunto completo del recipiente.",
    authorId: "user-3",
    createdAt: "2026-03-01T11:45:00Z",
    upvotes: 22,
    downvotes: 0,
    tags: ["Cuisinart", "Food Processor", "Repuestos"],
    replies: [
      {
        id: "reply-6",
        authorId: "user-4",
        content:
          "A mi me funciono cambiar primero el aro y revisar que el seguro de la tapa no estuviera desgastado. Con eso recupero bastante firmeza.",
        createdAt: "2026-03-01T12:20:00Z",
        upvotes: 7,
        downvotes: 0,
      },
      {
        id: "reply-7",
        authorId: "user-8",
        content:
          "Si el bowl ya tiene juego lateral, yo pediria el conjunto completo. En uso pesado esa holgura vuelve rapido aunque cambies solo una pieza.",
        createdAt: "2026-03-01T12:48:00Z",
        upvotes: 5,
        downvotes: 0,
      },
      {
        id: "reply-8",
        authorId: "user-3",
        content:
          "Perfecto, voy a revisar primero el sello y si veo desgaste en el seguro pido todo el recipiente. Gracias por la orientacion.",
        createdAt: "2026-03-01T13:03:00Z",
        upvotes: 3,
        downvotes: 0,
      },
    ],
  },
  {
    id: "thread-4",
    slug: "que-revisar-si-el-whirlpool-top-control-dishwasher-no-seca-bien",
    status: "approved",
    moderatedAt: "2026-02-28T18:10:00Z",
    title: "Que revisar si el Whirlpool Top Control Dishwasher no seca bien",
    content:
      "Tengo el Whirlpool Top Control Dishwasher y los platos salen limpios, pero el secado quedo flojo durante el ultimo mes. Ya active Heated Dry y revise el abrillantador, pero los vasos siguen quedando con humedad. Quisiera saber si alguien noto mejora cambiando resistencia, sensor o sellos antes de pedir repuestos.",
    authorId: "user-5",
    createdAt: "2026-02-28T17:05:00Z",
    upvotes: 19,
    downvotes: 1,
    tags: ["Whirlpool", "Dishwasher", "Diagnostico"],
    replies: [
      {
        id: "reply-9",
        authorId: "user-6",
        content:
          "Yo revisaria primero el dispensador de abrillantador y que la resistencia este tomando temperatura al final del ciclo. En el mio el problema venia por ahi.",
        createdAt: "2026-02-28T17:40:00Z",
        upvotes: 5,
        downvotes: 0,
      },
      {
        id: "reply-10",
        authorId: "user-7",
        content:
          "Tambien limpia bien el filtro y revisa que el sello inferior cierre parejo. Cuando entra aire por ahi el secado pierde bastante fuerza.",
        createdAt: "2026-02-28T18:04:00Z",
        upvotes: 4,
        downvotes: 0,
      },
    ],
  },
  {
    id: "thread-5",
    slug: "el-frozen-bake-del-whirlpool-electric-range-ya-no-cocina-parejo",
    status: "approved",
    moderatedAt: "2026-02-27T16:22:00Z",
    title: "El Frozen Bake del Whirlpool Electric Range ya no cocina parejo",
    content:
      "Mi Whirlpool 5.3 cu. ft. Electric Range siempre habia respondido bien con Frozen Bake, pero ahora los alimentos salen cocidos de forma desigual y tarda mas de la cuenta. Ya descarte tema de bandejas y quisiera saber si alguien mejoro esto cambiando sensor, resistencia o recalibrando el horno.",
    authorId: "user-4",
    createdAt: "2026-02-27T15:10:00Z",
    upvotes: 16,
    downvotes: 0,
    tags: ["Whirlpool", "Electric Range", "Mantenimiento"],
    replies: [
      {
        id: "reply-11",
        authorId: "user-2",
        content:
          "A mi me ayudo recalibrar primero y despues revisar el sensor de temperatura. Estaba leyendo varios grados por debajo y eso afectaba bastante el resultado.",
        createdAt: "2026-02-27T15:42:00Z",
        upvotes: 6,
        downvotes: 0,
      },
      {
        id: "reply-12",
        authorId: "user-8",
        content:
          "Si la resistencia inferior no enciende con fuerza, el horno sigue pareciendo normal pero el cocido queda disparejo. Vale la pena medir continuidad antes de comprar piezas al azar.",
        createdAt: "2026-02-27T16:05:00Z",
        upvotes: 5,
        downvotes: 0,
      },
    ],
  },
  {
    id: "thread-6",
    slug: "los-beaters-del-kitchenaid-7-speed-hand-mixer-tienen-juego-en-velocidades-altas",
    status: "pending",
    title: "Los beaters del KitchenAid 7-Speed Hand Mixer tienen juego en velocidades altas",
    content:
      "Estoy usando el KitchenAid 7-Speed Hand Mixer varias veces por semana y note que los beaters tienen un poco de juego cuando paso de velocidad 5. Sigue mezclando, pero no quiero esperar a que se desgaste el acople. Si alguien ya cambio ese conjunto o conoce una revision preventiva util, me serviria mucho leer su experiencia.",
    authorId: "user-8",
    createdAt: "2026-02-26T20:00:00Z",
    upvotes: 12,
    downvotes: 0,
    tags: ["KitchenAid", "Hand Mixer", "Soporte"],
    replies: [
      {
        id: "reply-13",
        authorId: "user-5",
        content:
          "Estoy pendiente de este tema tambien. El mio tiene algo parecido y quiero atenderlo antes de que desgaste el eje por completo.",
        createdAt: "2026-02-26T21:10:00Z",
        upvotes: 2,
        downvotes: 0,
      },
    ],
  },
];