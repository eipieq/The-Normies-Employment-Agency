// smoke test for the persona generator.
// runs getPersona on a handful of fixture token ids, prints the key fields.
// run: pnpm persona-smoke

import { getPersona } from "../src/lib/persona";

const FIXTURES = [1, 100, 1337];

async function one(id: number) {
  console.log(`\n--- normie #${id} ---`);
  try {
    const p = await getPersona("normies", id);
    console.log(`job title:   ${p.jobTitle}`);
    console.log(`one-liner:   ${p.oneLiner}`);
    console.log(`work style:  ${p.workStyle}`);
    console.log(`strengths:   ${p.strengths.join(" | ")}`);
    console.log(`blind spots: ${p.blindSpots.join(" | ")}`);
    console.log(`system prompt (first 500 chars):`);
    console.log(p.systemPrompt.slice(0, 500));
    if (p.systemPrompt.length > 500) console.log("  [...]");
  } catch (e) {
    console.log(`ERROR: ${(e as Error).message}`);
  }
}

async function main() {
  for (const id of FIXTURES) {
    await one(id);
  }
}

main();
