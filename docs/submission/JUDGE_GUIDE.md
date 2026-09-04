# Venue Studio Judge Guide

## The one sentence to remember

Venue Studio lets the agent the user already has transform a real empty-hall photo into a structured, photoreal, validated event plan without giving the website an AI API key.

## What is technically distinctive

1. The browser returns actual image content through WebMCP, not merely a URL or DOM description.
2. Image generation is owned by the connected agent and returned to the same page.
3. The agent then receives the complete revision again for visual self-critique and refinement.
4. Spatial elements retain stable IDs, exact quantities, transforms, and validation outside the generated pixels.
5. State-version tokens prevent late agent results from overwriting newer human work.
6. The agent can stage but cannot cross the human approval boundary.

## Best screenshot order

1. `venue-studio-photoreal.png`
2. `venue-studio-plan-map.png`
3. `venue-studio-agent-handoff.png`
4. `../../../public/showcase/all-ten-contact-sheet.jpg`

The hero screenshot should be first because it proves the final result, shared UI, agent tool count, exact capacity, validation, and activity in one frame.

## Thumbnail crop

Use `venue-studio-devpost-thumbnail.png`, the final 1536 × 1024 (3:2) marketing thumbnail. It pairs the human-facing promise with the real before-and-after venue workflow.

Thumbnail copy: **See your empty venue become the event you imagined.**

## Fast manual verification

```bash
npm install
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Expected results:

- 13 unit and WebMCP tests
- 4 Chromium end-to-end journeys
- Successful typecheck, lint, and production build

## Claims to avoid

- Do not describe the layout as CAD-accurate.
- Do not claim fire-code certification.
- Do not say Venue Studio itself calls an image-generation API.
- Do not imply the agent can approve or export.
- Do not promise persistent cloud projects or collaboration.

## Remaining publishing work

- Add a public repository URL.
- Deploy and add a public demo URL, or retain exact local run instructions.
- Record the 90-second demo and add its URL.
- Confirm the live Devpost questions and judging criteria through the Devpost connection.
- Run a secret scan before making the repository public.
