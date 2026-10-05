/**
 * Category Definitions for Sri Raja Rajeshwara Handloom
 * Predefined B2B Wholesale Categories (12 Categories across 5 Groups)
 * 
 * TOWELS:
 * 1. Towels
 * 2. Richcott Towels
 * 3. Turkey Towels
 * 
 * LUNGIES:
 * 4. Check Lungies
 * 5. Richcott Lungies
 * 
 * TRADITIONAL CLOTH:
 * 6. Maharashtra Dastie
 * 7. Condva
 * 8. Khadhi Long Cloth
 * 9. Deeksha Cloth
 * 
 * DHOTIES:
 * 10. Panchagajam Dhoties
 * 11. Pooja Dhoties
 * 
 * SHAWLS:
 * 12. Sanmaan Shawls
 * 
 * The architecture allows adding more categories dynamically from Supabase.
 */

export type CategoryGroupName = 
  | 'Towels'
  | 'Lungies'
  | 'Traditional Cloth'
  | 'Dhoties'
  | 'Shawls';

export interface ProductCategoryStructure {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly groupName: CategoryGroupName;
  readonly description: string;
  readonly wholesaleHighlight: string;
  readonly sampleSpecs: readonly string[];
  readonly productCodePrefix: string;
  readonly sortOrder: number;
}

export const WHOLESALE_CATEGORIES: readonly ProductCategoryStructure[] = [
  // --------------------------------------------------------------------------
  // TOWELS
  // --------------------------------------------------------------------------
  {
    id: "cat-towels-regular",
    name: "Towels",
    slug: "towels",
    groupName: "Towels",
    description: "Everyday cotton towels woven for high absorbency and durability, suitable for retail shops and institutional supply.",
    wholesaleHighlight: "Fixed wholesale piece rate • Single or bulk bale dispatch",
    sampleSpecs: ["100% Pure Cotton", "High Absorbency", "Double-Stitched Selvage"],
    productCodePrefix: "SRR-TWL",
    sortOrder: 1,
  },
  {
    id: "cat-richcott-towels",
    name: "Richcott Towels",
    slug: "richcott-towels",
    groupName: "Towels",
    description: "Premium combed rich-cotton towels offering superior softness, dense loop pile, and long-lasting commercial grade wash life.",
    wholesaleHighlight: "Heavy GSM fabric • Premium combed yarn • Ready merchant bundles",
    sampleSpecs: ["100% Combed Rich Cotton", "Ultra Soft Terry Pile", "Fast Color Fastness"],
    productCodePrefix: "SRR-RCT",
    sortOrder: 2,
  },
  {
    id: "cat-turkey-towels",
    name: "Turkey Towels",
    slug: "turkey-towels",
    groupName: "Towels",
    description: "Traditional Turkey-style high-GSM woven bath towels with plush jacquard borders and maximum water soak capacity.",
    wholesaleHighlight: "Extra plush weave • Institutional & hotel grade • Uniform piece rate",
    sampleSpecs: ["Heavy Turkish Style Looms", "Plush Pile Finish", "Reinforced End Hems"],
    productCodePrefix: "SRR-TKY",
    sortOrder: 3,
  },

  // --------------------------------------------------------------------------
  // LUNGIES
  // --------------------------------------------------------------------------
  {
    id: "cat-check-lungies",
    name: "Check Lungies",
    slug: "check-lungies",
    groupName: "Lungies",
    description: "Classic multi-color checked cotton lungies with traditional border weaves, woven for daily comfort and air circulation.",
    wholesaleHighlight: "Fast yarn dyeing • Standard 2-meter cut length • High daily retail turnover",
    sampleSpecs: ["Combed Cotton Checks", "Fast Reactive Dyes", "Neat Loom Edge Finish"],
    productCodePrefix: "SRR-CHK",
    sortOrder: 4,
  },
  {
    id: "cat-richcott-lungies",
    name: "Richcott Lungies",
    slug: "richcott-lungies",
    groupName: "Lungies",
    description: "Mercerized rich-cotton lungies with smooth lustrous finish, deep color tones, and premium wear strength.",
    wholesaleHighlight: "Mercerized yarn • Anti-shrink weave • Ready piece packaging",
    sampleSpecs: ["Mercerized Cotton", "Pre-Shrunk Weave", "Contrast Border Finish"],
    productCodePrefix: "SRR-RCL",
    sortOrder: 5,
  },

  // --------------------------------------------------------------------------
  // TRADITIONAL CLOTH
  // --------------------------------------------------------------------------
  {
    id: "cat-maharashtra-dastie",
    name: "Maharashtra Dastie",
    slug: "maharashtra-dastie",
    groupName: "Traditional Cloth",
    description: "Authentic Maharashtra Dastie traditional headwear and cultural wrap cloth with characteristic woven borders.",
    wholesaleHighlight: "Regional traditional staple • High seasonal demand • Fixed piece rate",
    sampleSpecs: ["Traditional Loom Weave", "Ethnic Border Detail", "Standard Dastie Dimensions"],
    productCodePrefix: "SRR-MHD",
    sortOrder: 6,
  },
  {
    id: "cat-condva",
    name: "Condva",
    slug: "condva",
    groupName: "Traditional Cloth",
    description: "Traditional Condva cultural cloth woven with time-honored yarn densities for ritual ceremonies, festivals, and regional wear.",
    wholesaleHighlight: "Sacred ritual & regional cloth • Reliable weaver supply • Direct piece rates",
    sampleSpecs: ["Fine Handloom Weave", "Traditional Ritual Specifications", "Pure Cotton"],
    productCodePrefix: "SRR-CDV",
    sortOrder: 7,
  },
  {
    id: "cat-khadhi-long-cloth",
    name: "Khadhi Long Cloth",
    slug: "khadhi-long-cloth",
    groupName: "Traditional Cloth",
    description: "Breathable, pure unstitched Khadhi long cloth yardage for kurtas, traditional shirts, dhoties, and tailoring stores.",
    wholesaleHighlight: "Supplied in standard folds • Natural cotton texture • No retail markups",
    sampleSpecs: ["Pure Khadi Cotton", "Uniform Loom Width", "Unbleached & Bleached Options"],
    productCodePrefix: "SRR-KLC",
    sortOrder: 8,
  },
  {
    id: "cat-deeksha-cloth",
    name: "Deeksha Cloth",
    slug: "deeksha-cloth",
    groupName: "Traditional Cloth",
    description: "Sacred black, orange, and saffron Deeksha religious cloths for pilgrimage vows (Ayyappa Deeksha, Bhavani Deeksha, Hanuman Deeksha).",
    wholesaleHighlight: "High-volume seasonal demand • Color-fast devotional dyes • Bale packing",
    sampleSpecs: ["Religious Standard Colors", "Colorfast Religious Dyeing", "Complete Vow Sets Available"],
    productCodePrefix: "SRR-DKC",
    sortOrder: 9,
  },

  // --------------------------------------------------------------------------
  // DHOTIES
  // --------------------------------------------------------------------------
  {
    id: "cat-panchagajam-dhoties",
    name: "Panchagajam Dhoties",
    slug: "panchagajam-dhoties",
    groupName: "Dhoties",
    description: "Traditional 9x5 and 10x6 Panchagajam double dhotis with auspicious zari and color borders for weddings, ceremonies, and elders.",
    wholesaleHighlight: "Traditional Panchagaja length • Rich woven border • Complete piece packing",
    sampleSpecs: ["Fine Combed Cotton", "Zari & Kasavu Borders", "Traditional 9x5 Dimensions"],
    productCodePrefix: "SRR-PGD",
    sortOrder: 10,
  },
  {
    id: "cat-pooja-dhoties",
    name: "Pooja Dhoties",
    slug: "pooja-dhoties",
    groupName: "Dhoties",
    description: "Sacred white, yellow, and red bordered single and double dhoties specifically tailored for temple worship and daily puja rituals.",
    wholesaleHighlight: "Devotional & temple trust demand • Clean starch press • Fixed wholesale piece rates",
    sampleSpecs: ["Pure White Cotton", "Temple Ritual Borders", "Individual Packaged Folds"],
    productCodePrefix: "SRR-PJD",
    sortOrder: 11,
  },

  // --------------------------------------------------------------------------
  // SHAWLS
  // --------------------------------------------------------------------------
  {
    id: "cat-sanmaan-shawls",
    name: "Sanmaan Shawls",
    slug: "sanmaan-shawls",
    groupName: "Shawls",
    description: "Felicitation shawls, ceremonial angavastrams, and honor wraps with jacquard borders for dignitaries, institutions, temples, and events.",
    wholesaleHighlight: "High institutional demand • Rich jacquard border • Ready gift piece packing",
    sampleSpecs: ["Jacquard Zari Borders", "Loom Fringed Edges", "Silk-Cotton Blends"],
    productCodePrefix: "SRR-SMS",
    sortOrder: 12,
  },
] as const;

export interface CategoryGroup {
  readonly name: CategoryGroupName;
  readonly slug: string;
  readonly description: string;
  readonly categories: readonly ProductCategoryStructure[];
}

export const WHOLESALE_CATEGORY_GROUPS: readonly CategoryGroup[] = [
  {
    name: "Towels",
    slug: "towels",
    description: "Regular, Richcott, and Turkey towels for retail shops, institutions, and bulk distributors.",
    categories: WHOLESALE_CATEGORIES.filter((c) => c.groupName === "Towels"),
  },
  {
    name: "Lungies",
    slug: "lungies",
    description: "Check and Richcott lungies woven with color-fast dyes for superior daily wear.",
    categories: WHOLESALE_CATEGORIES.filter((c) => c.groupName === "Lungies"),
  },
  {
    name: "Traditional Cloth",
    slug: "traditional-cloth",
    description: "Maharashtra Dastie, Condva, Khadhi Long Cloth, and Deeksha ritual cloth.",
    categories: WHOLESALE_CATEGORIES.filter((c) => c.groupName === "Traditional Cloth"),
  },
  {
    name: "Dhoties",
    slug: "dhoties",
    description: "Traditional Panchagajam and ceremonial Pooja dhoties with fine zari borders.",
    categories: WHOLESALE_CATEGORIES.filter((c) => c.groupName === "Dhoties"),
  },
  {
    name: "Shawls",
    slug: "shawls",
    description: "Sanmaan felicitation shawls and ceremonial angavastrams for institutions and merchants.",
    categories: WHOLESALE_CATEGORIES.filter((c) => c.groupName === "Shawls"),
  },
];

export function getCategoryBySlug(slug: string): ProductCategoryStructure | undefined {
  return WHOLESALE_CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoryGroup(groupName: CategoryGroupName): CategoryGroup | undefined {
  return WHOLESALE_CATEGORY_GROUPS.find((g) => g.name === groupName);
}
