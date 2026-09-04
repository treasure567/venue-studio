import type { EventBrief, LayoutPlan, LayoutRequirement, VenueImage } from "./types";

export interface SceneRenderRequest {
  venue: VenueImage;
  brief: EventBrief;
  requirements: LayoutRequirement[];
  plan: LayoutPlan;
  instruction?: string;
  inputImageUrl?: string;
}

export function buildScenePrompt(request: SceneRenderRequest) {
  const inventory = request.requirements.map((item) => `${item.quantity} ${item.label}${item.capacityPerUnit ? ` with ${item.capacityPerUnit} seats each` : ""}`).join(", ");
  const positions = request.plan.elements.map((element) => `${element.label} at ${Math.round(element.x)}% across and ${Math.round(element.y)}% down`).join("; ");
  const refining = Boolean(request.inputImageUrl && request.inputImageUrl !== request.venue.url);
  return [
    refining
      ? `Refine the supplied current event render of ${request.venue.name} into an even more convincing, ultra-photorealistic ${request.brief.eventType.replaceAll("_", " ")} venue for ${request.brief.guestCount} guests.`
      : `Edit the supplied empty ${request.venue.name} photograph into a finished, ultra-photorealistic ${request.brief.eventType.replaceAll("_", " ")} venue for ${request.brief.guestCount} guests.`,
    `Preserve the exact camera, architecture, ceiling beams, windows, doors, columns, floor, outdoor view, daylight direction, and room proportions.`,
    refining ? "Preserve all successful furniture, decoration, lighting, materials, and staging from the current render except where the refinement request explicitly changes them." : "",
    `Required inventory: ${inventory}.`,
    `Layout guide: ${positions}.`,
    `Planning intent: ${request.brief.notes}`,
    request.instruction ? `Refinement request: ${request.instruction}` : "",
    "Create one coherent luxury venue photograph with physically plausible perspective, contact shadows, reflections, scale, table settings, warm ivory textiles, champagne-gold chairs, restrained florals, and a clear central arrival route.",
    "No people, labels, logos, watermarks, transparent cutouts, floating furniture, fused tables, malformed chairs, or altered architecture.",
  ].filter(Boolean).join("\n");
}
