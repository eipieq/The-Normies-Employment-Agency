// output shape from the persona generator.
// everything downstream reads from this.

export type Persona = {
  jobTitle: string;
  oneLiner: string;
  workStyle: string;
  strengths: string[];
  blindSpots: string[];
  systemPrompt: string;
};
