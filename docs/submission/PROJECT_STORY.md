# Venue Studio

> Show your agent an empty venue and tell it what the day needs. With WebMCP, plan the room together until it feels ready for real people.

![Venue Studio turning an empty hall into a finished event](https://raw.githubusercontent.com/treasure567/venue-studio/main/docs/submission/assets/venue-studio-devpost-thumbnail.png)

## Inspiration

An empty venue is exciting until someone has to decide where everything goes. A planner may have one photograph, a headcount, a list of vendors, and a client who keeps changing their mind. The difficult part is not imagining one beautiful room. It is turning all those moving requirements into a plan that still works.

Agents can already suggest where to put a stage or how many tables to rent, but the useful work usually stops inside the conversation. The planner still has to rebuild every suggestion in a separate design tool, check the counts, and explain the room again after every change.

We built Venue Studio because we wanted the conversation and the workspace to become the same thing.

## What it does

Venue Studio turns a photograph of an empty venue into a shared planning canvas for a person and their agent.

The planner uploads a room, describes the event, and gives exact requirements. Through WebMCP, the connected agent can read the real project, configure the brief, generate three layout strategies, manipulate individual objects, receive the venue photograph, create and return a photoreal revision, inspect the finished image, refine it, validate the plan, and stage its recommendation.

Every agent action appears in the interface immediately. The planner can also drag, resize, and rotate the same objects directly. The result is a visible back-and-forth rather than an automated black box.

The agent can recommend and stage a layout. It cannot approve or export one. That decision belongs to the person planning the event.

### From an empty hall to a shared plan

#### The room we started with

![An empty event hall before Venue Studio planning](https://raw.githubusercontent.com/treasure567/venue-studio/main/public/demo-empty-hall.png)

#### The room after the agent planned, rendered, inspected, and refined it

![A finished wedding reception created through the Venue Studio WebMCP workflow](https://raw.githubusercontent.com/treasure567/venue-studio/main/docs/submission/assets/venue-studio-photoreal.png)

**Prompt given to the agent**

> Plan this hall for a 160-person wedding with exactly 20 tables and 8 chairs per table, a central dance floor, live band, DJ, two catering stations, a drinks bar, a welcome desk, and an outdoor barbecue. Generate and compare the strongest layouts. Receive the image and edit brief with `venue.render_scene`, make the photoreal edit using your own image tool, and return it with `venue.apply_image_revision`. Capture and inspect the result. Refine it once to open the central aisle and improve realism, validate it, and stage the best layout for my review.

### Ten rooms that began as conversations

These are not mood boards. Each example pairs the final visual result with the prompt an agent can use to operate Venue Studio through WebMCP.

#### 1. Emerald Nigerian Wedding

![Emerald Nigerian wedding planned in Venue Studio](https://raw.githubusercontent.com/treasure567/venue-studio/main/public/showcase/emerald-wedding.png)

**Prompt given to the agent**

> Transform this empty hall into an elegant Nigerian wedding reception for 120 guests. Use exactly 12 round dining tables with 10 champagne-gold chairs per table, ivory linen, low white-and-emerald floral centrepieces, a generous central aisle, a wood dance floor, an elevated live-band stage, a compact DJ booth, two buffet stations, a drinks bar, a welcome desk and a refined photo area. Keep food service away from the entrance and preserve every wall, window, door, column, ceiling feature, floor material and the original camera viewpoint. Render one coherent, ultra-photorealistic venue photograph with physically plausible scale, perspective, reflections and contact shadows. No people, labels, logos or floating furniture. Capture the result, inspect the spacing and realism, refine any weak area, validate the plan and stage the best version for my review.

#### 2. Future Product Launch

![Future product launch planned in Venue Studio](https://raw.githubusercontent.com/treasure567/venue-studio/main/public/showcase/future-product-launch.png)

**Prompt given to the agent**

> Turn this empty venue into a premium technology product launch for 140 guests. Create disciplined theatre seating with a wide accessible centre aisle, a low black presentation stage against the far wall, a large seamless LED screen, a short illuminated product runway, two symmetrical demo islands, a registration desk near the entrance, a coffee station, discreet power distribution and a small media zone. Use matte white, graphite and controlled electric-blue light accents while preserving the exact room geometry, doors, ceiling grid, flooring and camera perspective. Produce a realistic architectural-event photograph with crisp commercial lighting, accurate shadows and no people, branding, text or fantasy architecture. Use your own image tool, return every revision through WebMCP, capture and inspect it, then refine until the launch feels buildable and premium.

#### 3. Black-Tie Awards Night

![Black-tie awards dinner planned around structural columns](https://raw.githubusercontent.com/treasure567/venue-studio/main/public/showcase/black-tie-awards.png)

**Prompt given to the agent**

> Design this columned hall as a black-tie awards dinner for 160 guests. Arrange exactly 20 round tables with 8 chairs each in balanced groups around the existing columns, protecting clear sightlines and two continuous exit routes. Add an elegant stage and projection wall at the far end, a central winner's aisle, a trophy display, a compact live-band area, two service stations, a dark timber cocktail bar and subtle lounge seating near the perimeter. Use black, warm ivory, brushed brass and deep burgundy with cinematic amber lighting. Preserve every column, wall, ceiling tile, floor grid and the original camera position. The final result must be one convincing high-end event photograph with realistic materials and contact shadows, no people, text, logos or structural changes. Capture and visually inspect the render, refine any collision or awkward sightline, validate and stage it.

#### 4. Luxury Fashion Runway

![Luxury fashion runway planned in Venue Studio](https://raw.githubusercontent.com/treasure567/venue-studio/main/public/showcase/luxury-fashion-runway.png)

**Prompt given to the agent**

> Plan this hall as a luxury fashion show for 220 guests. Build one long raised runway on the strongest visual axis, two exact banks of guest seating, a photographers' pit, backstage screening, check-in, coat check, a sponsor-photo wall and a compact post-show cocktail lounge. Keep a clear fire route around both sides and protect every door. Use warm white architectural light, a matte ivory runway, black seating and restrained chrome accents. Preserve the room and camera exactly. Create a photoreal editorial event photograph, then capture, inspect and refine the layout before validation and staging.

#### 5. Afrobeats Birthday Concert

![Afrobeats birthday concert arranged in Venue Studio](https://raw.githubusercontent.com/treasure567/venue-studio/main/public/showcase/afrobeats-birthday.png)

**Prompt given to the agent**

> Convert this venue into an immersive Afrobeats birthday concert for 300 guests. Create a professional performance stage with live band and DJ, a large standing dance zone, two raised VIP lounges, two drinks bars, a dramatic photo wall, a welcome checkpoint, security lanes and clearly protected exits. Use rich amber, magenta and cobalt concert lighting with polished black production equipment and subtle gold celebration details. Preserve all architecture and render a plausible premium concert photograph with no crowd, text or logos. Capture the scene, inspect access and realism, refine it, validate the plan and stage the safest version.

#### 6. Leadership Summit

![Leadership summit with breakout and sponsor zones](https://raw.githubusercontent.com/treasure567/venue-studio/main/public/showcase/leadership-summit.png)

**Prompt given to the agent**

> Arrange this empty venue for a 180-person leadership summit. Use theatre seating with an accessible central aisle, a presentation stage with twin screens, a moderated-panel setup, two acoustic breakout pods, four sponsor demo booths, registration, coffee service, a media desk and reliable perimeter power. Maintain clean circulation and unobstructed doors. Use warm neutral conference lighting, walnut, cream and muted forest green. Preserve the original building and camera view, render one realistic buildable conference photograph, capture it, inspect it, refine weaknesses, validate and stage the best plan.

#### 7. Art and Cocktail Evening

![Contemporary art and cocktail evening created in Venue Studio](https://raw.githubusercontent.com/treasure567/venue-studio/main/public/showcase/art-cocktail-evening.png)

**Prompt given to the agent**

> Transform this room into a contemporary art exhibition and cocktail evening for 130 guests. Place eight sculptural display plinths and six framed-art partitions with generous circulation, then add elegant standing cocktail tables, a small acoustic stage, a curved bar, a catering station, a collector lounge and a discreet welcome desk. Use gallery-white light with warm pools around the art, pale stone, brushed bronze and deep green upholstery. Keep every architectural feature unchanged. Produce a sophisticated photoreal gallery-event image, capture and inspect it, refine the flow and stage the validated result.

#### 8. Graduation Ceremony

![Graduation ceremony with accessible processional routes](https://raw.githubusercontent.com/treasure567/venue-studio/main/public/showcase/graduation-ceremony.png)

**Prompt given to the agent**

> Prepare this hall for a graduation ceremony and family reception for 240 guests. Create a formal stage with lectern, graduate seating, balanced family-chair sections, one wide processional aisle, wheelchair spaces, a certificate-photo area, registration, two refreshment stations and clearly marked open exit routes. Use navy, cream and restrained gold with bright dignified lighting. Preserve the architecture and viewpoint. Render a realistic ceremony photograph without people or text, inspect the captured scene, refine any blocked view or route, validate and stage the final plan.

#### 9. Indoor Food Festival

![Indoor food festival with queue-aware vendor planning](https://raw.githubusercontent.com/treasure567/venue-studio/main/public/showcase/indoor-food-festival.png)

**Prompt given to the agent**

> Turn this venue into an indoor food festival for 250 visitors. Arrange twelve distinct vendor stalls around the perimeter, shared communal tables in the centre, a chef-demonstration stage, two drinks points, hand-wash stations, waste points, a welcome desk and one barbecue zone positioned at a safe ventilated edge. Design visible queue lanes without blocking exits or seating. Use lively natural materials, warm market lighting and restrained colour. Preserve the hall exactly and create a photoreal operational event scene, then capture, inspect, refine, validate and stage it.

#### 10. Charity Dinner and Auction

![Charity dinner and auction planned in Venue Studio](https://raw.githubusercontent.com/treasure567/venue-studio/main/public/showcase/charity-dinner-auction.png)

**Prompt given to the agent**

> Design this venue for a 200-person charity dinner and live auction. Use exactly 20 round tables with 10 chairs each, a raised auction stage, two presentation screens, a central bidding aisle, a silent-auction display gallery, a live jazz-band corner, two catering stations, a refined bar, a donor welcome desk and a photography backdrop. Keep service circulation separate from guest arrival and preserve all exits. Use midnight blue, warm ivory, antique gold and candle-like lighting. Preserve the original architecture and camera. Render one luxurious realistic photograph, capture it, inspect the composition, refine any weak area, validate and stage the strongest result.

### One visual world, two ways to work

The photoreal view lets a planner judge whether the event feels convincing. The Plan Map keeps every table, chair count, service zone, and production element individually editable.

![Venue Studio photoreal workspace](https://raw.githubusercontent.com/treasure567/venue-studio/main/docs/submission/assets/venue-studio-photoreal.png)

![Venue Studio structured plan map](https://raw.githubusercontent.com/treasure567/venue-studio/main/docs/submission/assets/venue-studio-plan-map.png)

![Venue Studio agent connection and image handoff](https://raw.githubusercontent.com/treasure567/venue-studio/main/docs/submission/assets/venue-studio-agent-handoff.png)

## How we built it

### Why WebMCP changes the experience

This workflow needs more than browser automation. It combines structured state, precise transforms, validation rules, images, asynchronous revisions, and a consequential approval boundary.

Without WebMCP, an agent has to infer the room from pixels and click approximate coordinates. Venue Studio exposes the application's real concepts as 15 focused tools: venue image, event brief, inventory, layouts, stable element IDs, object transforms, validation, render requests, image revisions, and staging state.

The agent acts on the same state the human sees. It returns visual evidence of its work, records each change in a shared activity trail, and cannot cross the final approval boundary.

There is no site-owned image model and no image-provider API key. The user's chosen agent supplies the intelligence and image capability. Venue Studio supplies the domain model, shared workspace, and guardrails.

### Implementation

Venue Studio is a React 19 and TypeScript single-page application. Zustand owns the canonical venue, brief, inventory, plan, render, review, and activity state. A deterministic layout engine generates strategies and revalidates every mutation. Zod validates every tool input.

Fifteen tools register through `use-webmcp-tool`, which uses `document.modelContext.registerTool` in a supported browser. `venue.render_scene` and `venue.refine_scene` return the current image plus a structured brief and state-version token. The connected agent edits that image with its own image tool and calls `venue.apply_image_revision` to return the result. `venue.capture_scene` sends the finished image back for inspection. The state-version guard rejects an old image if the person changed the project while the agent was rendering.

## Challenges we ran into

Our first layouts looked like boxes floating over a photograph. They were editable, but they did not help anyone believe the event could really happen there. We changed direction and built two connected views: a photoreal scene for judgment and presentation, and a precise Plan Map for structured editing.

The next challenge was producing those realistic revisions without turning Venue Studio into another AI wrapper that demanded its own API key. We let the connected agent own image generation while WebMCP carries the source image, structured brief, and finished revision between the agent and the page.

Exactness was another hard problem. “About twenty tables” is not enough for a real event. Venue Studio models every table as an individual object, preserves the number of chairs per table, exposes stable element IDs, and revalidates the plan after every human or agent change.

Finally, we needed the agent to be genuinely useful without giving it the last word. Separating staging from approval kept the collaboration powerful while leaving the consequential decision visible and human-controlled.

## Accomplishments that we're proud of

- 15 WebMCP tools registered from the live page
- 13 passing unit and WebMCP tests
- 4 passing Chromium end-to-end journeys
- Passing TypeScript, ESLint, and production build
- Exact individual table objects and chair capacities
- Human and agent object transforms
- Guarded image round trips
- Human-only approval and export

The accomplishment we care about most is the complete visual loop: the agent receives the real venue image, creates a revision with its own image capability, returns it to the shared workspace, receives the result again, critiques it, and continues refining it with the planner.

## What we learned

WebMCP is most useful when a website exposes its vocabulary, not merely its buttons. Giving an agent `transform_elements`, `validate_layout`, and `stage_layout` is more reliable than asking it to hunt through a DOM.

Visual feedback also changes the collaboration. Once the agent receives the actual result again, it can critique and refine the same scene instead of producing disconnected one-shot images.

Most importantly, the agent does not have to replace the product or the person. The best result came from meaningful tools, shared evidence, and a clear point where human judgment takes over.

## What's next for Venue Studio

Next we would add room-dimension calibration, floor-plan import, saved project history, side-by-side revision comparison, accessible-route analysis, reusable venue templates, and client review links. Layout validation will remain planning guidance rather than professional safety certification.
