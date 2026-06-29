import { CENTROIDS } from "./centroids";
import type { NormieFeatures } from "@/lib/normies";

export type ClusterResult = {
  cluster: number;
  department: string;
  grade: string;
};

const LABELS: Array<{ department: string; grade: string }> = [
  { department: "entropy management", grade: "jr. continuity officer" },
  { department: "strategic continuity", grade: "sr. institutional memory specialist" },
  { department: "distributed operations", grade: "associate field operative" },
  { department: "pattern recognition services", grade: "principal analyst" },
  { department: "client experience", grade: "engagement coordinator" },
  { department: "emergent technologies", grade: "staff systems integrator" },
  { department: "organizational development", grade: "deputy director" },
  { department: "creative infrastructure", grade: "lead experimental practitioner" },
];

export function getLabel(cluster: number): { department: string; grade: string } {
  return LABELS[cluster] ?? LABELS[0];
}

// 16-dim feature vector:
// [density, topMass, bottomMass, centerMass, edgeMass,
//  cat_human, cat_cat, cat_alien, cat_agent,
//  form_formal, form_casual, form_experimental, form_eccentric,
//  energy_reserved, energy_baseline, energy_expressive]
export function buildVector(f: NormieFeatures): number[] {
  const d = f.distribution;
  const a = f.archetype;
  return [
    f.density,
    d.topMass,
    d.bottomMass,
    d.centerMass,
    d.edgeMass,
    a.category === "human" ? 1 : 0,
    a.category === "cat" ? 1 : 0,
    a.category === "alien" ? 1 : 0,
    a.category === "agent" ? 1 : 0,
    a.formality === "formal" ? 1 : 0,
    a.formality === "casual" ? 1 : 0,
    a.formality === "experimental" ? 1 : 0,
    a.formality === "eccentric" ? 1 : 0,
    a.energy === "reserved" ? 1 : 0,
    a.energy === "baseline" ? 1 : 0,
    a.energy === "expressive" ? 1 : 0,
  ];
}

function euclidean(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2;
  return Math.sqrt(sum);
}

export function assignCluster(vector: number[]): number {
  const pool = CENTROIDS.length > 0 ? CENTROIDS : null;
  if (!pool) return fallbackCluster(vector);
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < pool.length; i++) {
    const d = euclidean(vector, pool[i]);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}

// deterministic fallback used when CENTROIDS is empty.
function fallbackCluster(v: number[]): number {
  const [, , , , , , , , , formal, casual, experimental, eccentric, reserved, , expressive] = v;
  if (expressive && eccentric) return 0;
  if (reserved && formal) return 1;
  if (!expressive && !reserved && casual) return 2;
  if (!expressive && !reserved && formal) return 3;
  if (expressive && experimental) return 5;
  if (reserved && casual) return 6;
  if (expressive && (casual || experimental)) return 7;
  return 4;
}

export function getDepartmentFromFeatures(f: NormieFeatures): ClusterResult {
  const cluster = assignCluster(buildVector(f));
  return { cluster, ...getLabel(cluster) };
}
