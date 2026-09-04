# Venue Studio 90-Second Demo Script

## Demo goal

Make the WebMCP advantage obvious in the first 20 seconds: the agent is not describing a plan or clicking blindly. It is operating the venue application’s real state and closing a visual refinement loop on the same canvas the human controls.

## Before recording

- Use a 1600 × 1000 or 16:10 browser window.
- Reset the demo and keep the empty hall visible.
- Connect an image-capable WebMCP agent.
- Keep the full agent prompt copied as a fallback.
- Close unrelated tabs and disable notification banners.
- Record system audio only if the agent UI produces useful sound.

## Exact prompt

> Plan this hall for a 160-person wedding with exactly 20 tables and 8 chairs per table, a central dance floor, live band, DJ, two catering stations, a drinks bar, a welcome desk, and an outdoor barbecue. Generate and compare the strongest layouts. Receive the image and edit brief with `venue.render_scene`, make the photoreal edit using your own image tool, and return it with `venue.apply_image_revision`. Capture and inspect the result. Refine it once to open the central aisle and improve realism, validate it, and stage the best layout for my review.

## Timeline and narration

### 0–10 seconds — The problem

Visual: the empty hall fills the center of the screen.

Voiceover: “Event planners start with a photo, a headcount, and a long list of requirements. An ordinary agent can suggest a layout, but it cannot operate the real planning tool.”

### 10–22 seconds — The WebMCP request

Visual: paste the exact prompt into the connected agent. Keep Venue Studio visible beside it if the recording layout allows.

Voiceover: “Venue Studio gives my agent 15 focused WebMCP tools: the actual image, inventory, coordinates, layout engine, validation, revisions, and review state.”

### 22–38 seconds — Visible structured work

Visual: show the event name, 160 guests, 20 tables, inventory, three strategies, capacity, coverage, and activity history update.

Voiceover: “The agent is not guessing from the screen. It configures exact quantities, generates three strategies, and receives validation from the same engine the interface uses.”

### 38–56 seconds — The image loop

Visual: show the progressive render states, then the photoreal venue result.

Voiceover: “The site has no image API key. My own agent receives the real hall and edit brief, uses its image tool, and returns the revision directly to the shared studio.”

### 56–68 seconds — Inspection and refinement

Visual: ask for the central aisle refinement and show the new revision replace the previous image.

Voiceover: “The agent can capture the complete result, inspect it visually, and refine the same image until the layout is convincing.”

### 68–80 seconds — Shared control

Visual: switch to Plan Map. Ask the agent to rotate the band or move the barbecue, then drag one table manually.

Voiceover: “Agent and human edit the same numbered objects. Every move re-runs capacity, flow, coverage, and placement checks.”

### 80–90 seconds — Trust boundary

Visual: agent stages the layout. Pause on **Human review required** and the human approval button.

Voiceover: “The agent can recommend and stage. It cannot approve or export. Venue Studio makes the agent powerful, visible, and still accountable to the person.”

## Recording fallback

If live image generation is slow, use the already captured revision only after showing a real WebMCP call that returns the image and edit brief. State clearly that the visual revision was pre-generated through the same handoff. Never imply a hidden site API exists.

If the Devpost player is muted, the UI still communicates the story through the tool count, progressive render ribbon, exact counts, validation, activity labels, and human-review state.
