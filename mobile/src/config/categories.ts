/**
 * Sri Raja Rajeshwara Handloom - 12 Predefined Wholesale Categories
 * Grouped into 5 wholesale product families
 */

export interface MobileCategory {
  id: string;
  name: string;
  slug: string;
  groupName: 'Towels' | 'Lungies' | 'Traditional Cloth' | 'Dhoties' | 'Shawls';
  description: string;
  wholesaleHighlight: string;
  iconName: string;
  sortOrder: number;
}

export const WHOLESALE_CATEGORIES: MobileCategory[] = [
  // 1. Towels
  {
    id: "cat-towels-regular",
    name: "Towels",
    slug: "towels",
    groupName: "Towels",
    description: "Everyday cotton towels woven for high absorbency and durability.",
    wholesaleHighlight: "Fixed wholesale piece rate • Single or bulk bale dispatch",
    iconName: "layers-outline",
    sortOrder: 1,
  },
  {
    id: "cat-richcott-towels",
    name: "Richcott Towels",
    slug: "richcott-towels",
    groupName: "Towels",
    description: "Premium combed rich-cotton towels offering superior softness.",
    wholesaleHighlight: "Heavy GSM fabric • Dense terry loops • Merchant bundles",
    iconName: "sparkles-outline",
    sortOrder: 2,
  },
  {
    id: "cat-turkey-towels",
    name: "Turkey Towels",
    slug: "turkey-towels",
    groupName: "Towels",
    description: "Traditional Turkey-style high-GSM woven bath towels.",
    wholesaleHighlight: "Extra plush weave • Institutional & hotel grade",
    iconName: "water-outline",
    sortOrder: 3,
  },

  // 2. Lungies
  {
    id: "cat-check-lungies",
    name: "Check Lungies",
    slug: "check-lungies",
    groupName: "Lungies",
    description: "Classic multi-color checked cotton lungies with traditional borders.",
    wholesaleHighlight: "Fast reactive yarn dye • 2-meter cut length • High daily retail turnover",
    iconName: "grid-outline",
    sortOrder: 4,
  },
  {
    id: "cat-richcott-lungies",
    name: "Richcott Lungies",
    slug: "richcott-lungies",
    groupName: "Lungies",
    description: "Fine-count mercerized combed rich-cotton lungies.",
    wholesaleHighlight: "Silky feel • Long staple cotton • Shrink resistant",
    iconName: "shirt-outline",
    sortOrder: 5,
  },

  // 3. Traditional Cloth
  {
    id: "cat-maharashtra-dastie",
    name: "Maharashtra Dastie",
    slug: "maharashtra-dastie",
    groupName: "Traditional Cloth",
    description: "Traditional Maharashtrian woven border dasties and rumals.",
    wholesaleHighlight: "Distinctive borders • Authentic loom quality • Retail packs",
    iconName: "square-outline",
    sortOrder: 6,
  },
  {
    id: "cat-condva",
    name: "Condva",
    slug: "condva",
    groupName: "Traditional Cloth",
    description: "Specialized traditional coarse & medium woven utility textiles.",
    wholesaleHighlight: "Sturdy yarn • Cultural ceremonies & trade demand",
    iconName: "ribbon-outline",
    sortOrder: 7,
  },
  {
    id: "cat-khadhi-long-cloth",
    name: "Khadhi Long Cloth",
    slug: "khadhi-long-cloth",
    groupName: "Traditional Cloth",
    description: "Unbleached and bleached handloom khadhi long cloth bolts.",
    wholesaleHighlight: "Pure natural cotton • Breathable • Tailoring & religious supply",
    iconName: "document-text-outline",
    sortOrder: 8,
  },
  {
    id: "cat-deeksha-cloth",
    name: "Deeksha Cloth",
    slug: "deeksha-cloth",
    groupName: "Traditional Cloth",
    description: "Sacred dyed cotton textiles for devotional vows and festivals.",
    wholesaleHighlight: "Traditional sacred dye hues • Bulk temple & festive supply",
    iconName: "flame-outline",
    sortOrder: 9,
  },

  // 4. Dhoties
  {
    id: "cat-panchagajam-dhoties",
    name: "Panchagajam Dhoties",
    slug: "panchagajam-dhoties",
    groupName: "Dhoties",
    description: "Authentic 5-yard (Panchagajam) traditional cotton dhoties with zari borders.",
    wholesaleHighlight: "Fine weave • Standard length • Priests, ceremonies & festivals",
    iconName: "flower-outline",
    sortOrder: 10,
  },
  {
    id: "cat-pooja-dhoties",
    name: "Pooja Dhoties",
    slug: "pooja-dhoties",
    groupName: "Dhoties",
    description: "Pure cotton ritual dhoties and uttareeyams.",
    wholesaleHighlight: "Sanctified quality • Daily retail shop turnover",
    iconName: "infinite-outline",
    sortOrder: 11,
  },

  // 5. Shawls
  {
    id: "cat-sanmaan-shawls",
    name: "Sanmaan Shawls",
    slug: "sanmaan-shawls",
    groupName: "Shawls",
    description: "Ceremonial felicitation (Sanmaanam) shawls with rich jacquard brocade pallus.",
    wholesaleHighlight: "Golden zari motifs • Institutional felicitation & wedding supply",
    iconName: "medal-outline",
    sortOrder: 12,
  },
];

export const CATEGORY_GROUPS = [
  'Towels',
  'Lungies',
  'Traditional Cloth',
  'Dhoties',
  'Shawls',
] as const;
