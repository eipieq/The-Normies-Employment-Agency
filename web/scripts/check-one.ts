import { getPersona } from "../src/lib/persona";

const id = parseInt(process.argv[2] ?? "1");

async function main() {
  console.log(`\n--- normie #${id} ---`);
  const p = await getPersona(id);
  console.log("job title:  ", p.jobTitle);
  console.log("one-liner:  ", p.oneLiner);
  console.log("work style: ", p.workStyle);
  console.log("strengths:  ", p.strengths.join(" | "));
  console.log("blind spots:", p.blindSpots.join(" | "));
  console.log("\nsystem prompt:");
  console.log(p.systemPrompt);
}

main();
