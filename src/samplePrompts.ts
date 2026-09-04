export interface SamplePrompt {
  id: string;
  title: string;
  eventType: string;
  summary: string;
  prompt: string;
  preview: string;
  source: {
    creator: string;
    label: string;
    license: string;
    url?: string;
  };
}

export const samplePrompts: SamplePrompt[] = [
  {
    id: "emerald-wedding",
    title: "Emerald Nigerian Wedding",
    eventType: "Wedding",
    summary: "Ivory, champagne gold and emerald reception with a live band.",
    preview: "/showcase/thumbs/emerald-wedding.webp",
    source: { creator: "Venue Studio", label: "Original generated venue", license: "Project asset" },
    prompt: "Transform this empty hall into an elegant Nigerian wedding reception for 120 guests. Use exactly 12 round dining tables with 10 champagne-gold chairs per table, ivory linen, low white-and-emerald floral centrepieces, a generous central aisle, a wood dance floor, an elevated live-band stage, a compact DJ booth, two buffet stations, a drinks bar, a welcome desk and a refined photo area. Keep food service away from the entrance and preserve every wall, window, door, column, ceiling feature, floor material and the original camera viewpoint. Render one coherent, ultra-photorealistic venue photograph with physically plausible scale, perspective, reflections and contact shadows. No people, labels, logos or floating furniture. Capture the result, inspect the spacing and realism, refine any weak area, validate the plan and stage the best version for my review.",
  },
  {
    id: "future-launch",
    title: "Future Product Launch",
    eventType: "Corporate",
    summary: "A cinematic technology reveal with runway and demo islands.",
    preview: "/showcase/thumbs/future-product-launch.webp",
    source: { creator: "Venue Studio", label: "Original generated venue", license: "Project asset" },
    prompt: "Turn this empty venue into a premium technology product launch for 140 guests. Create disciplined theatre seating with a wide accessible centre aisle, a low black presentation stage against the far wall, a large seamless LED screen, a short illuminated product runway, two symmetrical demo islands, a registration desk near the entrance, a coffee station, discreet power distribution and a small media zone. Use matte white, graphite and controlled electric-blue light accents while preserving the exact room geometry, doors, ceiling grid, flooring and camera perspective. Produce a realistic architectural-event photograph with crisp commercial lighting, accurate shadows and no people, branding, text or fantasy architecture. Use your own image tool, return every revision through WebMCP, capture and inspect it, then refine until the launch feels buildable and premium.",
  },
  {
    id: "black-tie-awards",
    title: "Black-Tie Awards Night",
    eventType: "Gala",
    summary: "Dramatic awards dinner planned carefully around structural columns.",
    preview: "/showcase/thumbs/black-tie-awards.webp",
    source: { creator: "Venue Studio", label: "Original generated venue", license: "Project asset" },
    prompt: "Design this columned hall as a black-tie awards dinner for 160 guests. Arrange exactly 20 round tables with 8 chairs each in balanced groups around the existing columns, protecting clear sightlines and two continuous exit routes. Add an elegant stage and projection wall at the far end, a central winner's aisle, a trophy display, a compact live-band area, two service stations, a dark timber cocktail bar and subtle lounge seating near the perimeter. Use black, warm ivory, brushed brass and deep burgundy with cinematic amber lighting. Preserve every column, wall, ceiling tile, floor grid and the original camera position. The final result must be one convincing high-end event photograph with realistic materials and contact shadows, no people, text, logos or structural changes. Capture and visually inspect the render, refine any collision or awkward sightline, validate and stage it.",
  },
  {
    id: "runway",
    title: "Luxury Fashion Runway",
    eventType: "Fashion",
    summary: "A long editorial catwalk with precise guest and media zones.",
    preview: "/showcase/thumbs/luxury-fashion-runway.webp",
    source: { creator: "Erik Drost", label: "Empty convention center", license: "CC BY 2.0", url: "https://commons.wikimedia.org/wiki/File:Empty_convention_center.jpg" },
    prompt: "Plan this hall as a luxury fashion show for 220 guests. Build one long raised runway on the strongest visual axis, two exact banks of guest seating, a photographers' pit, backstage screening, check-in, coat check, a sponsor-photo wall and a compact post-show cocktail lounge. Keep a clear fire route around both sides and protect every door. Use warm white architectural light, a matte ivory runway, black seating and restrained chrome accents. Preserve the room and camera exactly. Create a photoreal editorial event photograph, then capture, inspect and refine the layout before validation and staging.",
  },
  {
    id: "afrobeats-birthday",
    title: "Afrobeats Birthday Concert",
    eventType: "Birthday",
    summary: "Energetic concert floor with VIP lounges and safe circulation.",
    preview: "/showcase/thumbs/afrobeats-birthday.webp",
    source: { creator: "Craftsman Concrete Floors", label: "Empty modern warehouse", license: "Unsplash License", url: "https://unsplash.com/photos/empty-modern-warehouse-interior-with-polished-concrete-floor-3lkaszxWfGc" },
    prompt: "Convert this venue into an immersive Afrobeats birthday concert for 300 guests. Create a professional performance stage with live band and DJ, a large standing dance zone, two raised VIP lounges, two drinks bars, a dramatic photo wall, a welcome checkpoint, security lanes and clearly protected exits. Use rich amber, magenta and cobalt concert lighting with polished black production equipment and subtle gold celebration details. Preserve all architecture and render a plausible premium concert photograph with no crowd, text or logos. Capture the scene, inspect access and realism, refine it, validate the plan and stage the safest version.",
  },
  {
    id: "leadership-summit",
    title: "Leadership Summit",
    eventType: "Conference",
    summary: "A credible business conference with breakout and sponsor zones.",
    preview: "/showcase/thumbs/leadership-summit.webp",
    source: { creator: "Declan Sun", label: "Empty conference auditorium", license: "Unsplash License", url: "https://unsplash.com/photos/an-empty-auditorium-with-rows-of-empty-chairs-tCFbHdEIUMU" },
    prompt: "Arrange this empty venue for a 180-person leadership summit. Use theatre seating with an accessible central aisle, a presentation stage with twin screens, a moderated-panel setup, two acoustic breakout pods, four sponsor demo booths, registration, coffee service, a media desk and reliable perimeter power. Maintain clean circulation and unobstructed doors. Use warm neutral conference lighting, walnut, cream and muted forest green. Preserve the original building and camera view, render one realistic buildable conference photograph, capture it, inspect it, refine weaknesses, validate and stage the best plan.",
  },
  {
    id: "art-cocktail",
    title: "Art & Cocktail Evening",
    eventType: "Exhibition",
    summary: "Gallery circulation, sculptural lighting and refined hospitality.",
    preview: "/showcase/thumbs/art-cocktail-evening.webp",
    source: { creator: "Andy Beecroft", label: "Empty Leeds Art Gallery", license: "CC BY-SA 2.0", url: "https://commons.wikimedia.org/wiki/File:An_Empty_Gallery_in_Leeds_Art_Gallery_-_geograph.org.uk_-_7848134.jpg" },
    prompt: "Transform this room into a contemporary art exhibition and cocktail evening for 130 guests. Place eight sculptural display plinths and six framed-art partitions with generous circulation, then add elegant standing cocktail tables, a small acoustic stage, a curved bar, a catering station, a collector lounge and a discreet welcome desk. Use gallery-white light with warm pools around the art, pale stone, brushed bronze and deep green upholstery. Keep every architectural feature unchanged. Produce a sophisticated photoreal gallery-event image, capture and inspect it, refine the flow and stage the validated result.",
  },
  {
    id: "graduation",
    title: "Graduation Ceremony",
    eventType: "Ceremony",
    summary: "Formal stage, family seating and accessible procession routes.",
    preview: "/showcase/thumbs/graduation-ceremony.webp",
    source: { creator: "Radek Grzybowski", label: "Empty concert hall", license: "Unsplash License", url: "https://unsplash.com/photos/empty-arranged-theater-YU6A5I_IjTw" },
    prompt: "Prepare this hall for a graduation ceremony and family reception for 240 guests. Create a formal stage with lectern, graduate seating, balanced family-chair sections, one wide processional aisle, wheelchair spaces, a certificate-photo area, registration, two refreshment stations and clearly marked open exit routes. Use navy, cream and restrained gold with bright dignified lighting. Preserve the architecture and viewpoint. Render a realistic ceremony photograph without people or text, inspect the captured scene, refine any blocked view or route, validate and stage the final plan.",
  },
  {
    id: "food-festival",
    title: "Indoor Food Festival",
    eventType: "Festival",
    summary: "Vendor stalls, shared dining and queue-aware service planning.",
    preview: "/showcase/thumbs/indoor-food-festival.webp",
    source: { creator: "Mike Hindle", label: "Derby Market Hall", license: "Unsplash License", url: "https://unsplash.com/photos/interior-view-of-a-large-ornate-market-hall-_lk-twTtjr4" },
    prompt: "Turn this venue into an indoor food festival for 250 visitors. Arrange twelve distinct vendor stalls around the perimeter, shared communal tables in the centre, a chef-demonstration stage, two drinks points, hand-wash stations, waste points, a welcome desk and one barbecue zone positioned at a safe ventilated edge. Design visible queue lanes without blocking exits or seating. Use lively natural materials, warm market lighting and restrained colour. Preserve the hall exactly and create a photoreal operational event scene, then capture, inspect, refine, validate and stage it.",
  },
  {
    id: "charity-auction",
    title: "Charity Dinner & Auction",
    eventType: "Fundraiser",
    summary: "A polished donor dinner with auction, display and entertainment.",
    preview: "/showcase/thumbs/charity-dinner-auction.webp",
    source: { creator: "SR Engineers and Consultants", label: "Empty banquet hall", license: "Unsplash License", url: "https://unsplash.com/photos/empty-banquet-hall-with-red-chairs-and-round-tables-S3Qh6mNZbLc" },
    prompt: "Design this venue for a 200-person charity dinner and live auction. Use exactly 20 round tables with 10 chairs each, a raised auction stage, two presentation screens, a central bidding aisle, a silent-auction display gallery, a live jazz-band corner, two catering stations, a refined bar, a donor welcome desk and a photography backdrop. Keep service circulation separate from guest arrival and preserve all exits. Use midnight blue, warm ivory, antique gold and candle-like lighting. Preserve the original architecture and camera. Render one luxurious realistic photograph, capture it, inspect the composition, refine any weak area, validate and stage the strongest result.",
  },
];
