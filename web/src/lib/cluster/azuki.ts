import { getLabel } from "./index";
import type { ClusterResult } from "./index";

type Attr = { trait_type: string; value: string };

function get(attrs: Attr[], type: string): string {
  return (attrs.find((a) => a.trait_type.toLowerCase() === type.toLowerCase())?.value ?? "").toLowerCase();
}

// deterministic trait-based cluster assignment for azuki.
// mirrors the 8-department label set from the normies clustering.
export function getDepartmentFromAzukiTraits(attributes: Attr[]): ClusterResult {
  const hair = get(attributes, "hair");
  const face = get(attributes, "face");
  const clothing = get(attributes, "clothing");
  const type = get(attributes, "type");
  const offhand = get(attributes, "offhand");
  const eyes = get(attributes, "eyes");

  // elemental/spirit hair → emergent technologies
  if (["water", "lightning", "spirit", "earth", "wind", "fire"].some((k) => hair.includes(k))) {
    return { cluster: 5, ...getLabel(5) };
  }

  // rare type (non-human azuki) → organizational development
  if (type && type !== "human") {
    return { cluster: 6, ...getLabel(6) };
  }

  // offhand item → creative infrastructure
  if (offhand) {
    return { cluster: 7, ...getLabel(7) };
  }

  // face expression → energy
  const isExpressive =
    face.includes("determined") || face.includes("stern") || face.includes("fierce") || face.includes("serious") || face.includes("evil");
  const isReserved =
    face.includes("peaceful") || face.includes("calm") || face.includes("blank") || face.includes("closed") || face.includes("tired");
  const isKind =
    face.includes("kind") || face.includes("relaxed") || face.includes("happy") || face.includes("smil") || face.includes("grin");

  // clothing → formality
  const isFormal =
    clothing.includes("suit") || clothing.includes("robe") || clothing.includes("tracker") || clothing.includes("samurai") || clothing.includes("uniform") || clothing.includes("armor");

  // eye state → perception
  const isObservant =
    eyes.includes("side eye") || eyes.includes("slant") || eyes.includes("serious") || eyes.includes("angry");

  if (isExpressive && isFormal) return { cluster: 0, ...getLabel(0) }; // entropy management
  if (isReserved && isFormal) return { cluster: 1, ...getLabel(1) }; // strategic continuity
  if (isKind) return { cluster: 2, ...getLabel(2) };                  // distributed operations
  if (isObservant || (isExpressive && !isFormal)) return { cluster: 4, ...getLabel(4) }; // client experience
  if (isReserved) return { cluster: 3, ...getLabel(3) };              // pattern recognition services

  // deterministic fallback keyed on trait values so the same token always maps to the same cluster
  const hash = attributes.reduce((acc, a) => acc + a.value.charCodeAt(0) + a.trait_type.charCodeAt(0), 0);
  return { cluster: hash % 8, ...getLabel(hash % 8) };
}
