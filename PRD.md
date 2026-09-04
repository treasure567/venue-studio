# Product Requirements: Venue Studio

## Product statement

Venue Studio turns a real empty-venue image into a shared planning canvas for a human and an agent. The planner supplies the space, guest count, and required event inventory. The agent operates domain tools to create, compare, adjust, validate, and stage visible arrangements. The human retains final authority.

## Hackathon thesis

The memorable moment is an empty hall visibly filling as the planner speaks: every requested table arrives as an individual physical object with its chair capacity, the stage and dance floor take shape, service moves to the perimeter, and the barbecue stays at the outdoor edge. This is not an agent filling a form. It is an agent operating a visual event-design application through the site’s own WebMCP tools.

The entry should prove four things in under 90 seconds:

1. Natural-language intent replaces repetitive layout setup.
2. The agent uses real domain state and validation rather than guessing from pixels.
3. Every tool action produces immediate, inspectable visual feedback.
4. Staging and human approval are visibly different permissions.

## Target user

The primary user is an independent event planner, venue manager, caterer, or production lead arranging a wedding, conference, concert, party, or corporate event for 20–5,000 attendees.

## Core problem

Venue planning begins with imperfect references: a phone photo, rough headcount, list of vendors, and changing client requests. Today, planners mentally translate these inputs into a layout and repeatedly move furniture and service areas by hand. Generic agents can describe a plan but cannot reliably operate the application’s real inventory, coordinates, validation, and approval workflow.

## Seeded demo scenario

- Venue: a realistic empty modern event hall
- Event: Amina and Kelechi Celebration
- Attendees: 150
- Seating: 19 tables with 8 seats each
- Entertainment: performance stage, live band, DJ, and dance floor
- Service: two catering stations, drinks bar, and barbecue spot
- Arrival: welcome desk and a protected main entrance route
- Priority: balanced guest flow with food operations away from arrival

No attendee names or personal information are required.

## Primary journey

1. The planner opens Venue Studio directly with no sign-in wall.
2. They upload or drag in a photo of an empty hall.
3. They set the event type and numeric attendance details.
4. They ask their agent to arrange the venue with any supported or custom inventory.
5. The agent reads the current project, configures the brief, and sets requirements.
6. The agent generates three spatial strategies.
7. The Plan Map visibly fills with individually editable tables and production zones.
8. The agent receives the actual venue image and edit brief, creates a photoreal revision with its own image tool, and returns it to the studio.
9. The agent captures the complete image, inspects it, and requests targeted refinements.
10. The agent reads stable element IDs, adjusts placement, and runs validation.
11. The planner can drag any zone and sees the same validation update.
12. The agent stages its recommended layout with a reason.
13. The human keeps editing or explicitly approves it.
14. JSON export becomes available only after human approval.

## Functional requirements

### Venue image

- Accept JPG, PNG, and WebP images up to 12 MB.
- Prepare the image locally in the browser at a practical planning resolution.
- Keep the uploaded image in browser-local project state.
- Show the image as the shared background for human and agent actions.
- Provide independent photo and grid toggles.
- Ship with a high-quality empty-hall demo image.

### Event brief

- Support wedding, concert, conference, corporate, birthday, festival, and custom event modes.
- Store event name, guest count, table count, seats per table, and planning notes.
- Update the seating requirement when table or seat counts change.
- Mark generated plans stale whenever the venue, brief, or inventory changes.

### Count-based inventory

- Support dining tables, dance floor, stage, live band, DJ, catering, bar, barbecue, lounge, photo booth, welcome desk, power, restroom, and custom zones.
- Represent people as aggregate capacity rather than named guests.
- Allow humans to increment and decrement inventory from the interface.
- Allow agents to append or replace requirements with explicit quantities.
- Render normal event sizes as individually movable tables while retaining exact totals for larger plans.

### Layout generation

- Generate up to three deterministic strategies from the current brief and requirements.
- Balanced Flow must distribute guest, entertainment, and service zones.
- Open Arrival must protect a generous entrance route.
- Service Ready must prioritise catering and operational access.
- Show each layout’s score, capacity, flow, coverage, and issue state.
- Keep all coordinates relative to the displayed venue so plans remain responsive.

### Direct manipulation

- Show every plan element as a precise labeled marker on the photo-backed Plan Map.
- Show the agent-produced result as one coherent venue photograph rather than disconnected overlays.
- Keep counts and labels tied to the structured plan even when viewing the photoreal revision.
- Make every element draggable with pointer and touch input.
- Allow humans and agents to move, scale, rotate, add, and remove the same objects.
- Provide a focused transform dock plus arrow, size, rotation, and delete keyboard controls.
- Attach drag handles directly to the selected object for flat rotation, 3D orbit, and scaling.
- Return a clean rendered-scene image to the agent so it can inspect and refine repeatedly.
- Reflect human and agent changes through the same state and validator.
- Show selection details and a human remove action.

### Validation

- Block layouts with insufficient guest capacity.
- Block layouts missing required inventory.
- Warn when large zones overlap.
- Warn when a barbecue is placed away from the open-air edge.
- Warn when a non-arrival element narrows the main entrance.
- Recompute scores and issues after generation and every layout mutation.
- Reject stale layout validation and staging with explicit recovery steps.

### Visual feedback

- Use a warm, editorial event-planning aesthetic rather than a dark AI dashboard.
- Keep the real venue image dominant in the workspace.
- Make the empty-to-arranged transition obvious without requiring a second screen.
- Use color, icon, label, and count together so meaning never depends on color alone.
- Keep controls dense enough for professional use while remaining legible at laptop widths.
- Avoid decorative 3D, first-person navigation, and named attendee markers.

### Agent tools

- Register tools imperatively at the top level of the page.
- Use narrow schemas and runtime validation.
- Mark read operations as read-only.
- Return a result summary, state version, verification data, and next actions.
- Expose stable plan and element IDs through `venue.read_project`.
- Call the same store and engine used by the human interface.
- Turn malformed or stale calls into explicit tool errors.

### Human authority

- The agent may stage a current valid layout with a written reason.
- The agent must not be able to approve or export a plan.
- Human approval must be explicit, visible, and logged.
- Export must remain hidden until human approval.

## Non-goals for the challenge build

- Accounts, authentication, or multi-tenant storage
- Named guest management or personally identifiable information
- Automatic wall, door, or depth detection from arbitrary photos
- CAD-grade measurement or fire-code certification
- Real-time multi-user editing
- Vendor booking, purchasing, or payments
- Agent-controlled final approval

## Acceptance criteria

- A normal browser completes the full manual workflow.
- A WebMCP browser discovers exactly fifteen focused venue tools, including image handoff, guarded revision application, and rendered-scene capture.
- The demo prompt completes without DOM automation.
- Agent actions create unmistakable visible changes in the brief, Plan Map, photoreal revision, validation, and activity trail.
- The seeded layout seats at least 150 people and covers every required zone.
- The photo and grid can be toggled independently.
- Human and agent transformations invoke the same validation behavior.
- A brief or inventory change makes previous layouts stale.
- The agent can stage but cannot approve or export.
- The human can approve and reveal JSON export.
- Type checking, linting, unit tests, production build, and Chromium end-to-end tests pass.

## Demo storyboard

### 0–12 seconds

Open on the empty hall. Show that the application begins with a real space, not a synthetic 3D scene. Upload a second venue image if time permits.

### 12–32 seconds

Give the agent the full event brief. Let guest count and inventory update visibly before generation.

### 32–52 seconds

Generate three layouts. Show the Plan Map fill and switch between Balanced Flow, Open Arrival, and Service Ready.

### 52–68 seconds

Ask the agent to request the image, return a photoreal revision, inspect it, and refine the central aisle. Then rotate the band and move the barbecue into the centre on the Plan Map to trigger a placement warning before asking it to recover and revalidate.

### 68–82 seconds

Drag, resize, and rotate one zone manually to prove human and agent operate the same canvas and validation engine.

### 82–90 seconds

Have the agent stage the strongest layout. End on the human review boundary and reveal export only after the human clicks Approve.

## Success measures

- A judge understands the product and WebMCP advantage within 15 seconds.
- The demo contains at least four unmistakable agent-caused visual changes.
- No agent response relies on inferred DOM coordinates or reconstructed validation logic.
- The uploaded venue remains visually recognisable throughout planning.
- The authority boundary is obvious without narration.
- The full scripted path runs reliably in under 90 seconds.
