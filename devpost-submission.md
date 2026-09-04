# Venue Studio — Devpost Submission Draft

## Project name

Venue Studio

## Elevator pitch

Show your agent an empty venue and tell it what the day needs. With WebMCP, plan the room together until it feels ready for real people.

## Project story

### Inspiration

An empty venue is exciting until someone has to decide where everything goes. A planner may have one photograph, a headcount, a list of vendors, and a client who keeps changing their mind. The difficult part is not imagining one beautiful room. It is turning all those moving requirements into a plan that still works.

Agents can already suggest where to place a stage or how many tables to rent, but the useful work usually stops inside the conversation. The planner still has to rebuild every suggestion in a separate design tool, check the counts, and explain the room again after every change.

We built Venue Studio because we wanted the conversation and the workspace to become the same thing.

### What it does

Venue Studio turns a photograph of an empty venue into a shared planning canvas for a person and their agent.

The planner uploads a hall, describes the event, and gives exact requirements such as 160 guests, 20 tables, 8 chairs per table, a dance floor, live band, DJ, catering stations, bar, welcome desk, and barbecue area. The connected agent can then:

- read the real project state instead of guessing from the screen;
- configure the brief and exact inventory;
- generate and compare three visible layout strategies;
- add, move, resize, scale, and rotate individual objects;
- receive the actual venue image and a structured edit brief;
- use its own image capability to create a photoreal revision;
- return that image to the browser, inspect it, and refine it again;
- validate capacity, coverage, overlap, arrival flow, and service placement; and
- stage the strongest layout for human review.

Every agent action appears immediately in the same interface the planner controls. The planner can also drag, rotate, and resize objects directly, so the result is a genuine back-and-forth rather than an automated black box.

The agent can recommend and stage a layout. It cannot approve or export one. That final decision belongs to the person planning the event.

### Why Venue Studio is a strong fit for WebMCP

This workflow needs more than browser automation. It combines structured state, precise object transforms, validation rules, images, asynchronous revisions, and a consequential approval boundary.

Without WebMCP, an agent has to infer the room from pixels, click approximate coordinates, and hope the interface still reflects its assumptions. Venue Studio exposes the application's real concepts as 15 focused WebMCP tools: the venue image, brief, inventory, layouts, stable element IDs, transforms, validation, render requests, image revisions, and staging state.

That makes the agent both more capable and more accountable. It acts on the same state the human sees, returns visual evidence of its work, and records each change in a shared activity trail.

### How it creates a better experience

Venue Studio removes the repeated translation between a conversation, a spreadsheet, a sketch, and an image editor. A planner can say, “Make the aisle wider, turn the band toward the dance floor, and keep the barbecue away from the entrance,” then watch those changes appear in the actual project.

The experience stays visual throughout. The planner can compare strategies, switch between a photoreal scene and an editable plan map, inspect exact quantities, and continue manually at any time. State-version tokens stop a slow image result from overwriting newer human work.

There is no sign-in wall, site-owned image model, or image-provider API key. The user's chosen agent supplies the intelligence and image capability; Venue Studio supplies the domain tools, shared state, and guardrails.

### What people and agents can do together now

Before Venue Studio, an agent could describe an event layout while a planner separately rebuilt and checked it. Now they can work on one shared visual world:

1. The person supplies the room, intention, quantities, and taste.
2. The agent operates exact domain objects and proposes several valid directions.
3. The agent receives the real image, creates a photoreal revision, and returns it to the page.
4. The person reacts visually, edits directly, or asks for another change in plain language.
5. The agent captures the latest result, critiques it, refines it, validates it, and stages a recommendation.
6. The person makes the final approval and export decision.

The important change is not that an agent can make a picture. It is that the picture, the structured plan, the validation, and the human decision remain connected through the whole process.

### How we implemented WebMCP

Venue Studio is a React 19 and TypeScript single-page application. Zustand holds the canonical venue, brief, inventory, plan, render, review, and activity state. A deterministic layout engine generates three strategies and revalidates every mutation. Zod validates every tool input at runtime.

Fifteen tools register through `use-webmcp-tool`, which uses `document.modelContext.registerTool` in supported browsers. The tools have explicit read/write annotations and operate the same store and planning engine used by the human interface.

The image workflow is agent-owned. `venue.render_scene` and `venue.refine_scene` return the current image as image content together with a structured edit brief and state-version token. The connected agent edits that image with its own image tool, then calls `venue.apply_image_revision` to return the result. The browser displays the revision and can send it back through `venue.capture_scene` for visual inspection. A stale revision guard prevents late agent output from replacing newer human changes.

There is intentionally no WebMCP tool for final approval or export.

### Challenges we ran into

Our first layouts looked like boxes floating over a photograph. They were technically editable, but they did not help anyone believe the event could really happen there. We moved to a dual-view system: a photoreal scene for judgment and presentation, and a precise plan map for structured editing.

The second challenge was image generation without turning the website into another AI wrapper that needed its own API key. The solution was to let the connected agent own image generation while WebMCP carries the source image, brief, and finished revision between the agent and the page.

Exactness mattered too. “About twenty tables” is not enough for a real event. We model each table as an individual object, preserve chairs per table, expose stable IDs, and validate requested inventory after every human or agent change.

Finally, we had to make the agent useful without giving it the last word. Separating staging from approval kept the collaboration powerful while leaving the consequential action visible and human-controlled.

### Accomplishments we are proud of

- A complete image round trip through WebMCP with no site API key.
- Fifteen focused tools that expose real domain operations instead of simulated chat commands.
- Exact table and chair counts represented as individual editable objects.
- Shared 2D and 3D transforms from both the interface and agent tools.
- Three visible, validated planning strategies.
- Iterative visual inspection and refinement using the latest returned image.
- Protection against stale asynchronous image revisions.
- A clear human-only approval boundary.
- Ten finished sample events that show the system beyond one wedding demo.
- 13 passing unit and WebMCP tests, 4 passing Chromium journeys, and a passing production build.

### What we learned

WebMCP is most valuable when a website exposes its vocabulary, not just its buttons. Giving an agent `transform_elements`, `validate_layout`, and `stage_layout` is far more reliable than asking it to hunt through the DOM.

We also learned that visual feedback changes the quality of collaboration. Once the agent can receive the real image again, it can critique its own output and refine the same scene instead of producing disconnected one-shot images.

Most importantly, the agent does not need to replace the product or the person. The best result came from giving it meaningful tools, shared evidence, and a clear stopping point where human judgment takes over.

### What's next

Next we would add room-dimension calibration, floor-plan import, saved project history, side-by-side revision comparison, accessible-route analysis, reusable venue templates, and shareable client review links. We would also expand the validation engine with venue-specific rules while continuing to present it as planning guidance rather than safety certification.

## Built with

- WebMCP
- React
- TypeScript
- Vite
- Zustand
- Zod
- use-webmcp-tool
- HTML to Image
- Motion
- Vitest
- Playwright
- Chromium
- OpenAI Codex
- Anthropic Claude

## WebMCP tool surface

| Tool | Purpose |
| --- | --- |
| `venue.read_project` | Reads the venue, brief, inventory, layouts, element IDs, issues, and workflow state. |
| `venue.capture_scene` | Returns the current venue as a PNG for visual inspection. |
| `venue.load_image` | Loads an empty-venue image supplied by the user, agent, or another tool. |
| `venue.get_edit_request` | Returns the current image, edit brief, and state-version token. |
| `venue.apply_image_revision` | Applies an agent-produced image without overwriting newer human work. |
| `venue.configure_event` | Sets the event type, guest count, table count, seats per table, name, and notes. |
| `venue.set_requirements` | Adds or replaces count-based event inventory. |
| `venue.generate_layouts` | Generates up to three structured layout strategies. |
| `venue.add_elements` | Adds supported or custom zones to the selected plan. |
| `venue.transform_elements` | Moves, resizes, scales, and rotates objects in two or three dimensions. |
| `venue.remove_elements` | Removes objects using stable element IDs. |
| `venue.render_scene` | Returns the first-render image and complete photoreal edit brief. |
| `venue.refine_scene` | Returns the latest image and a targeted refinement brief. |
| `venue.validate_layout` | Checks capacity, coverage, overlap, arrival flow, and service rules. |
| `venue.stage_layout` | Stages a valid recommendation for visible human review. |

There is no agent-accessible approval or export tool.

## Official submission fields

### Submitter Type

`TODO: choose Individual or Team of Individuals`

### Country of residence

`TODO: enter the submitter's actual country of residence`

### Organization name

Leave blank unless an organization owns or sponsored the entry.

### App Status

New

### If Existing, explain the updates

Not applicable.

### Working live URL

`TODO: add the public deployment URL`

### Testing instructions

Open the live URL in ChatGPT's in-app browser or Google Chrome with WebMCP enabled. No account, `.env` file, or API key is required.

1. Confirm the built-in empty venue is visible.
2. Click **Generate plan** and compare Balanced Flow, Open Arrival, and Service Ready.
3. Switch to **Plan Map**, select a table or the band, then drag, resize, or rotate it.
4. Open **Connect agent** and give the connected agent this prompt:

   > Plan this hall for a 160-person wedding with exactly 20 tables and 8 chairs per table, a central dance floor, live band, DJ, two catering stations, a drinks bar, a welcome desk, and an outdoor barbecue. Generate and compare the strongest layouts. Receive the image and edit brief with `venue.render_scene`, make the photoreal edit using your own image tool, and return it with `venue.apply_image_revision`. Capture and inspect the result. Refine it once to open the central aisle and improve realism, validate it, and stage the best layout for my review.

5. Watch the brief, inventory, layouts, image revision, validation, and activity trail update in the page.
6. Confirm the agent can stage the layout but cannot approve or export it.
7. Use the human **Approve layout** control and confirm export becomes available.

Local verification requires Node.js 20 or newer:

```bash
npm install
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
npm run dev
```

Verified on September 4, 2026:

- TypeScript check: passing
- ESLint: passing
- Vitest: 13/13 passing
- Playwright Chromium: 4/4 passing
- Production build: passing

### Public code repository URL

https://github.com/treasure567/venue-studio

### Agents or clients tested

OpenAI Codex and Anthropic Claude.

### AI tools leveraged

OpenAI Codex was used to help implement, debug, visually iterate, and test the application and its WebMCP contracts. Anthropic Claude was used as a second agent/client for interoperability testing. Image-generation capability from the connected agent was used to create and refine photoreal venue revisions and submission visuals. The website itself does not call an image-generation API or require an AI provider key.

### Learning

Significant.

### Has AI had a positive impact on your career?

Yes.

## Public links

- Live application: `TODO`
- Public repository: https://github.com/treasure567/venue-studio
- Demo video: `TODO — public YouTube video under 3 minutes with audio`

## Project media

The paste-ready, image-rich Devpost About story is in `docs/submission/PROJECT_STORY.md`. Its images use public `raw.githubusercontent.com` URLs so they remain visible when the Markdown is pasted into Devpost.

1. `docs/submission/assets/venue-studio-devpost-thumbnail.png` — 1536 × 1024, 3:2, 2.1 MB; ready for the Devpost thumbnail.
2. `docs/submission/assets/venue-studio-photoreal.png` — hero image showing the finished visual plan and the planning workspace.
3. `docs/submission/assets/venue-studio-plan-map.png` — the same plan as individually editable objects.
4. `docs/submission/assets/venue-studio-agent-handoff.png` — the keyless agent connection and image-refinement loop.
5. `public/showcase/all-ten-contact-sheet.jpg` — ten complete example events.
6. `public/demo-empty-hall.png` — before image for a before-and-after comparison.

## Demo video outline

The final video must be public, under three minutes, and include audio. A focused 90-second cut is enough:

1. **0–10 seconds:** Show the empty hall and explain that ordinary agents can suggest layouts but cannot operate the planning tool.
2. **10–28 seconds:** Give the connected agent the 160-person wedding prompt and show the brief, exact inventory, and three strategies update through WebMCP.
3. **28–50 seconds:** Show `venue.render_scene` return the real image and brief, then show the agent return the photoreal revision through `venue.apply_image_revision`.
4. **50–66 seconds:** Ask for a wider aisle or better service placement and show the revised image replace the first result.
5. **66–78 seconds:** Switch to Plan Map, ask the agent to rotate or move one element, then make one manual adjustment.
6. **78–90 seconds:** Show validation, the shared activity trail, and the agent staging the plan. End on the human-only approval control.

The full narration is in `docs/submission/DEMO_SCRIPT.md`.

## Honest limitations

- The layouts are not CAD-grade and do not infer exact real-world dimensions from one photograph.
- Validation is planning guidance, not fire-code or safety certification.
- Photoreal quality and edit latency depend on the connected agent's image capability.
- Projects are browser-local and are not synchronized between accounts or collaborators.
- Vendor booking, payments, and production operations are outside this hackathon build.

## Final readiness checklist

Complete:

- Humanized project name, elevator pitch, and full project story
- Explicit WebMCP fit, experience improvement, collaboration loop, and implementation explanation
- Fifteen WebMCP tools documented in the README and this draft
- MIT license present
- No environment variables or API keys required
- Thumbnail and supporting screenshots prepared
- Typecheck, lint, unit tests, production build, and Chromium journeys passing
- Tested-agent and AI-tool disclosures drafted

Still required:

- Deploy and verify a working live URL in ChatGPT's in-app browser or WebMCP-enabled Chrome
- Record and publish the under-three-minute demo video with audio
- Confirm submitter type and country of residence
- Create the separate Venue Studio project on Devpost and upload its thumbnail
- Review the final text once in the submitter's own voice before submission

Nothing in this file has been submitted to Devpost.
