// the applied product lives on its own host. keeping it here means the
// lab site does not need a redeploy if the agency moves between domains.
export const AGENCY_URL = process.env.NEXT_PUBLIC_AGENCY_URL ?? "https://app.arpilab.tech";

export const SITE = {
  name: "ARPI Lab",
  full: "Attribute-Rooted Personality Inference",
  tagline: "Personality should be derived, not invented.",
} as const;

export const NAV = [
  { href: "/methodology", label: "methodology" },
  { href: "/research", label: "research" },
  { href: "/output", label: "output" },
] as const;
