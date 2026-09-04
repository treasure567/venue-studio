import {
  Armchair,
  Beef,
  Camera,
  Check,
  ChefHat,
  Disc3,
  DoorOpen,
  GlassWater,
  Grid3X3,
  ImageIcon,
  Lamp,
  Minus,
  Move,
  Music2,
  Plus,
  Power,
  RotateCcw,
  RotateCw,
  Sparkles,
  Trash2,
  Utensils,
  Users,
  WandSparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { useRef, useState } from "react";
import { elementCatalog } from "../data";
import type { ElementKind, EventBrief, LayoutElement, LayoutPlan, SceneRenderState, VenueImage } from "../types";

interface ElementTransformInput {
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
  rotateX?: number;
  rotateY?: number;
}

interface VenueBoardProps {
  venue: VenueImage;
  brief: EventBrief;
  plan?: LayoutPlan;
  render: SceneRenderState;
  stale: boolean;
  staged: boolean;
  onRequestAgent: () => void;
  onTransformElement: (elementId: string, transform: ElementTransformInput) => void;
  onRemoveElement: (elementId: string) => void;
}

interface PositionGesture {
  id: string;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  moved: boolean;
}

const iconByKind: Record<ElementKind, typeof Armchair> = {
  seating: Armchair,
  dance_floor: Grid3X3,
  stage: Music2,
  band: Users,
  dj: Disc3,
  catering: ChefHat,
  bar: GlassWater,
  bbq: Beef,
  lounge: Lamp,
  photo_booth: Camera,
  registration: DoorOpen,
  power: Power,
  restroom: Users,
  custom: Sparkles,
};

const agentWorkflow = ["Receive image", "Use image tool", "Return revision", "Inspect & refine"];

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

function normaliseRotation(rotation: number) {
  return ((((rotation + 180) % 360) + 360) % 360) - 180;
}

function markerStyle(element: LayoutElement, preview?: { id: string; x: number; y: number }) {
  const catalog = elementCatalog.find((item) => item.kind === element.kind);
  return {
    "--element-x": `${preview?.id === element.id ? preview.x : element.x}%`,
    "--element-y": `${preview?.id === element.id ? preview.y : element.y}%`,
    "--element-width": `${element.kind === "seating" ? clamp(element.width * 0.44, 3.4, 6.2) : clamp(element.width * 0.62, 5, 30)}%`,
    "--element-rotation": `${element.rotation}deg`,
    "--element-color": catalog?.color ?? "#68736b",
    zIndex: Math.round(element.y / 5) + 4,
  } as CSSProperties;
}

function elementDetail(element: LayoutElement) {
  if (element.kind === "seating") return `${element.capacityPerUnit ?? 0} chairs`;
  return element.quantity > 1 ? `${element.quantity} units` : "1 zone";
}

export function VenueBoard({ venue, brief, plan, render, stale, staged, onRequestAgent, onTransformElement, onRemoveElement }: VenueBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<PositionGesture | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ id: string; x: number; y: number } | null>(null);
  const [viewMode, setViewMode] = useState<"render" | "plan">("render");
  const [showGrid, setShowGrid] = useState(false);
  const selectedElement = plan?.elements.find((element) => element.id === selectedElementId);
  const productionZones = plan?.elements.filter((element) => element.kind !== "seating").length ?? 0;
  const renderImage = render.currentImageUrl ?? venue.url;
  const hasRender = render.status === "complete";

  function beginPosition(event: ReactPointerEvent<HTMLButtonElement>, element: LayoutElement) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    gestureRef.current = { id: element.id, startX: event.clientX, startY: event.clientY, originX: element.x, originY: element.y, moved: false };
    setSelectedElementId(element.id);
  }

  function continuePosition(event: ReactPointerEvent<HTMLButtonElement>) {
    const gesture = gestureRef.current;
    const board = boardRef.current;
    if (!gesture || !board) return;
    const bounds = board.getBoundingClientRect();
    const x = clamp(gesture.originX + ((event.clientX - gesture.startX) / bounds.width) * 100, 4, 96);
    const y = clamp(gesture.originY + ((event.clientY - gesture.startY) / bounds.height) * 100, 6, 94);
    gesture.moved = gesture.moved || Math.abs(event.clientX - gesture.startX) + Math.abs(event.clientY - gesture.startY) > 3;
    setPreview({ id: gesture.id, x, y });
  }

  function finishPosition(event: ReactPointerEvent<HTMLButtonElement>) {
    const gesture = gestureRef.current;
    if (!gesture) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    if (gesture.moved && preview?.id === gesture.id) onTransformElement(gesture.id, { x: preview.x, y: preview.y });
    gestureRef.current = null;
    setPreview(null);
  }

  function handleElementKey(event: ReactKeyboardEvent<HTMLButtonElement>, element: LayoutElement) {
    const distance = event.shiftKey ? 3 : 1;
    const actions: Record<string, () => void> = {
      ArrowLeft: () => onTransformElement(element.id, { x: clamp(element.x - distance, 4, 96) }),
      ArrowRight: () => onTransformElement(element.id, { x: clamp(element.x + distance, 4, 96) }),
      ArrowUp: () => onTransformElement(element.id, { y: clamp(element.y - distance, 6, 94) }),
      ArrowDown: () => onTransformElement(element.id, { y: clamp(element.y + distance, 6, 94) }),
      "[": () => onTransformElement(element.id, { rotation: normaliseRotation(element.rotation - 15) }),
      "]": () => onTransformElement(element.id, { rotation: normaliseRotation(element.rotation + 15) }),
      Delete: () => onRemoveElement(element.id),
      Backspace: () => onRemoveElement(element.id),
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    event.stopPropagation();
    action();
  }

  return (
    <main className="board-workspace">
      <section className="board-shell" aria-label="Progressive photoreal event studio">
        <div className="board-topbar">
          <div>
            <p className="eyebrow">Live venue render</p>
            <h2>{plan?.name ?? "Empty hall"}</h2>
            <span>{plan ? `${brief.tableCount} tables · ${brief.tableCount * brief.seatsPerTable} chairs · ${productionZones} production zones` : `${brief.guestCount} guests · ready to arrange`}</span>
          </div>
          <div className="board-topbar-actions">
            <div className="board-view-controls" aria-label="Studio view">
              <button className={viewMode === "render" ? "is-active" : ""} type="button" onClick={() => setViewMode("render")}><ImageIcon size={14} />AI render</button>
              <button className={viewMode === "plan" ? "is-active" : ""} type="button" onClick={() => setViewMode("plan")}><Grid3X3 size={14} />Plan map</button>
              {viewMode === "plan" && <button className={showGrid ? "is-active" : ""} type="button" onClick={() => setShowGrid((value) => !value)}>Grid</button>}
            </div>
            <button className="render-scene-button" type="button" disabled={!plan || stale} onClick={onRequestAgent}>
              <WandSparkles size={14} />
              {hasRender ? "Refine with agent" : "Create with agent"}
            </button>
          </div>
        </div>

        <div id="venue-scene-capture" ref={boardRef} className={`venue-board render-studio ${viewMode === "plan" ? "is-plan-view" : "is-render-view"} ${showGrid ? "show-grid" : ""}`} onPointerDown={() => setSelectedElementId(null)}>
          <img className="venue-photo" src={venue.url} alt={`Empty venue: ${venue.name}`} />

          {viewMode === "render" && renderImage !== venue.url && (
            <AnimatePresence mode="popLayout">
              <motion.img
                key={renderImage}
                className="rendered-venue-photo"
                src={renderImage}
                alt={`Photoreal event render of ${venue.name}`}
                initial={{ opacity: 0, filter: "blur(16px)", clipPath: "inset(0 100% 0 0)" }}
                animate={{ opacity: 1, filter: "blur(0px)", clipPath: "inset(0 0% 0 0)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              />
            </AnimatePresence>
          )}

          {viewMode === "plan" && <div className="venue-photo-shade" />}
          {viewMode === "plan" && <div className="entrance-marker"><DoorOpen size={14} /><span>Main entrance</span></div>}

          {viewMode === "plan" && plan?.elements.map((element, index) => {
            const Icon = iconByKind[element.kind];
            const issue = plan.issues.some((item) => item.elementIds.includes(element.id));
            const selected = selectedElementId === element.id;
            return (
              <div className={`layout-element plan-element kind-${element.kind} ${selected ? "is-selected" : ""} ${issue ? "has-issue" : ""}`} key={element.id} style={markerStyle(element, preview ?? undefined)}>
                <button className="plan-marker" type="button" aria-label={`${element.label}, ${elementDetail(element)}. Drag to move on the plan map.`} onPointerDown={(event) => beginPosition(event, element)} onPointerMove={continuePosition} onPointerUp={finishPosition} onPointerCancel={() => { gestureRef.current = null; setPreview(null); }} onKeyDown={(event) => handleElementKey(event, element)}>
                  <span className="plan-marker-icon"><Icon size={element.kind === "seating" ? 10 : 13} /></span>
                  {element.kind === "seating" && <b>{index + 1}</b>}
                  {element.kind !== "seating" && <span>{element.label}</span>}
                  <Move className="plan-move-icon" size={10} />
                </button>
              </div>
            );
          })}

          {viewMode === "render" && render.status === "complete" && (
            <div className="render-progress-hud">
              <span className="render-status-orb is-complete"><Check size={15} /></span>
              <span><strong>{render.message}</strong><small>Returned by your agent · revision {render.revision}</small></span>
              <b>Ready</b>
            </div>
          )}

          {viewMode === "render" && render.status === "complete" && (
            <div className="render-timeline">
              {agentWorkflow.map((label) => <span className="is-reached" key={label}><i><Check size={9} /></i>{label}</span>)}
            </div>
          )}

          {!plan && <div className="empty-board-state"><span><Sparkles size={20} /></span><p className="eyebrow">The venue is ready</p><h3>Plan here. Render with your agent.</h3><p>Generate an exact layout, then your connected agent receives this image and edits it with its own image capability.</p></div>}
          {plan && render.status === "idle" && viewMode === "render" && <div className="empty-board-state render-ready-card"><span><WandSparkles size={20} /></span><p className="eyebrow">Structured plan ready</p><h3>Your agent has everything it needs.</h3><p>Ask it to create the first image. WebMCP returns this hall and the complete edit brief directly to that agent.</p><button type="button" onClick={onRequestAgent}>Open agent workflow</button></div>}
          {(stale || render.stale) && <div className="stale-board-state"><Sparkles size={16} /><span><strong>{stale ? "The brief changed" : "Plan map changed"}</strong><small>{stale ? "Regenerate the plan first." : "Ask your agent for a fresh image revision."}</small></span></div>}
          {staged && <div className="staged-board-ribbon"><Check size={14} />Staged for your review</div>}
        </div>

        {viewMode === "plan" && selectedElement && (
          <div className="element-inspector" aria-label={`Edit ${selectedElement.label}`}>
            <div className="inspector-identity"><span className="inspector-color" style={{ background: elementCatalog.find((item) => item.kind === selectedElement.kind)?.color }} /><span><strong>{selectedElement.label}</strong><small>{elementDetail(selectedElement)} · ask your agent for a fresh revision after changes</small></span></div>
            <div className="transform-controls">
              <div className="transform-group" aria-label="Element size"><span>Size</span><button type="button" aria-label={`Make ${selectedElement.label} smaller`} onClick={() => onTransformElement(selectedElement.id, { scale: 0.9 })}><Minus size={13} /></button><output>{Math.round(selectedElement.width)}%</output><button type="button" aria-label={`Make ${selectedElement.label} larger`} onClick={() => onTransformElement(selectedElement.id, { scale: 1.1 })}><Plus size={13} /></button></div>
              <div className="transform-group" aria-label="Element rotation"><span>Turn</span><button type="button" aria-label={`Rotate ${selectedElement.label} left`} onClick={() => onTransformElement(selectedElement.id, { rotation: normaliseRotation(selectedElement.rotation - 15) })}><RotateCcw size={13} /></button><output>{selectedElement.rotation}°</output><button type="button" aria-label={`Rotate ${selectedElement.label} right`} onClick={() => onTransformElement(selectedElement.id, { rotation: normaliseRotation(selectedElement.rotation + 15) })}><RotateCw size={13} /></button></div>
            </div>
            <button className="inspector-remove" type="button" aria-label={`Remove ${selectedElement.label}`} onClick={() => { onRemoveElement(selectedElement.id); setSelectedElementId(null); }}><Trash2 size={13} /><span>Remove</span></button>
          </div>
        )}

        <div className="board-footer"><span>{render.mode === "agent" ? `Agent-supplied image · revision ${render.revision}` : venue.isDemo ? "Sample empty hall" : venue.name}</span><span><Utensils size={12} />No site API key · the connected agent edits every image</span></div>
      </section>
    </main>
  );
}
