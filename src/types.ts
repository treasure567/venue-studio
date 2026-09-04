export type EventType = "wedding" | "concert" | "conference" | "corporate" | "birthday" | "festival" | "custom";

export type LayoutStrategy = "balanced" | "guest_flow" | "entertainment_first" | "service_first";

export type ElementKind =
  | "seating"
  | "dance_floor"
  | "stage"
  | "band"
  | "dj"
  | "catering"
  | "bar"
  | "bbq"
  | "lounge"
  | "photo_booth"
  | "registration"
  | "power"
  | "restroom"
  | "custom";

export interface VenueImage {
  name: string;
  url: string;
  width: number;
  height: number;
  isDemo: boolean;
}

export interface EventBrief {
  name: string;
  eventType: EventType;
  guestCount: number;
  tableCount: number;
  seatsPerTable: number;
  notes: string;
}

export interface LayoutRequirement {
  id: string;
  kind: ElementKind;
  label: string;
  quantity: number;
  capacityPerUnit?: number;
  required: boolean;
}

export interface LayoutElement {
  id: string;
  kind: ElementKind;
  label: string;
  quantity: number;
  capacityPerUnit?: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  rotateX: number;
  rotateY: number;
  locked: boolean;
}

export interface LayoutIssue {
  id: string;
  code: "INSUFFICIENT_SEATING" | "MISSING_REQUIREMENT" | "ELEMENT_OVERLAP" | "BBQ_PLACEMENT" | "EXIT_BLOCKED";
  severity: "error" | "warning";
  message: string;
  elementIds: string[];
}

export interface LayoutMetrics {
  overallScore: number;
  requirementCoverage: number;
  guestCapacity: number;
  flowScore: number;
  serviceScore: number;
  safetyScore: number;
}

export interface LayoutPlan {
  id: string;
  name: string;
  description: string;
  strategy: LayoutStrategy;
  revision: number;
  elements: LayoutElement[];
  issues: LayoutIssue[];
  metrics: LayoutMetrics;
  valid: boolean;
  manuallyAdjusted: boolean;
}

export interface ActivityEntry {
  id: string;
  source: "human" | "agent" | "system";
  action: string;
  summary: string;
  stateVersion: number;
  timestamp: string;
}

export interface ActionError {
  code: string;
  message: string;
}

export interface ActionResult<T = unknown> {
  ok: boolean;
  summary: string;
  stateVersion: number;
  data?: T;
  error?: ActionError;
  nextActions: string[];
}

export type SceneRenderPhase = "idle" | "analyzing" | "production" | "seating" | "polishing" | "complete" | "error";

export interface SceneRenderFrame {
  phase: Exclude<SceneRenderPhase, "idle" | "error">;
  progress: number;
  imageUrl: string;
  label: string;
}

export interface SceneRenderState {
  status: "idle" | "rendering" | "complete" | "error";
  phase: SceneRenderPhase;
  progress: number;
  message: string;
  mode: "agent" | null;
  planId: string | null;
  revision: number;
  lastInstruction: string | null;
  frames: SceneRenderFrame[];
  currentImageUrl: string | null;
  finalImageUrl: string | null;
  error: string | null;
  stale: boolean;
}
