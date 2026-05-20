# design brief

what needs to be designed for the normie employment agency, and when each piece is needed.

naming hierarchy:

- **the normie employment agency** is the umbrella product. owns the top-level brand, the landing page, the wallet auth, the roster.
- **normie works** is the first feature inside the agency. the artwork-to-ai-persona generator. owns the employment card and the chat surface.
- future features (payroll, performance reviews, the union, etc) would sit alongside normie works under the agency.

so when we talk about brand below, there are two levels: agency brand (parent) and normie works (feature mark within the parent).

## the share card is the one thing that matters

it's the link preview on x. shows up at 1200x630, no interaction, has maybe 0.5 seconds to make someone click. this is where we can be louder than the rest of the app without breaking the quiet-utility brand on the actual site.

## what to design

### 1. brand marks (two levels)

**agency mark** (parent):

- wordmark for "the normie employment agency" (lowercase)
- the agency is the umbrella, so this is what lives in the header, the favicon, the og card for the homepage, business-card style surfaces
- think corporate but quietly weird. it's an employment agency for pixel faces.
- monochrome version too, since the site itself is neutral

**normie works mark** (feature within the agency):

- wordmark for "normie works"
- shows up on the employment card itself, on the share image, on the chat surface header
- should clearly sit one level below the agency mark in hierarchy. the agency is the company, normie works is the department.
- could be: a small tag glyph, a stamp, an "employee #" treatment, a punch-card aesthetic. open.

decide how the two relate visually. lockup (both stacked together) or separate marks used in different contexts.

### 2. og share card layout (1200x630 png)

elements that need to be in it:

- **normie portrait**. comes in as svg, monochrome (`#48494b` on `#e3e5e4`). decide how it's presented: bare, framed, on a tinted panel, with a frame that looks like an id badge, whatever.
- **job title**. biggest type. example: "junior chaos engineer", "senior beard archivist", "weekend doom analyst".
- **one-line character description**. medium type. example: "doesn't trust meetings without an agenda. owns 14 highlighters."
- **token id**. small. somewhere. "#0042"
- **agency wordmark + normie works mark**. corner. agency on top, normie works as the feature stamp below or beside it.
- **optional metadata strip**: type (human/cat/alien/agent), level (from canvas), maybe "started: [date hired]".

constraints:

- safe area: assume twitter crops a little. keep critical content away from edges.
- has to work for any normie. heavy dark face, sparse light face, edited canvas, original. layout can't break on outliers.
- has to render server-side via next/og, so anything dynamic ends up as a react component with inline styles. fonts have to be loaded explicitly. svgs are fine.

deliverable: figma layout (or static png mockup) showing two or three variants with different normies. ideally one heavy face, one sparse face, one with a long job title. that's the stress test.

### 3. in-app employment card

the card on `/works/[id]` itself. can be vertical or wider, doesn't need to match the og at 1:1. interactive: has a share button, a connect-wallet cta, a "claim system prompt" section that's gated.

elements:

- everything from the og card
- **gated section** (collapsed/locked state vs unlocked state)
- **share button**
- **copy system prompt** button (only visible when unlocked)
- **open chat** button (only visible when unlocked)

decide: is the gated section just a blurred panel with a lock icon, a clean "connect wallet" cta, or a hidden section that just appears. small thing but it sets the tone.

### 4. small ui bits (low priority, can be later)

- favicon
- og card for the homepage (different from the per-normie one)
- "your roster" empty state (when connected wallet owns 0 normies)
- "not your normie" state (when someone visits a card they don't own)

## when each is needed

| design | needed by phase | hard blocker? |
| --- | --- | --- |
| agency wordmark + mark | phase 1 (foundation) | no, can stub. blocker for theming polish. |
| normie works mark | phase 4 (public card) | yes, lives on the card. |
| og share card | phase 4 (public card) | yes. this is the showpiece. |
| in-app card layout | phase 4 (public card) | yes. |
| gated section treatment | phase 5 (auth + gating) | yes for phase 5. |
| agency landing visuals | phase 8 (polish) | yes for phase 8. |
| roster empty state | phase 7 (roster) | no, can ship without. |

so the only thing needed early is the agency wordmark, so the shadcn theme and header look right from day one. normie works mark and the share card by phase 4. everything else as we hit each phase.
