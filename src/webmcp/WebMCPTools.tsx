import { useEffect } from "react";
import { toPng } from "html-to-image";
import { useWebMCP } from "use-webmcp-tool";
import { z } from "zod";
import { buildScenePrompt } from "../rendering";
import { useSeatingStore } from "../store";
import type { ActionResult, VenueImage } from "../types";

const elementKinds = ["seating", "dance_floor", "stage", "band", "dj", "catering", "bar", "bbq", "lounge", "photo_booth", "registration", "power", "restroom", "custom"] as const;
const strategies = ["balanced", "guest_flow", "entertainment_first", "service_first"] as const;
const eventTypes = ["wedding", "concert", "conference", "corporate", "birthday", "festival", "custom"] as const;
const emptySchema = z.strictObject({});
const configureSchema = z.strictObject({
  name: z.string().trim().min(1).max(100).optional(),
  eventType: z.enum(eventTypes).optional(),
  guestCount: z.number().int().min(1).max(5000).optional(),
  tableCount: z.number().int().min(1).max(500).optional(),
  seatsPerTable: z.number().int().min(1).max(30).optional(),
  notes: z.string().trim().max(1000).optional(),
}).refine((value) => Object.values(value).some((item) => item !== undefined));
const requirementSchema = z.strictObject({
  kind: z.enum(elementKinds),
  label: z.string().trim().min(1).max(80).optional(),
  quantity: z.number().int().min(1).max(500),
  capacityPerUnit: z.number().int().min(1).max(1000).optional(),
  required: z.boolean().optional(),
});
const requirementsSchema = z.strictObject({
  mode: z.enum(["append", "replace"]).optional(),
  requirements: z.array(requirementSchema).min(1).max(30),
});
const generateSchema = z.strictObject({ strategies: z.array(z.enum(strategies)).min(1).max(3).optional() });
const elementSchema = requirementSchema.extend({
  x: z.number().min(0).max(100).optional(),
  y: z.number().min(0).max(100).optional(),
  width: z.number().min(6).max(65).optional(),
  height: z.number().min(6).max(50).optional(),
  rotation: z.number().min(-180).max(180).optional(),
  rotateX: z.number().min(-65).max(65).optional(),
  rotateY: z.number().min(-65).max(65).optional(),
}).omit({ required: true });
const addSchema = z.strictObject({ elements: z.array(elementSchema).min(1).max(12) });
const transformItemSchema = z.strictObject({
  elementId: z.string().min(1).max(120),
  x: z.number().min(0).max(100).optional(),
  y: z.number().min(0).max(100).optional(),
  width: z.number().min(6).max(65).optional(),
  height: z.number().min(6).max(50).optional(),
  rotation: z.number().min(-180).max(180).optional(),
  rotateBy: z.number().min(-360).max(360).optional(),
  rotateX: z.number().min(-65).max(65).optional(),
  rotateY: z.number().min(-65).max(65).optional(),
  rotateXBy: z.number().min(-130).max(130).optional(),
  rotateYBy: z.number().min(-130).max(130).optional(),
  scale: z.number().min(0.5).max(2).optional(),
}).refine((value) => value.x !== undefined || value.y !== undefined || value.width !== undefined || value.height !== undefined || value.rotation !== undefined || value.rotateBy !== undefined || value.rotateX !== undefined || value.rotateY !== undefined || value.rotateXBy !== undefined || value.rotateYBy !== undefined || value.scale !== undefined);
const transformSchema = z.strictObject({
  transforms: z.array(transformItemSchema).min(1).max(20),
});
const removeSchema = z.strictObject({ elementIds: z.array(z.string().min(1).max(120)).min(1).max(20) });
const planSchema = z.strictObject({ planId: z.string().min(1).max(120) });
const stageSchema = z.strictObject({ planId: z.string().min(1).max(120), reason: z.string().trim().min(1).max(300) });
const renderSchema = z.strictObject({ instruction: z.string().trim().min(1).max(2400).optional() });
const refineSchema = z.strictObject({ instruction: z.string().trim().min(1).max(2400) });
const imageFields = {
  imageUrl: z.string().trim().min(1).max(20_000_000).optional(),
  imageBase64: z.string().trim().min(1).max(20_000_000).optional(),
  mimeType: z.enum(["image/png", "image/jpeg", "image/webp"]).optional(),
};
const loadImageSchema = z.strictObject({
  ...imageFields,
  name: z.string().trim().min(1).max(140).optional(),
  width: z.number().int().min(1).max(12000).optional(),
  height: z.number().int().min(1).max(12000).optional(),
}).refine((value) => Boolean(value.imageUrl) !== Boolean(value.imageBase64), { message: "Provide exactly one of imageUrl or imageBase64." });
const editRequestSchema = z.strictObject({ instruction: z.string().trim().min(1).max(2400) });
const applyRevisionSchema = z.strictObject({
  ...imageFields,
  baseStateVersion: z.number().int().min(0),
  instruction: z.string().trim().min(1).max(2400),
  label: z.string().trim().min(1).max(160).optional(),
}).refine((value) => Boolean(value.imageUrl) !== Boolean(value.imageBase64), { message: "Provide exactly one of imageUrl or imageBase64." });

const kindProperty = { type: "string", enum: [...elementKinds] } as const;
const emptyInputSchema = { type: "object", properties: {}, additionalProperties: false } as const;

async function imageData(imageUrl: string) {
  if (imageUrl.startsWith("data:")) {
    const comma = imageUrl.indexOf(",");
    const mimeType = imageUrl.slice(5, imageUrl.indexOf(";")) || "image/png";
    return { data: imageUrl.slice(comma + 1), mimeType };
  }
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error("The rendered venue image could not be loaded.");
  const blob = await response.blob();
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("The rendered venue image could not be read."));
    reader.readAsDataURL(blob);
  });
  return { data: dataUrl.slice(dataUrl.indexOf(",") + 1), mimeType: blob.type || "image/png" };
}

function resolvedImageUrl(input: { imageUrl?: string; imageBase64?: string; mimeType?: "image/png" | "image/jpeg" | "image/webp" }) {
  const url = input.imageBase64 ? `data:${input.mimeType ?? "image/png"};base64,${input.imageBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "")}` : input.imageUrl ?? "";
  if (!url.startsWith("data:image/") && !url.startsWith("/") && !/^https?:\/\//i.test(url)) throw new Error("Use an HTTPS image URL, a same-site path, or base64 image data.");
  return url;
}

async function dimensions(url: string) {
  const image = new Image();
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error("The supplied image did not load in time.")), 8000);
    image.onload = () => {
      window.clearTimeout(timeout);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      window.clearTimeout(timeout);
      reject(new Error("The supplied image could not be opened."));
    };
    image.src = url;
  });
}

async function venueFromInput(input: z.infer<typeof loadImageSchema>): Promise<VenueImage> {
  const url = resolvedImageUrl(input);
  const size = input.width && input.height ? { width: input.width, height: input.height } : await dimensions(url);
  return { name: input.name ?? "Agent-provided venue", url, width: size.width, height: size.height, isDemo: false };
}

async function imageResult(result: ActionResult) {
  if (!result.ok) throw new Error(JSON.stringify(result));
  const state = useSeatingStore.getState();
  if (!state.render.finalImageUrl) return result;
  const image = await imageData(state.render.finalImageUrl);
  return {
    content: [
      { type: "image", data: image.data, mimeType: image.mimeType },
      { type: "text", text: JSON.stringify({ ...result, render: { revision: state.render.revision, mode: state.render.mode, instruction: state.render.lastInstruction, stale: state.render.stale } }) },
    ],
  };
}

async function editRequestContent(instruction: string, requireRevision = false) {
  const state = useSeatingStore.getState();
  const plan = state.plans.find((candidate) => candidate.id === state.selectedPlanId);
  if (!plan) throw new Error("Generate a layout before requesting an image edit.");
  if (plan.revision !== state.projectRevision) throw new Error("Regenerate the stale layout before requesting an image edit.");
  if (requireRevision && !state.render.finalImageUrl) throw new Error("Create and apply the first image revision before refining it.");
  const inputImageUrl = state.render.finalImageUrl ?? state.venue.url;
  const image = await imageData(inputImageUrl);
  const prompt = buildScenePrompt({ venue: state.venue, brief: state.brief, requirements: state.requirements, plan, instruction, inputImageUrl });
  return {
    content: [
      { type: "image", data: image.data, mimeType: image.mimeType },
      { type: "text", text: JSON.stringify({ baseStateVersion: state.stateVersion, currentRevision: state.render.revision, instruction, prompt, agentAction: { useOwnImageTool: true, editReturnedImage: true, thenCall: "venue.apply_image_revision" }, outputRequirements: { format: "png", aspectRatio: `${state.venue.width}:${state.venue.height}`, preserveCameraAndArchitecture: true } }) },
    ],
  };
}

export function WebMCPTools() {
  const readProject = useWebMCP({
    name: "venue.read_project",
    description: "Read the current venue image status, event brief, requested inventory, generated layouts, selected element IDs, validation state, and safe next actions.",
    inputSchema: emptyInputSchema,
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    execute: async (input) => {
      emptySchema.parse(input);
      const state = useSeatingStore.getState();
      const selected = state.plans.find((plan) => plan.id === state.selectedPlanId);
      return {
        venue: { name: state.venue.name, width: state.venue.width, height: state.venue.height, isDemoImage: state.venue.isDemo, imageLoaded: Boolean(state.venue.url) },
        brief: state.brief,
        requirements: state.requirements,
        layouts: state.plans.map((plan) => ({ id: plan.id, name: plan.name, strategy: plan.strategy, valid: plan.valid, stale: plan.revision !== state.projectRevision, issueCount: plan.issues.length, metrics: plan.metrics })),
        selectedLayout: selected ? { id: selected.id, elements: selected.elements, issues: selected.issues } : null,
        render: { status: state.render.status, phase: state.render.phase, progress: state.render.progress, mode: state.render.mode, revision: state.render.revision, lastInstruction: state.render.lastInstruction, frameCount: state.render.frames.length, stale: state.render.stale, error: state.render.error },
        stagedPlanId: state.stagedPlanId,
        stateVersion: state.stateVersion,
        nextActions: state.plans.length ? state.render.status === "complete" ? ["capture_scene", "refine_scene", "validate_layout", "stage_layout"] : ["render_scene", "transform_elements", "validate_layout"] : ["load_image", "configure_event", "set_requirements", "generate_layouts"],
      };
    },
  });

  const captureScene = useWebMCP({
    name: "venue.capture_scene",
    description: "Capture the currently rendered venue as a PNG image for visual inspection. Use this after generation or transformation, inspect the image, then refine elements with transform_elements and capture again until the composition is ready.",
    inputSchema: emptyInputSchema,
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    execute: async (input) => {
      emptySchema.parse(input);
      const board = document.querySelector<HTMLElement>("#venue-scene-capture");
      if (!board) throw new Error("The venue scene is not available yet.");
      const state = useSeatingStore.getState();
      const selected = state.plans.find((plan) => plan.id === state.selectedPlanId);
      const image = state.render.finalImageUrl && !state.render.stale
        ? await imageData(state.render.finalImageUrl)
        : await toPng(board, {
          cacheBust: true,
          pixelRatio: 1,
          backgroundColor: "#ddd8cc",
          filter: (node) => !(node instanceof HTMLElement) || (!node.classList.contains("object-transform-gizmo") && !node.classList.contains("scene-element-label") && !node.classList.contains("scene-drag-handle") && !node.classList.contains("render-progress-hud") && !node.classList.contains("render-timeline")),
        }).then((dataUrl) => ({ data: dataUrl.slice(dataUrl.indexOf(",") + 1), mimeType: "image/png" }));
      return {
        content: [
          { type: "image", data: image.data, mimeType: image.mimeType },
          { type: "text", text: JSON.stringify({ stateVersion: state.stateVersion, planId: selected?.id ?? null, renderStatus: state.render.status, renderMode: state.render.mode, renderRevision: state.render.revision, renderStale: state.render.stale, tables: state.brief.tableCount, chairsPerTable: state.brief.seatsPerTable, totalChairs: state.brief.tableCount * state.brief.seatsPerTable, elementCount: selected?.elements.length ?? 0, nextActions: selected ? state.render.finalImageUrl ? ["refine_scene", "capture_scene", "validate_layout"] : ["render_scene", "validate_layout"] : ["generate_layouts"] }) },
        ],
      };
    },
  });

  const loadImage = useWebMCP({
    name: "venue.load_image",
    description: "Load an empty venue image supplied by an agent or another tool. Pass exactly one imageUrl or raw imageBase64 plus its mimeType. This resets old layouts so the new photograph becomes the shared canvas.",
    inputSchema: {
      type: "object",
      properties: {
        imageUrl: { type: "string", minLength: 1, maxLength: 20_000_000 },
        imageBase64: { type: "string", minLength: 1, maxLength: 20_000_000 },
        mimeType: { type: "string", enum: ["image/png", "image/jpeg", "image/webp"] },
        name: { type: "string", minLength: 1, maxLength: 140 },
        width: { type: "number", minimum: 1, maximum: 12000 },
        height: { type: "number", minimum: 1, maximum: 12000 },
      },
      oneOf: [{ required: ["imageUrl"] }, { required: ["imageBase64"] }],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute: async (input) => {
      const parsed = loadImageSchema.parse(input);
      const venue = await venueFromInput(parsed);
      const result = useSeatingStore.getState().setVenueImage(venue, "agent");
      const image = await imageData(venue.url);
      return { content: [{ type: "image", data: image.data, mimeType: image.mimeType }, { type: "text", text: JSON.stringify(result) }] };
    },
  });

  const getEditRequest = useWebMCP({
    name: "venue.get_edit_request",
    description: "Return the current venue image, exact edit brief, and state version to the calling agent. The agent must use its own image-generation capability and return the output with apply_image_revision. The site never calls an image API.",
    inputSchema: {
      type: "object",
      properties: { instruction: { type: "string", minLength: 1, maxLength: 2400 } },
      required: ["instruction"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    execute: async (input) => {
      const parsed = editRequestSchema.parse(input);
      return editRequestContent(parsed.instruction);
    },
  });

  const applyImageRevision = useWebMCP({
    name: "venue.apply_image_revision",
    description: "Apply an image produced by the calling agent's own image tool. Pass the baseStateVersion from render_scene, refine_scene, or get_edit_request to prevent overwriting newer user changes. The tool displays the revision and returns the exact image back for inspection.",
    inputSchema: {
      type: "object",
      properties: {
        imageUrl: { type: "string", minLength: 1, maxLength: 20_000_000 },
        imageBase64: { type: "string", minLength: 1, maxLength: 20_000_000 },
        mimeType: { type: "string", enum: ["image/png", "image/jpeg", "image/webp"] },
        baseStateVersion: { type: "number", minimum: 0 },
        instruction: { type: "string", minLength: 1, maxLength: 2400 },
        label: { type: "string", minLength: 1, maxLength: 160 },
      },
      required: ["baseStateVersion", "instruction"],
      oneOf: [{ required: ["imageUrl"] }, { required: ["imageBase64"] }],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute: async (input) => {
      const parsed = applyRevisionSchema.parse(input);
      const label = parsed.label ?? `Agent refinement: ${parsed.instruction.slice(0, 90)}`;
      const result = useSeatingStore.getState().applyImageRevision(resolvedImageUrl(parsed), label, parsed.instruction, parsed.baseStateVersion, "agent");
      return imageResult(result);
    },
  });

  const configureEvent = useWebMCP({
    name: "venue.configure_event",
    description: "Set the event name, type, guest count, table count, seats per table, or planning notes. This visibly updates the brief and makes previous layouts stale.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", minLength: 1, maxLength: 100 },
        eventType: { type: "string", enum: [...eventTypes] },
        guestCount: { type: "number", minimum: 1, maximum: 5000 },
        tableCount: { type: "number", minimum: 1, maximum: 500 },
        seatsPerTable: { type: "number", minimum: 1, maximum: 30 },
        notes: { type: "string", maxLength: 1000 },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute: async (input) => useSeatingStore.getState().setBrief(configureSchema.parse(input), "agent"),
  });

  const setRequirements = useWebMCP({
    name: "venue.set_requirements",
    description: "Add or replace count-based event inventory such as tables, stage, band, DJ, catering, bar, barbecue, lounge, power, registration, or a custom labelled zone.",
    inputSchema: {
      type: "object",
      properties: {
        mode: { type: "string", enum: ["append", "replace"], default: "append" },
        requirements: {
          type: "array",
          minItems: 1,
          maxItems: 30,
          items: {
            type: "object",
            properties: {
              kind: kindProperty,
              label: { type: "string", minLength: 1, maxLength: 80 },
              quantity: { type: "number", minimum: 1, maximum: 500 },
              capacityPerUnit: { type: "number", minimum: 1, maximum: 1000 },
              required: { type: "boolean", default: true },
            },
            required: ["kind", "quantity"],
            additionalProperties: false,
          },
        },
      },
      required: ["requirements"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute: async (input) => {
      const parsed = requirementsSchema.parse(input);
      return useSeatingStore.getState().setRequirements(parsed.requirements, parsed.mode ?? "append", "agent");
    },
  });

  const generateLayouts = useWebMCP({
    name: "venue.generate_layouts",
    description: "Generate up to three structured layout options from the current guest count and inventory. Call render_scene next to receive the source image and exact edit brief for the calling agent's own image tool.",
    inputSchema: {
      type: "object",
      properties: { strategies: { type: "array", minItems: 1, maxItems: 3, uniqueItems: true, items: { type: "string", enum: [...strategies] } } },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute: async (input) => {
      const parsed = generateSchema.parse(input);
      return useSeatingStore.getState().generateLayouts(parsed.strategies, "agent");
    },
  });

  const addElements = useWebMCP({
    name: "venue.add_elements",
    description: "Add supported or custom labelled elements to the selected layout. Optional x and y are percentages of the visible venue image.",
    inputSchema: {
      type: "object",
      properties: {
        elements: {
          type: "array",
          minItems: 1,
          maxItems: 12,
          items: {
            type: "object",
            properties: {
              kind: kindProperty,
              label: { type: "string", minLength: 1, maxLength: 80 },
              quantity: { type: "number", minimum: 1, maximum: 500 },
              capacityPerUnit: { type: "number", minimum: 1, maximum: 1000 },
              x: { type: "number", minimum: 0, maximum: 100 },
              y: { type: "number", minimum: 0, maximum: 100 },
              width: { type: "number", minimum: 6, maximum: 65 },
              height: { type: "number", minimum: 6, maximum: 50 },
              rotation: { type: "number", minimum: -180, maximum: 180 },
              rotateX: { type: "number", minimum: -65, maximum: 65 },
              rotateY: { type: "number", minimum: -65, maximum: 65 },
            },
            required: ["kind", "quantity"],
            additionalProperties: false,
          },
        },
      },
      required: ["elements"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute: async (input) => useSeatingStore.getState().addElements(addSchema.parse(input).elements, "agent"),
  });

  const transformElements = useWebMCP({
    name: "venue.transform_elements",
    description: "Move, resize, scale, or rotate existing layout elements in two or three dimensions. Use x and y for venue-relative placement, rotation or rotateBy for a flat turn, rotateX and rotateY for 3D orientation, rotateXBy and rotateYBy for relative 3D turns, and scale for a relative size multiplier. Capture the scene afterward to visually inspect the result.",
    inputSchema: {
      type: "object",
      properties: {
        transforms: {
          type: "array",
          minItems: 1,
          maxItems: 20,
          items: {
            type: "object",
            properties: {
              elementId: { type: "string" },
              x: { type: "number", minimum: 0, maximum: 100 },
              y: { type: "number", minimum: 0, maximum: 100 },
              width: { type: "number", minimum: 6, maximum: 65 },
              height: { type: "number", minimum: 6, maximum: 50 },
              rotation: { type: "number", minimum: -180, maximum: 180 },
              rotateBy: { type: "number", minimum: -360, maximum: 360 },
              rotateX: { type: "number", minimum: -65, maximum: 65 },
              rotateY: { type: "number", minimum: -65, maximum: 65 },
              rotateXBy: { type: "number", minimum: -130, maximum: 130 },
              rotateYBy: { type: "number", minimum: -130, maximum: 130 },
              scale: { type: "number", minimum: 0.5, maximum: 2 },
            },
            required: ["elementId"],
            additionalProperties: false,
          },
        },
      },
      required: ["transforms"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute: async (input) => useSeatingStore.getState().transformElements(transformSchema.parse(input).transforms, "agent"),
  });

  const removeElements = useWebMCP({
    name: "venue.remove_elements",
    description: "Remove one or more elements from the selected layout by IDs returned by read_project. Validation updates immediately.",
    inputSchema: {
      type: "object",
      properties: { elementIds: { type: "array", minItems: 1, maxItems: 20, items: { type: "string" } } },
      required: ["elementIds"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute: async (input) => useSeatingStore.getState().removeElements(removeSchema.parse(input).elementIds, "agent"),
  });

  const renderScene = useWebMCP({
    name: "venue.render_scene",
    description: "Return the source venue image and a complete photoreal edit brief to the calling agent. The agent must edit the returned image with its own image-generation tool, then call apply_image_revision with the result. This website never uses an API key.",
    inputSchema: {
      type: "object",
      properties: { instruction: { type: "string", minLength: 1, maxLength: 1200 } },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    execute: async (input) => {
      const instruction = renderSchema.parse(input).instruction ?? "Create the first complete photoreal event-venue image from the selected plan.";
      return editRequestContent(instruction);
    },
  });

  const refineScene = useWebMCP({
    name: "venue.refine_scene",
    description: "Return the latest applied venue image and a targeted refinement brief to the calling agent. The agent must edit that returned image with its own image-generation tool, then call apply_image_revision and inspect the returned revision.",
    inputSchema: {
      type: "object",
      properties: { instruction: { type: "string", minLength: 1, maxLength: 1200 } },
      required: ["instruction"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    execute: async (input) => editRequestContent(refineSchema.parse(input).instruction, true),
  });

  const validateLayout = useWebMCP({
    name: "venue.validate_layout",
    description: "Validate one current layout for guest capacity, requested inventory, overlaps, arrival flow, barbecue placement, and blocking issues.",
    inputSchema: { type: "object", properties: { planId: { type: "string" } }, required: ["planId"], additionalProperties: false },
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    execute: async (input) => useSeatingStore.getState().validatePlan(planSchema.parse(input).planId, "agent"),
  });

  const stageLayout = useWebMCP({
    name: "venue.stage_layout",
    description: "Stage one current layout without blocking issues for visible human review. This never approves or exports the layout.",
    inputSchema: {
      type: "object",
      properties: { planId: { type: "string" }, reason: { type: "string", minLength: 1, maxLength: 300 } },
      required: ["planId", "reason"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute: async (input) => {
      const parsed = stageSchema.parse(input);
      return useSeatingStore.getState().stagePlan(parsed.planId, parsed.reason, "agent");
    },
  });

  const statuses = [readProject, captureScene, loadImage, getEditRequest, applyImageRevision, configureEvent, setRequirements, generateLayouts, addElements, transformElements, removeElements, renderScene, refineScene, validateLayout, stageLayout];
  const supported = statuses.some((status) => status.supported);
  const registered = supported && statuses.every((status) => status.registered);

  useEffect(() => useSeatingStore.getState().setWebMCPStatus(supported, registered), [supported, registered]);

  return null;
}
