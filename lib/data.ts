import { Product, FilterGroup } from "./types";

export const products: Product[] = [
  // ── Cuisinart Products ──
  {
    id: "cui-001",
    slug: "cuisinart-14-cup-food-processor",
    name: "Cuisinart 14-Cup Food Processor",
    brand: "Cuisinart",
    category: "Kitchen Appliances",
    subcategory: "Food Processors",
    price: 249.99,
    originalPrice: 299.99,
    description:
      "The Cuisinart 14-Cup Food Processor is a powerhouse in the kitchen. With a 720-watt motor and intuitive controls, this processor handles everything from chopping vegetables to kneading dough with ease. The BPA-free Tritan work bowl is dishwasher-safe for quick cleanup.",
    features: [
      "720-watt motor for powerful performance",
      "14-cup BPA-free Tritan work bowl",
      "Stainless steel blades",
      "Intuitive on/off and pulse controls",
      "Dishwasher-safe parts",
      "Includes slicing disc and shredding disc",
    ],
    color: "Brushed Stainless",
    style: "DFP-14BCWN",
    images: [
      {
        src: "/images/cuisinart-food-processor-1.jpg",
        alt: "Cuisinart 14-Cup Food Processor front view",
      },
      {
        src: "/images/cuisinart-food-processor-2.jpg",
        alt: "Cuisinart 14-Cup Food Processor side view",
      },
      {
        src: "/images/cuisinart-food-processor-3.jpg",
        alt: "Cuisinart 14-Cup Food Processor with accessories",
      },
      {
        src: "/images/cuisinart-food-processor-4.jpg",
        alt: "Cuisinart 14-Cup Food Processor top view",
      },
    ],
    variants: [
      { label: "Brushed Stainless", available: true },
      { label: "White", available: true },
      { label: "Black", available: false },
      { label: "Red", available: true },
    ],
    reviews: { rating: 4.7, count: 312 },
    badge: "Sale",
    inStock: true,
    shippingInfo: "Free shipping on orders over $50",
  },
  {
    id: "cui-002",
    slug: "cuisinart-perfectemp-coffee-maker",
    name: "Cuisinart PerfecTemp 14-Cup Coffee Maker",
    brand: "Cuisinart",
    category: "Kitchen Appliances",
    subcategory: "Coffee Makers",
    price: 99.95,
    description:
      "Brew delicious, hotter coffee with the Cuisinart PerfecTemp 14-Cup Programmable Coffeemaker. Featuring our advanced brewing technology with a hotter coffee option, plus bold and regular settings, this 14-cup coffeemaker keeps everyone happy.",
    features: [
      "14-cup glass carafe",
      "Brew Strength Control — bold or regular",
      "Fully automatic with 24-hour programmability",
      "Self-clean function",
      "Adjustable keep-warm temperature control",
      "Gold-tone and charcoal water filters included",
    ],
    color: "Stainless Steel",
    style: "DCC-3200",
    images: [
      {
        src: "/images/cuisinart-coffee-maker-1.jpg",
        alt: "Cuisinart PerfecTemp Coffee Maker front view",
      },
      {
        src: "/images/cuisinart-coffee-maker-2.jpg",
        alt: "Cuisinart PerfecTemp Coffee Maker with carafe",
      },
      {
        src: "/images/cuisinart-coffee-maker-3.jpg",
        alt: "Cuisinart PerfecTemp Coffee Maker detail",
      },
    ],
    variants: [
      { label: "Stainless Steel", available: true },
      { label: "Black", available: true },
    ],
    reviews: { rating: 4.5, count: 1847 },
    inStock: true,
    shippingInfo: "Free shipping on orders over $50",
  },
  {
    id: "cui-003",
    slug: "cuisinart-griddler-five",
    name: "Cuisinart Griddler FIVE",
    brand: "Cuisinart",
    category: "Kitchen Appliances",
    subcategory: "Grills & Griddles",
    price: 119.99,
    description:
      "Five cooking options in one compact appliance! The Cuisinart Griddler FIVE functions as a contact grill, panini press, full grill, full griddle, and half grill/half griddle. Removable and reversible nonstick cooking plates make cleanup a breeze.",
    features: [
      "5-in-1 functionality",
      "Removable and reversible nonstick plates",
      "Adjustable temperature controls",
      "Floating cover adjusts to food thickness",
      "Integrated drip tray",
      "Dishwasher-safe removable plates",
    ],
    color: "Silver/Black",
    style: "GR-5B",
    images: [
      {
        src: "/images/cuisinart-griddler-1.jpg",
        alt: "Cuisinart Griddler FIVE closed",
      },
      {
        src: "/images/cuisinart-griddler-2.jpg",
        alt: "Cuisinart Griddler FIVE open",
      },
      {
        src: "/images/cuisinart-griddler-3.jpg",
        alt: "Cuisinart Griddler FIVE cooking",
      },
    ],
    variants: [{ label: "Silver/Black", available: true }],
    reviews: { rating: 4.6, count: 924 },
    badge: "Just In",
    inStock: true,
    shippingInfo: "Free shipping on orders over $50",
  },
  {
    id: "cui-004",
    slug: "cuisinart-smartpower-blender",
    name: "Cuisinart SmartPower Duet Blender",
    brand: "Cuisinart",
    category: "Kitchen Appliances",
    subcategory: "Blenders",
    price: 79.95,
    description:
      "The Cuisinart SmartPower Duet Blender/Food Processor combines two appliances in one. Its powerful 500-watt motor handles both blending and food processing tasks. With a 7-speed blender and a 3-cup food processor, it's the perfect kitchen multi-tasker.",
    features: [
      "500-watt motor",
      "7-speed touchpad with LED indicators",
      "48-oz glass blender jar",
      "3-cup food processor attachment",
      "Stainless steel blades",
      "BPA-free components",
    ],
    color: "White",
    style: "BFP-703",
    images: [
      {
        src: "/images/cuisinart-blender-1.jpg",
        alt: "Cuisinart SmartPower Blender front",
      },
      {
        src: "/images/cuisinart-blender-2.jpg",
        alt: "Cuisinart SmartPower Blender with food processor",
      },
    ],
    variants: [
      { label: "White", available: true },
      { label: "Chrome", available: true },
    ],
    reviews: { rating: 4.3, count: 567 },
    inStock: true,
    shippingInfo: "Free shipping on orders over $50",
  },

  // ── Whirlpool Products ──
  {
    id: "whi-001",
    slug: "whirlpool-french-door-refrigerator",
    name: "Whirlpool French Door Refrigerator",
    brand: "Whirlpool",
    category: "Kitchen Appliances",
    subcategory: "Refrigerators",
    price: 1899.0,
    originalPrice: 2199.0,
    description:
      "This Whirlpool French Door Refrigerator features 25 cu. ft. of storage with a full-width pantry-inspired layout. The adaptive defrost system adjusts for optimal performance while the LED interior lighting helps you find items quickly.",
    features: [
      "25 cu. ft. capacity",
      "Full-width pantry-inspired storage",
      "Adaptive defrost for efficient operation",
      "LED interior lighting",
      "Humidity-controlled crispers",
      "External ice and water dispenser with EveryDrop filtration",
    ],
    color: "Fingerprint Resistant Stainless Steel",
    style: "WRF555SDFZ",
    images: [
      {
        src: "/images/whirlpool-fridge-1.jpg",
        alt: "Whirlpool French Door Refrigerator closed",
      },
      {
        src: "/images/whirlpool-fridge-2.jpg",
        alt: "Whirlpool French Door Refrigerator open",
      },
      {
        src: "/images/whirlpool-fridge-3.jpg",
        alt: "Whirlpool French Door Refrigerator interior",
      },
      {
        src: "/images/whirlpool-fridge-4.jpg",
        alt: "Whirlpool French Door Refrigerator dispenser",
      },
    ],
    variants: [
      { label: "Stainless Steel", available: true },
      { label: "Black Stainless", available: true },
      { label: "White", available: false },
    ],
    reviews: { rating: 4.4, count: 2156 },
    badge: "Sale",
    inStock: true,
    shippingInfo: "Free delivery & installation",
  },
  {
    id: "whi-002",
    slug: "whirlpool-electric-range",
    name: "Whirlpool 5.3 cu. ft. Electric Range",
    brand: "Whirlpool",
    category: "Kitchen Appliances",
    subcategory: "Ranges & Ovens",
    price: 849.0,
    description:
      "Cook for the whole family with this 5.3 cu. ft. Whirlpool electric range. The Frozen Bake technology lets you skip preheating to get frozen favourites like pizza and lasagna in the oven faster. FlexHeat dual radiant elements work as two or one burner.",
    features: [
      "5.3 cu. ft. oven capacity",
      "Frozen Bake technology — skip preheating",
      "FlexHeat dual radiant element",
      "Keep Warm setting",
      "Self-cleaning oven",
      "Adjustable self-cleaning oven rack",
    ],
    color: "Stainless Steel",
    style: "WFE525S0JS",
    images: [
      {
        src: "/images/whirlpool-range-1.jpg",
        alt: "Whirlpool Electric Range front view",
      },
      {
        src: "/images/whirlpool-range-2.jpg",
        alt: "Whirlpool Electric Range cooktop",
      },
      {
        src: "/images/whirlpool-range-3.jpg",
        alt: "Whirlpool Electric Range oven interior",
      },
    ],
    variants: [
      { label: "Stainless Steel", available: true },
      { label: "Black", available: true },
      { label: "White", available: true },
    ],
    reviews: { rating: 4.5, count: 1342 },
    inStock: true,
    shippingInfo: "Free delivery & installation",
  },
  {
    id: "whi-003",
    slug: "whirlpool-dishwasher-quiet",
    name: "Whirlpool Top Control Dishwasher",
    brand: "Whirlpool",
    category: "Kitchen Appliances",
    subcategory: "Dishwashers",
    price: 649.0,
    description:
      "Get dishes clean with the #1 Dishwasher Brand in America. This Whirlpool dishwasher features a third level rack for extra space, a soil sensor that determines the right cycle, and 47 dBA quiet operation.",
    features: [
      "47 dBA quiet operation",
      "Third level rack",
      "Soil sensor cycle",
      "1-hour wash cycle",
      "Adjustable upper rack",
      "Heated Dry option",
    ],
    color: "Fingerprint Resistant Stainless Steel",
    style: "WDT750SAKZ",
    images: [
      {
        src: "/images/whirlpool-dishwasher-1.jpg",
        alt: "Whirlpool Dishwasher closed",
      },
      {
        src: "/images/whirlpool-dishwasher-2.jpg",
        alt: "Whirlpool Dishwasher open with dishes",
      },
      {
        src: "/images/whirlpool-dishwasher-3.jpg",
        alt: "Whirlpool Dishwasher third rack",
      },
    ],
    variants: [
      { label: "Stainless Steel", available: true },
      { label: "Black Stainless", available: false },
    ],
    reviews: { rating: 4.6, count: 876 },
    badge: "Just In",
    inStock: true,
    shippingInfo: "Free delivery & installation",
  },
  {
    id: "whi-004",
    slug: "whirlpool-microwave-hood",
    name: "Whirlpool Over-the-Range Microwave",
    brand: "Whirlpool",
    category: "Kitchen Appliances",
    subcategory: "Microwaves",
    price: 349.0,
    description:
      "This Whirlpool over-the-range microwave features 1.9 cu. ft. capacity and sensor cooking that adjusts time and power automatically. Steam cooking function lets you prepare healthy meals quickly.",
    features: [
      "1.9 cu. ft. capacity",
      "Sensor cooking with 6 options",
      "Steam cooking function",
      "300 CFM ventilation system",
      "CleanRelease non-stick interior",
      "Turntable on/off option",
    ],
    color: "Stainless Steel",
    style: "WMH32519HZ",
    images: [
      {
        src: "/images/whirlpool-microwave-1.jpg",
        alt: "Whirlpool Over-the-Range Microwave installed",
      },
      {
        src: "/images/whirlpool-microwave-2.jpg",
        alt: "Whirlpool Microwave interior",
      },
    ],
    variants: [
      { label: "Stainless Steel", available: true },
      { label: "Black", available: true },
      { label: "White", available: true },
    ],
    reviews: { rating: 4.2, count: 543 },
    inStock: true,
    shippingInfo: "Free delivery & installation",
  },

  // ── KitchenAid Products ──
  {
    id: "ka-001",
    slug: "kitchenaid-artisan-stand-mixer",
    name: "KitchenAid Artisan Series 5-Qt Stand Mixer",
    brand: "KitchenAid",
    category: "Kitchen Appliances",
    subcategory: "Stand Mixers",
    price: 449.99,
    description:
      "The iconic KitchenAid Artisan Series 5-Quart Tilt-Head Stand Mixer is the cornerstone of any kitchen. With 10 optimized speeds and a powerful motor, it effortlessly handles the thickest cookie dough to the lightest meringue. Available in over 20 colours.",
    features: [
      "325-watt motor",
      "5-quart stainless steel bowl",
      "10 optimized speeds",
      "Tilt-head design for easy access",
      "Includes flat beater, dough hook, and wire whip",
      "Power hub for 10+ optional attachments",
    ],
    color: "Empire Red",
    style: "KSM150PSER",
    images: [
      {
        src: "/images/kitchenaid-mixer-1.jpg",
        alt: "KitchenAid Artisan Stand Mixer Empire Red",
      },
      {
        src: "/images/kitchenaid-mixer-2.jpg",
        alt: "KitchenAid Artisan Stand Mixer with bowl",
      },
      {
        src: "/images/kitchenaid-mixer-3.jpg",
        alt: "KitchenAid Artisan Stand Mixer attachments",
      },
      {
        src: "/images/kitchenaid-mixer-4.jpg",
        alt: "KitchenAid Artisan Stand Mixer in use",
      },
    ],
    variants: [
      { label: "Empire Red", available: true },
      { label: "Onyx Black", available: true },
      { label: "Ice Blue", available: true },
      { label: "Contour Silver", available: true },
      { label: "Pistachio", available: true },
      { label: "White", available: true },
    ],
    reviews: { rating: 4.8, count: 5231 },
    badge: "Best Seller",
    inStock: true,
    shippingInfo: "Free shipping on orders over $50",
  },
  {
    id: "ka-002",
    slug: "kitchenaid-pro-line-blender",
    name: "KitchenAid Pro Line Series Blender",
    brand: "KitchenAid",
    category: "Kitchen Appliances",
    subcategory: "Blenders",
    price: 549.99,
    originalPrice: 599.99,
    description:
      "Experience the power of the KitchenAid Pro Line Series Blender with its exclusive asymmetric stainless steel blade and Thermal Control jar. Delivers professional-quality results from smoothies to soups with peak 3.5 HP motor performance.",
    features: [
      "3.5 peak HP motor",
      "Exclusive asymmetric blade design",
      "Dual-wall die-cast metal base",
      "Thermal Control jar resists thermal shock",
      "Variable speed dial with recipe presets",
      "Self-cleaning cycle",
    ],
    color: "Candy Apple Red",
    style: "KSB8270CA",
    images: [
      {
        src: "/images/kitchenaid-blender-1.jpg",
        alt: "KitchenAid Pro Line Blender front",
      },
      {
        src: "/images/kitchenaid-blender-2.jpg",
        alt: "KitchenAid Pro Line Blender blending",
      },
      {
        src: "/images/kitchenaid-blender-3.jpg",
        alt: "KitchenAid Pro Line Blender controls",
      },
    ],
    variants: [
      { label: "Candy Apple Red", available: true },
      { label: "Sugar Pearl Silver", available: true },
      { label: "Onyx Black", available: false },
    ],
    reviews: { rating: 4.6, count: 412 },
    badge: "Sale",
    inStock: true,
    shippingInfo: "Free shipping on orders over $50",
  },
  {
    id: "ka-003",
    slug: "kitchenaid-convection-toaster-oven",
    name: "KitchenAid Digital Countertop Oven",
    brand: "KitchenAid",
    category: "Kitchen Appliances",
    subcategory: "Toaster Ovens",
    price: 299.99,
    description:
      "The KitchenAid Digital Countertop Oven with Air Fry provides 9 cooking functions including Air Fry, Bake, Broil, Toast, Bagel, Reheat, Pizza, Keep Warm, and Dehydrate. Spacious interior fits a 12-inch pizza or up to 6 slices of bread.",
    features: [
      "9 preset cooking functions",
      "Air fry capability",
      "12-inch pizza capacity",
      "Even-heat technology",
      "Non-stick interior",
      "120-minute timer with auto shut-off",
    ],
    color: "Black Matte",
    style: "KCO124BM",
    images: [
      {
        src: "/images/kitchenaid-oven-1.jpg",
        alt: "KitchenAid Digital Countertop Oven front",
      },
      {
        src: "/images/kitchenaid-oven-2.jpg",
        alt: "KitchenAid Digital Countertop Oven open",
      },
      {
        src: "/images/kitchenaid-oven-3.jpg",
        alt: "KitchenAid Digital Countertop Oven cooking",
      },
    ],
    variants: [
      { label: "Black Matte", available: true },
      { label: "Empire Red", available: true },
      { label: "Contour Silver", available: true },
    ],
    reviews: { rating: 4.4, count: 789 },
    inStock: true,
    shippingInfo: "Free shipping on orders over $50",
  },
  {
    id: "ka-004",
    slug: "kitchenaid-hand-mixer",
    name: "KitchenAid 7-Speed Hand Mixer",
    brand: "KitchenAid",
    category: "Kitchen Appliances",
    subcategory: "Hand Mixers",
    price: 79.99,
    description:
      "The KitchenAid 7-Speed Hand Mixer is designed for versatile mixing from thick cookie dough to delicate whipped cream. Soft-grip handle provides comfort and control, while the lockable swivel cord keeps it out of the way.",
    features: [
      "7 speed settings",
      "Soft-start feature prevents splattering",
      "Stainless steel turbo beater accessories",
      "Lockable swivel cord",
      "Soft-grip handle",
      "Pro whisk and dough hooks included",
    ],
    color: "Onyx Black",
    style: "KHM7210OB",
    images: [
      {
        src: "/images/kitchenaid-hand-mixer-1.jpg",
        alt: "KitchenAid Hand Mixer front",
      },
      {
        src: "/images/kitchenaid-hand-mixer-2.jpg",
        alt: "KitchenAid Hand Mixer accessories",
      },
    ],
    variants: [
      { label: "Onyx Black", available: true },
      { label: "Empire Red", available: true },
      { label: "White", available: true },
      { label: "Contour Silver", available: false },
    ],
    reviews: { rating: 4.7, count: 1456 },
    badge: "Just In",
    inStock: true,
    shippingInfo: "Free shipping on orders over $50",
  },
];

export const filterGroups: FilterGroup[] = [
  {
    name: "Brand",
    key: "brand",
    options: [
      { label: "Cuisinart", value: "Cuisinart", count: 4 },
      { label: "Whirlpool", value: "Whirlpool", count: 4 },
      { label: "KitchenAid", value: "KitchenAid", count: 4 },
    ],
  },
  {
    name: "Category",
    key: "category",
    options: [
      { label: "Food Processors", value: "Food Processors", count: 1 },
      { label: "Coffee Makers", value: "Coffee Makers", count: 1 },
      { label: "Grills & Griddles", value: "Grills & Griddles", count: 1 },
      { label: "Blenders", value: "Blenders", count: 2 },
      { label: "Refrigerators", value: "Refrigerators", count: 1 },
      { label: "Ranges & Ovens", value: "Ranges & Ovens", count: 1 },
      { label: "Dishwashers", value: "Dishwashers", count: 1 },
      { label: "Microwaves", value: "Microwaves", count: 1 },
      { label: "Stand Mixers", value: "Stand Mixers", count: 1 },
      { label: "Toaster Ovens", value: "Toaster Ovens", count: 1 },
      { label: "Hand Mixers", value: "Hand Mixers", count: 1 },
    ],
  },
  {
    name: "Shop by Price",
    key: "price",
    options: [
      { label: "Under $100", value: "0-100", count: 3 },
      { label: "$100 – $300", value: "100-300", count: 4 },
      { label: "$300 – $500", value: "300-500", count: 2 },
      { label: "$500 – $1000", value: "500-1000", count: 2 },
      { label: "Over $1000", value: "1000-up", count: 1 },
    ],
  },
  {
    name: "Sale & Offers",
    key: "sale",
    options: [
      { label: "On Sale", value: "sale", count: 3 },
      { label: "New Arrivals", value: "new", count: 3 },
    ],
  },
  {
    name: "Color",
    key: "color",
    options: [
      { label: "Stainless Steel", value: "stainless-steel" },
      { label: "Black", value: "black" },
      { label: "Red", value: "red" },
      { label: "White", value: "white" },
      { label: "Silver", value: "silver" },
    ],
  },
];

/** Look up a product by its slug. */
export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

/** Get all unique brands. */
export function getBrands(): string[] {
  return [...new Set(products.map((p) => p.brand))];
}
