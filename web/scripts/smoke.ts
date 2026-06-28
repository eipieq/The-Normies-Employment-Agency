// fixture smoke test for the data layer.
// hits api.normies.art for a spread of token ids, prints the derived features.
// eyeball the output to make sure pixel/trait/canvas reads look reasonable.
// run: pnpm smoke

import { loadFeatures } from "../src/lib/normies";

const FIXTURES = [0, 1, 42, 100, 777, 1337, 4242, 5000, 9999];

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function shorten(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

async function one(id: number) {
  try {
    const f = await loadFeatures(id);
    const traitLine = f.traits.attributes
      .map((a) => `${a.trait_type[0]}=${a.value}`)
      .join(" ");
    console.log(`\n#${id}  owner ${shorten(f.owner)}`);
    console.log(`  agent: ${f.agent ? `${f.agent.name} (${f.agent.type})` : "unregistered"}`);
    console.log(`  traits: ${traitLine}`);
    console.log(
      `  density ${pct(f.density)}  center ${pct(f.distribution.centerMass)}  edge ${pct(
        f.distribution.edgeMass
      )}`
    );
    console.log(
      `  history: v${f.history.versionCount} churn=${f.history.totalChurn} transformers=${f.history.transformerDiversity} virgin=${f.history.isVirgin}`
    );
    console.log(
      `  archetype: ${f.archetype.category}/${f.archetype.formality}/${f.archetype.perception}/${f.archetype.demeanor}/${f.archetype.energy}`
    );
    if (f.archetype.tags.length > 0) {
      console.log(`  tags: ${f.archetype.tags.join(", ")}`);
    }
  } catch (e) {
    console.log(`\n#${id}  ERROR: ${(e as Error).message}`);
  }
}

async function main() {
  for (const id of FIXTURES) {
    await one(id);
  }
}

main();
