import { create } from "zustand";
import { persist } from "zustand/middleware";
import { demoBrief, demoRequirements, demoVenue, elementCatalog } from "./data";
import { createLayoutElement, generateLayoutPlans, refreshLayoutPlan, validateLayout } from "./engine";
import type {
  ActionResult,
  ActivityEntry,
  ElementKind,
  EventBrief,
  LayoutPlan,
  LayoutRequirement,
  LayoutStrategy,
  SceneRenderState,
  VenueImage,
} from "./types";

type Source = "human" | "agent" | "system";

interface RequirementInput {
  kind: ElementKind;
  label?: string;
  quantity: number;
  capacityPerUnit?: number;
  required?: boolean;
}

interface ElementInput extends RequirementInput {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  rotateX?: number;
  rotateY?: number;
}

interface ElementTransform {
  elementId: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  rotateBy?: number;
  rotateX?: number;
  rotateY?: number;
  rotateXBy?: number;
  rotateYBy?: number;
  scale?: number;
}

interface VenueStore {
  venue: VenueImage;
  brief: EventBrief;
  requirements: LayoutRequirement[];
  plans: LayoutPlan[];
  selectedPlanId: string | null;
  stagedPlanId: string | null;
  stagedReason: string;
  approvedPlanId: string | null;
  projectRevision: number;
  stateVersion: number;
  activity: ActivityEntry[];
  webmcpSupported: boolean;
  webmcpRegistered: boolean;
  render: SceneRenderState;
  setVenueImage: (venue: VenueImage, source?: Source) => ActionResult;
  applyImageRevision: (imageUrl: string, label: string, instruction: string, baseStateVersion: number, source?: Source) => ActionResult;
  setBrief: (updates: Partial<EventBrief>, source?: Source) => ActionResult;
  setRequirements: (inputs: RequirementInput[], mode: "append" | "replace", source?: Source) => ActionResult;
  adjustRequirement: (kind: ElementKind, delta: number) => ActionResult;
  generateLayouts: (strategies?: LayoutStrategy[], source?: Source) => ActionResult;
  selectPlan: (planId: string) => ActionResult;
  addElements: (inputs: ElementInput[], source?: Source) => ActionResult;
  transformElements: (transforms: ElementTransform[], source?: Source) => ActionResult;
  removeElements: (elementIds: string[], source?: Source) => ActionResult;
  validatePlan: (planId: string, source?: Source) => ActionResult;
  stagePlan: (planId: string, reason: string, source?: Source) => ActionResult;
  clearStage: () => void;
  approveStaged: () => ActionResult;
  setWebMCPStatus: (supported: boolean, registered: boolean) => void;
  resetDemo: () => void;
}

function result<T>(
  ok: boolean,
  summary: string,
  stateVersion: number,
  nextActions: string[],
  data?: T,
  error?: { code: string; message: string },
): ActionResult<T> {
  return { ok, summary, stateVersion, data, error, nextActions };
}

function activityEntry(source: Source, action: string, summary: string, stateVersion: number): ActivityEntry {
  return {
    id: `${stateVersion}-${action}`,
    source,
    action,
    summary,
    stateVersion,
    timestamp: new Date().toISOString(),
  };
}

function catalogLabel(kind: ElementKind) {
  return elementCatalog.find((item) => item.kind === kind)?.label ?? "Custom zone";
}

function normaliseRotation(rotation: number) {
  return ((((rotation + 180) % 360) + 360) % 360) - 180;
}

function normaliseRequirements(inputs: RequirementInput[]) {
  return inputs
    .filter((input) => input.quantity > 0)
    .map((input, index) => ({
      id: `req-${input.kind}-${index + 1}`,
      kind: input.kind,
      label: input.label?.trim() || catalogLabel(input.kind),
      quantity: Math.max(1, Math.round(input.quantity)),
      capacityPerUnit: input.capacityPerUnit ? Math.max(1, Math.round(input.capacityPerUnit)) : undefined,
      required: input.required ?? true,
    } satisfies LayoutRequirement));
}

function initialActivity(): ActivityEntry[] {
  return [{
    id: "0-demo-ready",
    source: "system",
    action: "demo_ready",
    summary: "Empty venue ready for a 150-person event brief.",
    stateVersion: 0,
    timestamp: new Date().toISOString(),
  }];
}

function initialRenderState(): SceneRenderState {
  return {
    status: "idle",
    phase: "idle",
    progress: 0,
    message: "Ready for an agent-created image",
    mode: null,
    planId: null,
    revision: 0,
    lastInstruction: null,
    frames: [],
    currentImageUrl: null,
    finalImageUrl: null,
    error: null,
    stale: false,
  };
}

function staleUpdate(state: VenueStore, source: Source, action: string, summary: string, updates: Partial<VenueStore>) {
  const stateVersion = state.stateVersion + 1;
  const projectRevision = state.projectRevision + 1;
  return {
    ...updates,
    projectRevision,
    stateVersion,
    stagedPlanId: null,
    stagedReason: "",
    approvedPlanId: null,
    render: { ...state.render, stale: state.render.status === "complete" },
    activity: [activityEntry(source, action, summary, stateVersion), ...state.activity].slice(0, 30),
  };
}

export const useSeatingStore = create<VenueStore>()(
  persist(
    (set, get) => ({
      venue: demoVenue,
      brief: demoBrief,
      requirements: demoRequirements,
      plans: [],
      selectedPlanId: null,
      stagedPlanId: null,
      stagedReason: "",
      approvedPlanId: null,
      projectRevision: 0,
      stateVersion: 0,
      activity: initialActivity(),
      webmcpSupported: false,
      webmcpRegistered: false,
      render: initialRenderState(),
      setVenueImage: (venue, source = "human") => {
        const state = get();
        const summary = `Loaded venue image: ${venue.name}.`;
        const stateVersion = state.stateVersion + 1;
        set({
          venue,
          plans: [],
          selectedPlanId: null,
          stagedPlanId: null,
          stagedReason: "",
          approvedPlanId: null,
          render: initialRenderState(),
          projectRevision: state.projectRevision + 1,
          stateVersion,
          activity: [activityEntry(source, "upload_venue", summary, stateVersion), ...state.activity].slice(0, 30),
        });
        return result(true, summary, stateVersion, ["configure_event", "set_requirements", "generate_layouts"]);
      },
      applyImageRevision: (imageUrl, label, instruction, baseStateVersion, source = "agent") => {
        const state = get();
        const plan = state.plans.find((candidate) => candidate.id === state.selectedPlanId);
        if (!plan) return result(false, "Generate a layout before applying an image revision.", state.stateVersion, ["generate_layouts"], undefined, { code: "NO_SELECTED_LAYOUT", message: "No layout is selected." });
        if (baseStateVersion !== state.stateVersion) return result(false, "The project changed while the image was being generated.", state.stateVersion, ["read_project", state.render.finalImageUrl ? "refine_scene" : "render_scene"], undefined, { code: "STALE_IMAGE_REVISION", message: `Expected state version ${baseStateVersion}, but the project is now at ${state.stateVersion}. Request a fresh image edit before applying a revision.` });
        const stateVersion = state.stateVersion + 1;
        const revision = state.render.revision + 1;
        const summary = `Applied agent image revision ${revision}: ${label}.`;
        const frame = { phase: "complete" as const, progress: 100, imageUrl, label };
        set({
          stateVersion,
          render: {
            status: "complete",
            phase: "complete",
            progress: 100,
            message: label,
            mode: "agent",
            planId: plan.id,
            revision,
            lastInstruction: instruction,
            frames: [frame],
            currentImageUrl: imageUrl,
            finalImageUrl: imageUrl,
            error: null,
            stale: false,
          },
          activity: [activityEntry(source, "apply_image_revision", summary, stateVersion), ...state.activity].slice(0, 30),
        });
        return result(true, summary, stateVersion, ["capture_scene", "refine_scene", "validate_layout", "stage_layout"], { planId: plan.id, revision, label });
      },
      setBrief: (updates, source = "human") => {
        const state = get();
        const brief = {
          ...state.brief,
          ...updates,
          guestCount: Math.max(1, Math.round(updates.guestCount ?? state.brief.guestCount)),
          tableCount: Math.max(1, Math.round(updates.tableCount ?? state.brief.tableCount)),
          seatsPerTable: Math.max(1, Math.round(updates.seatsPerTable ?? state.brief.seatsPerTable)),
        };
        const requirements = state.requirements.map((requirement) => requirement.kind === "seating"
          ? { ...requirement, quantity: brief.tableCount, capacityPerUnit: brief.seatsPerTable }
          : requirement);
        const summary = `Updated the event brief for ${brief.guestCount} guests.`;
        set(staleUpdate(state, source, "configure_event", summary, { brief, requirements }));
        return result(true, summary, state.stateVersion + 1, ["set_requirements", "generate_layouts"], { brief });
      },
      setRequirements: (inputs, mode, source = "agent") => {
        const state = get();
        const incoming = normaliseRequirements(inputs);
        const base = mode === "replace" ? [] : state.requirements;
        const merged = new Map(base.map((requirement) => [requirement.kind, requirement]));
        incoming.forEach((requirement) => merged.set(requirement.kind, requirement));
        const requirements = [...merged.values()];
        const seating = requirements.find((requirement) => requirement.kind === "seating");
        const brief = seating ? {
          ...state.brief,
          tableCount: seating.quantity,
          seatsPerTable: seating.capacityPerUnit ?? state.brief.seatsPerTable,
        } : state.brief;
        const summary = `Set ${incoming.length} event requirement${incoming.length === 1 ? "" : "s"}.`;
        set(staleUpdate(state, source, "set_requirements", summary, { requirements, brief }));
        return result(true, summary, state.stateVersion + 1, ["generate_layouts"], { requirements });
      },
      adjustRequirement: (kind, delta) => {
        const state = get();
        const current = state.requirements.find((requirement) => requirement.kind === kind);
        const quantity = Math.max(0, (current?.quantity ?? 0) + delta);
        const requirements = quantity === 0
          ? state.requirements.filter((requirement) => requirement.kind !== kind)
          : current
            ? state.requirements.map((requirement) => requirement.kind === kind ? { ...requirement, quantity } : requirement)
            : [...state.requirements, { id: `req-${kind}`, kind, label: catalogLabel(kind), quantity, required: false }];
        const brief = kind === "seating" ? { ...state.brief, tableCount: Math.max(1, quantity) } : state.brief;
        const summary = `${catalogLabel(kind)} set to ${quantity}.`;
        set(staleUpdate(state, "human", "adjust_requirement", summary, { requirements, brief }));
        return result(true, summary, state.stateVersion + 1, ["generate_layouts"]);
      },
      generateLayouts: (strategies, source = "human") => {
        const state = get();
        const plans = generateLayoutPlans(state.brief, state.requirements, state.projectRevision, strategies);
        const stateVersion = state.stateVersion + 1;
        const summary = `Generated ${plans.length} layout option${plans.length === 1 ? "" : "s"} for ${state.brief.guestCount} guests.`;
        set({
          plans,
          selectedPlanId: plans[0]?.id ?? null,
          stagedPlanId: null,
          stagedReason: "",
          approvedPlanId: null,
          render: initialRenderState(),
          stateVersion,
          activity: [activityEntry(source, "generate_layouts", summary, stateVersion), ...state.activity].slice(0, 30),
        });
        return result(true, summary, stateVersion, ["validate_layout", "transform_elements", "stage_layout"], {
          plans: plans.map((plan) => ({ id: plan.id, name: plan.name, valid: plan.valid, issueCount: plan.issues.length, metrics: plan.metrics })),
        });
      },
      selectPlan: (planId) => {
        const state = get();
        const plan = state.plans.find((candidate) => candidate.id === planId);
        if (!plan) return result(false, "Layout was not found.", state.stateVersion, [], undefined, { code: "UNKNOWN_LAYOUT", message: "Use a layout ID returned by read_project." });
        set({ selectedPlanId: planId, render: { ...state.render, stale: state.render.planId !== planId } });
        return result(true, `Selected ${plan.name}.`, state.stateVersion, ["validate_layout", "transform_elements", "stage_layout"]);
      },
      addElements: (inputs, source = "agent") => {
        const state = get();
        const plan = state.plans.find((candidate) => candidate.id === state.selectedPlanId);
        if (!plan) return result(false, "Generate a layout before adding elements.", state.stateVersion, ["generate_layouts"], undefined, { code: "NO_SELECTED_LAYOUT", message: "No layout is selected." });
        const additions = inputs.map((input, index) => createLayoutElement({
          ...input,
          label: input.label?.trim() || catalogLabel(input.kind),
        }, `added-${state.stateVersion + 1}-${index + 1}`, { x: 26 + index * 18, y: 52 + index * 8 }));
        const updated = refreshLayoutPlan(plan, state.brief, state.requirements, [...plan.elements, ...additions]);
        const stateVersion = state.stateVersion + 1;
        const summary = `Added ${additions.length} element${additions.length === 1 ? "" : "s"} to ${plan.name}.`;
        set({
          plans: state.plans.map((candidate) => candidate.id === plan.id ? updated : candidate),
          stagedPlanId: null,
          stagedReason: "",
          approvedPlanId: null,
          render: { ...state.render, stale: state.render.status === "complete" },
          stateVersion,
          activity: [activityEntry(source, "add_elements", summary, stateVersion), ...state.activity].slice(0, 30),
        });
        return result(true, summary, stateVersion, ["validate_layout", "transform_elements"], { elementIds: additions.map((element) => element.id), issues: updated.issues });
      },
      transformElements: (transforms, source = "agent") => {
        const state = get();
        const plan = state.plans.find((candidate) => candidate.id === state.selectedPlanId);
        if (!plan) return result(false, "Select a layout before transforming elements.", state.stateVersion, ["generate_layouts"], undefined, { code: "NO_SELECTED_LAYOUT", message: "No layout is selected." });
        const transformMap = new Map(transforms.map((transform) => [transform.elementId, transform]));
        if (transforms.some((transform) => !plan.elements.some((element) => element.id === transform.elementId))) {
          return result(false, "One or more element IDs were not found.", state.stateVersion, ["read_project"], undefined, { code: "UNKNOWN_ELEMENT", message: "Use element IDs returned by read_project." });
        }
        const elements = plan.elements.map((element) => {
          const transform = transformMap.get(element.id);
          if (!transform || element.locked) return element;
          const { scale = 1, rotateBy = 0, rotateXBy = 0, rotateYBy = 0, ...updates } = transform;
          return createLayoutElement({
            ...element,
            ...updates,
            width: updates.width ?? element.width * scale,
            height: updates.height ?? element.height * scale,
            rotation: updates.rotation ?? normaliseRotation(element.rotation + rotateBy),
            rotateX: updates.rotateX ?? (element.rotateX ?? 0) + rotateXBy,
            rotateY: updates.rotateY ?? (element.rotateY ?? 0) + rotateYBy,
          }, element.id, { x: element.x, y: element.y });
        });
        const updated = refreshLayoutPlan(plan, state.brief, state.requirements, elements);
        const stateVersion = state.stateVersion + 1;
        const summary = `Transformed ${transforms.length} layout element${transforms.length === 1 ? "" : "s"}.`;
        set({
          plans: state.plans.map((candidate) => candidate.id === plan.id ? updated : candidate),
          stagedPlanId: null,
          stagedReason: "",
          approvedPlanId: null,
          render: { ...state.render, stale: state.render.status === "complete" },
          stateVersion,
          activity: [activityEntry(source, "transform_elements", summary, stateVersion), ...state.activity].slice(0, 30),
        });
        return result(true, summary, stateVersion, ["validate_layout", "stage_layout"], { issues: updated.issues, metrics: updated.metrics });
      },
      removeElements: (elementIds, source = "agent") => {
        const state = get();
        const plan = state.plans.find((candidate) => candidate.id === state.selectedPlanId);
        if (!plan) return result(false, "Select a layout before removing elements.", state.stateVersion, ["generate_layouts"], undefined, { code: "NO_SELECTED_LAYOUT", message: "No layout is selected." });
        const elements = plan.elements.filter((element) => !elementIds.includes(element.id));
        const updated = refreshLayoutPlan(plan, state.brief, state.requirements, elements);
        const stateVersion = state.stateVersion + 1;
        const summary = `Removed ${plan.elements.length - elements.length} layout element${plan.elements.length - elements.length === 1 ? "" : "s"}.`;
        set({
          plans: state.plans.map((candidate) => candidate.id === plan.id ? updated : candidate),
          stagedPlanId: null,
          stagedReason: "",
          approvedPlanId: null,
          render: { ...state.render, stale: state.render.status === "complete" },
          stateVersion,
          activity: [activityEntry(source, "remove_elements", summary, stateVersion), ...state.activity].slice(0, 30),
        });
        return result(true, summary, stateVersion, ["validate_layout"], { issues: updated.issues });
      },
      validatePlan: (planId) => {
        const state = get();
        const plan = state.plans.find((candidate) => candidate.id === planId);
        if (!plan) return result(false, "Layout was not found.", state.stateVersion, ["read_project"], undefined, { code: "UNKNOWN_LAYOUT", message: "Use a layout ID returned by read_project." });
        if (plan.revision !== state.projectRevision) return result(false, "This layout is stale because the brief changed.", state.stateVersion, ["generate_layouts"], undefined, { code: "STALE_LAYOUT", message: "Regenerate the layout." });
        const validation = validateLayout(state.brief, state.requirements, plan.elements);
        return result(true, validation.valid ? "Layout passes all required checks." : "Layout has blocking issues.", state.stateVersion, validation.valid ? ["stage_layout"] : ["transform_elements", "add_elements"], validation);
      },
      stagePlan: (planId, reason, source = "agent") => {
        const state = get();
        const plan = state.plans.find((candidate) => candidate.id === planId);
        if (!plan) return result(false, "Layout was not found.", state.stateVersion, ["read_project"], undefined, { code: "UNKNOWN_LAYOUT", message: "Use a layout ID returned by read_project." });
        if (plan.revision !== state.projectRevision || !plan.valid) return result(false, "Only a current layout without blocking issues can be staged.", state.stateVersion, ["generate_layouts", "validate_layout"], undefined, { code: "LAYOUT_NOT_READY", message: "Regenerate or fix blocking issues first." });
        const stateVersion = state.stateVersion + 1;
        const summary = `Staged ${plan.name} for human review.`;
        set({
          stagedPlanId: plan.id,
          stagedReason: reason,
          approvedPlanId: null,
          stateVersion,
          activity: [activityEntry(source, "stage_layout", summary, stateVersion), ...state.activity].slice(0, 30),
        });
        return result(true, summary, stateVersion, ["wait_for_human_review"], { planId: plan.id, humanApprovalRequired: true });
      },
      clearStage: () => set({ stagedPlanId: null, stagedReason: "", approvedPlanId: null }),
      approveStaged: () => {
        const state = get();
        if (!state.stagedPlanId) return result(false, "No layout is staged.", state.stateVersion, [], undefined, { code: "NO_STAGED_LAYOUT", message: "Stage a layout first." });
        const stateVersion = state.stateVersion + 1;
        const summary = "Layout approved by the human planner.";
        set({
          approvedPlanId: state.stagedPlanId,
          stateVersion,
          activity: [activityEntry("human", "approve_layout", summary, stateVersion), ...state.activity].slice(0, 30),
        });
        return result(true, summary, stateVersion, ["export_layout"]);
      },
      setWebMCPStatus: (supported, registered) => set({ webmcpSupported: supported, webmcpRegistered: registered }),
      resetDemo: () => set({
        venue: demoVenue,
        brief: demoBrief,
        requirements: demoRequirements,
        plans: [],
        selectedPlanId: null,
        stagedPlanId: null,
        stagedReason: "",
        approvedPlanId: null,
        render: initialRenderState(),
        projectRevision: 0,
        stateVersion: 0,
        activity: initialActivity(),
      }),
    }),
    {
      name: "venue-studio-state-v3",
      partialize: (state) => {
        const { render, ...persisted } = state;
        void render;
        return persisted;
      },
    },
  ),
);
