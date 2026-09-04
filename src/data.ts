import type { ElementKind, EventBrief, LayoutRequirement, VenueImage } from "./types";

export const demoVenue: VenueImage = {
  name: "The Cedar Hall",
  url: "/demo-empty-hall.png",
  width: 1536,
  height: 1024,
  isDemo: true,
};

export const demoBrief: EventBrief = {
  name: "Amina & Kelechi Celebration",
  eventType: "wedding",
  guestCount: 150,
  tableCount: 19,
  seatsPerTable: 8,
  notes: "Warm reception with clear guest flow, an energetic entertainment zone, and food service kept away from the main entrance.",
};

export const elementCatalog: Array<{ kind: ElementKind; label: string; color: string }> = [
  { kind: "seating", label: "Dining tables", color: "#c26f45" },
  { kind: "dance_floor", label: "Dance floor", color: "#8869a8" },
  { kind: "stage", label: "Stage", color: "#394e69" },
  { kind: "band", label: "Live band", color: "#56778f" },
  { kind: "dj", label: "DJ booth", color: "#715a8f" },
  { kind: "catering", label: "Catering", color: "#73935f" },
  { kind: "bar", label: "Bar", color: "#b88a45" },
  { kind: "bbq", label: "Barbecue", color: "#a8573e" },
  { kind: "lounge", label: "Lounge", color: "#9b725f" },
  { kind: "photo_booth", label: "Photo booth", color: "#b66f88" },
  { kind: "registration", label: "Welcome desk", color: "#4e8b83" },
  { kind: "power", label: "Power", color: "#a58c3f" },
  { kind: "restroom", label: "Restroom", color: "#5c7c88" },
  { kind: "custom", label: "Custom zone", color: "#68736b" },
];

export const demoRequirements: LayoutRequirement[] = [
  { id: "req-seating", kind: "seating", label: "Dining tables", quantity: 19, capacityPerUnit: 8, required: true },
  { id: "req-dance-floor", kind: "dance_floor", label: "Dance floor", quantity: 1, required: true },
  { id: "req-stage", kind: "stage", label: "Performance stage", quantity: 1, required: true },
  { id: "req-band", kind: "band", label: "Live band", quantity: 1, required: true },
  { id: "req-dj", kind: "dj", label: "DJ booth", quantity: 1, required: true },
  { id: "req-catering", kind: "catering", label: "Catering stations", quantity: 2, required: true },
  { id: "req-bar", kind: "bar", label: "Drinks bar", quantity: 1, required: false },
  { id: "req-bbq", kind: "bbq", label: "Barbecue spot", quantity: 1, required: true },
  { id: "req-registration", kind: "registration", label: "Welcome desk", quantity: 1, required: false },
];
