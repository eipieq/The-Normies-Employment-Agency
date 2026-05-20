import type { Traits } from "./types";
import type { Distribution } from "./analyze";

// derive an archetype profile from traits + visual mass.
// this is interpretation: each axis pulls from one or two anchor traits.
// the persona generator in phase 3 reads this + the raw traits and rifs.

export type Category = "human" | "cat" | "alien" | "agent";
export type Formality = "formal" | "casual" | "experimental" | "eccentric";
export type Perception =
  | "guarded"
  | "open"
  | "digital"
  | "theatrical"
  | "sharp";
export type Demeanor =
  | "friendly"
  | "serious"
  | "neutral"
  | "peaceful"
  | "confident";
export type Energy = "reserved" | "baseline" | "expressive";

export type ArchetypeFeatures = {
  category: Category;
  formality: Formality;
  perception: Perception;
  demeanor: Demeanor;
  energy: Energy;
  tags: string[]; // free-form flavor for the LLM
};

// anchor tables. unknown values fall through to a sensible default.

const ACCESSORY_FORMALITY: Record<string, Formality> = {
  "Top Hat": "formal",
  Fedora: "formal",
  "Cowboy Hat": "formal",
  "Bow Tie": "formal",
  Beanie: "casual",
  Cap: "casual",
  "Cap Forward": "casual",
  Bandana: "casual",
  Headband: "casual",
  "Do-Rag": "casual",
  Hoodie: "casual",
  "Gold Chain": "eccentric",
  "Silver Chain": "eccentric",
  Earring: "eccentric",
  "No Accessories": "casual",
};

const EYES_PERCEPTION: Record<string, Perception> = {
  "Classic Shades": "guarded",
  "Big Shades": "guarded",
  "Regular Shades": "guarded",
  "Small Shades": "guarded",
  "Eye Mask": "guarded",
  "Eye Patch": "guarded",
  "VR Headset": "digital",
  "3D Glasses": "digital",
  "Horned Rim Glasses": "sharp",
  "Nerd Glasses": "sharp",
  "Square Glasses": "sharp",
  "Round Glasses": "sharp",
  Aviators: "theatrical",
  "No Glasses": "open",
};

const EXPRESSION_DEMEANOR: Record<string, Demeanor> = {
  Friendly: "friendly",
  "Slight Smile": "friendly",
  Serious: "serious",
  Confident: "confident",
  Peaceful: "peaceful",
  Content: "peaceful",
  Neutral: "neutral",
};

// "rare-ish" trait values worth bubbling up as flavor tags.
const FLAVOR_VALUES = new Set([
  "VR Headset",
  "3D Glasses",
  "Eye Patch",
  "Eye Mask",
  "Mohawk",
  "Crazy Hair",
  "Wild Hair",
  "Pigtails",
  "Half Shaved",
  "Knitted Cap",
  "Top Hat",
  "Cowboy Hat",
  "Bow Tie",
  "Bandana",
  "Do-Rag",
  "Gold Chain",
  "Silver Chain",
  "Earring",
  "Big Beard",
  "Luxurious Beard",
  "Handlebars",
  "Muttonchops",
  "Spots",
  "Mole",
]);

function lookup<T extends string>(
  table: Record<string, T>,
  value: string,
  fallback: T
): T {
  return table[value] ?? fallback;
}

function toCategory(type: string): Category {
  const t = type.toLowerCase();
  if (t === "cat" || t === "alien" || t === "agent") return t;
  return "human";
}

function energyFrom(density: number, dist: Distribution): Energy {
  // density is the dominant signal, distribution skew bumps it.
  if (density > 0.4) return "expressive";
  if (density < 0.25) return "reserved";
  // mid range: edge-heavy reads more reserved, center-heavy more expressive
  if (dist.centerMass > 0.55) return "expressive";
  if (dist.edgeMass > 0.7) return "reserved";
  return "baseline";
}

function trait(traits: Traits, key: string): string {
  return traits.attributes.find((a) => a.trait_type === key)?.value ?? "";
}

function kebab(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "-");
}

export function archetype(
  traits: Traits,
  density: number,
  dist: Distribution
): ArchetypeFeatures {
  const accessory = trait(traits, "Accessory");
  const eyes = trait(traits, "Eyes");
  const expression = trait(traits, "Expression");
  const type = trait(traits, "Type");

  const tags = traits.attributes
    .filter((a) => FLAVOR_VALUES.has(a.value))
    .map((a) => kebab(a.value));

  return {
    category: toCategory(type),
    formality: lookup(ACCESSORY_FORMALITY, accessory, "casual"),
    perception: lookup(EYES_PERCEPTION, eyes, "open"),
    demeanor: lookup(EXPRESSION_DEMEANOR, expression, "neutral"),
    energy: energyFrom(density, dist),
    tags,
  };
}
