// the anchor phrases ARE the measurement instrument. they are averaged into
// pole centroids before any trait is scored, so publishing them is what makes
// the method inspectable — and what makes the sensitivity study meaningful.
export type Dimension = {
  key: string;
  name: string;
  letter: string;
  high: string[];
  low: string[];
};

export const DIMENSIONS: Dimension[] = [
  {
    key: "openness",
    name: "Openness",
    letter: "O",
    high: [
      "drawn to abstract and unconventional ideas",
      "finds novelty more comfortable than routine",
      "thinks in metaphors and systems",
      "curious before cautious",
    ],
    low: [
      "prefers the familiar and proven",
      "concrete and literal in thinking",
      "values stability over experimentation",
      "practical before imaginative",
    ],
  },
  {
    key: "conscientiousness",
    name: "Conscientiousness",
    letter: "C",
    high: [
      "plans before acting",
      "follows through on commitments without reminders",
      "finds satisfaction in order and precision",
      "measures twice cuts once",
    ],
    low: [
      "acts on instinct rather than preparation",
      "finds structure restrictive",
      "comfortable leaving things unfinished",
      "spontaneous over systematic",
    ],
  },
  {
    key: "extraversion",
    name: "Extraversion",
    letter: "E",
    high: [
      "draws energy from being around others",
      "speaks before thinking",
      "presence fills a room",
      "processes out loud",
    ],
    low: [
      "recharges in solitude",
      "thinks before speaking",
      "observes more than participates",
      "prefers depth with few over breadth with many",
    ],
  },
  {
    key: "agreeableness",
    name: "Agreeableness",
    letter: "A",
    high: [
      "prioritizes harmony over being right",
      "trusts before verifying",
      "avoids conflict instinctively",
      "genuinely interested in others wellbeing",
    ],
    low: [
      "prioritizes truth over comfort",
      "skeptical before trusting",
      "comfortable with confrontation",
      "competitive more than cooperative",
    ],
  },
  {
    key: "neuroticism",
    name: "Neuroticism",
    letter: "N",
    high: [
      "sensitive to perceived threats and criticism",
      "emotional states shift quickly",
      "anticipates what could go wrong",
      "difficulty letting go of unresolved situations",
    ],
    low: [
      "remains steady under pressure",
      "criticism does not linger",
      "comfortable with ambiguity",
      "bounces back without much deliberate effort",
    ],
  },
];
