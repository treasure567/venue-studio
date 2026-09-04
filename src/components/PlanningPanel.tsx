import { ImagePlus, Minus, Plus, Sparkles, Table2, Upload, UsersRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { elementCatalog } from "../data";
import type { ElementKind, EventBrief, LayoutRequirement, VenueImage } from "../types";

interface PlanningPanelProps {
  venue: VenueImage;
  brief: EventBrief;
  requirements: LayoutRequirement[];
  onVenueImage: (venue: VenueImage) => void;
  onBriefChange: (updates: Partial<EventBrief>) => void;
  onAdjustRequirement: (kind: ElementKind, delta: number) => void;
}

const visibleKinds: ElementKind[] = ["seating", "dance_floor", "stage", "band", "dj", "catering", "bar", "bbq", "lounge", "photo_booth", "registration", "power"];

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function prepareVenueImage(file: File): Promise<VenueImage> {
  const source = await readFile(file);
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Image could not be opened."));
    image.src = source;
  });
  const scale = Math.min(1, 1800 / image.width, 1200 / image.height);
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Image could not be prepared.");
  context.drawImage(image, 0, 0, width, height);
  return { name: file.name, url: canvas.toDataURL("image/jpeg", 0.86), width, height, isDemo: false };
}

export function PlanningPanel({
  venue,
  brief,
  requirements,
  onVenueImage,
  onBriefChange,
  onAdjustRequirement,
}: PlanningPanelProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [notes, setNotes] = useState(brief.notes);
  const [uploadError, setUploadError] = useState("");
  const [dragging, setDragging] = useState(false);

  useEffect(() => setNotes(brief.notes), [brief.notes]);

  async function handleFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setUploadError("The venue image must be under 12 MB.");
      return;
    }
    try {
      onVenueImage(await prepareVenueImage(file));
      setUploadError("");
    } catch {
      setUploadError("This image could not be prepared. Try another file.");
    }
  }

  return (
    <aside className="panel planning-panel">
      <section className="panel-section venue-section">
        <div className="section-title-row">
          <div><p className="eyebrow">01 · Venue</p><h2>Start with the space</h2></div>
          <span className="step-badge">Photo</span>
        </div>
        <button
          className={`venue-upload ${dragging ? "is-dragging" : ""}`}
          type="button"
          onClick={() => fileInput.current?.click()}
          onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            void handleFile(event.dataTransfer.files[0]);
          }}
        >
          <img src={venue.url} alt="Current empty venue" />
          <span className="venue-upload-action"><ImagePlus size={15} />{venue.isDemo ? "Upload your empty hall" : "Replace venue image"}</span>
          <small>{venue.name}</small>
        </button>
        <input
          ref={fileInput}
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-label="Upload empty venue image"
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
        {uploadError && <p className="field-error">{uploadError}</p>}
      </section>

      <section className="panel-section brief-section">
        <div className="section-title-row compact"><div><p className="eyebrow">02 · Brief</p><h2>Describe the event</h2></div><Sparkles size={16} /></div>
        <div className="brief-grid">
          <label className="form-field form-field-wide"><span>Event name</span><input value={brief.name} onChange={(event) => onBriefChange({ name: event.target.value })} /></label>
          <label className="form-field"><span>Event type</span><select value={brief.eventType} onChange={(event) => onBriefChange({ eventType: event.target.value as EventBrief["eventType"] })}>
            <option value="wedding">Wedding</option><option value="concert">Concert</option><option value="conference">Conference</option><option value="corporate">Corporate</option><option value="birthday">Birthday</option><option value="festival">Festival</option><option value="custom">Custom</option>
          </select></label>
          <label className="form-field"><span>Guests</span><div className="field-with-icon"><UsersRound size={13} /><input type="number" min="1" max="5000" value={brief.guestCount} onChange={(event) => onBriefChange({ guestCount: Number(event.target.value) })} /></div></label>
          <label className="form-field"><span>Tables</span><div className="field-with-icon"><Table2 size={13} /><input type="number" min="1" max="500" value={brief.tableCount} onChange={(event) => onBriefChange({ tableCount: Number(event.target.value) })} /></div></label>
          <label className="form-field"><span>Chairs / table</span><input aria-label="Chairs per table" type="number" min="1" max="30" value={brief.seatsPerTable} onChange={(event) => onBriefChange({ seatsPerTable: Number(event.target.value) })} /></label>
          <label className="form-field form-field-wide"><span>Priorities and constraints</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} onBlur={() => notes !== brief.notes && onBriefChange({ notes })} /></label>
        </div>
      </section>

      <section className="panel-section inventory-section">
        <div className="section-title-row compact"><div><p className="eyebrow">03 · Inventory</p><h2>What should be inside?</h2></div><span className="inventory-total">{requirements.length}</span></div>
        <div className="requirement-list">
          {visibleKinds.map((kind) => {
            const catalog = elementCatalog.find((item) => item.kind === kind)!;
            const requirement = requirements.find((item) => item.kind === kind);
            const quantity = requirement?.quantity ?? 0;
            const detail = kind === "seating" && requirement ? `${quantity * (requirement.capacityPerUnit ?? brief.seatsPerTable)} chairs` : quantity ? `× ${quantity}` : "Not added";
            return (
              <div className={`requirement-row ${quantity ? "is-active" : ""}`} key={kind}>
                <i style={{ background: catalog.color }} />
                <span><strong>{catalog.label}</strong><small>{detail}</small></span>
                <div>
                  <button type="button" aria-label={`Remove one ${catalog.label}`} disabled={!quantity || kind === "seating"} onClick={() => onAdjustRequirement(kind, -1)}><Minus size={12} /></button>
                  <b>{quantity}</b>
                  <button type="button" aria-label={`Add one ${catalog.label}`} onClick={() => onAdjustRequirement(kind, 1)}><Plus size={12} /></button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="agent-brief-card">
        <span><Upload size={14} />Try this with your agent</span>
        <p>“Receive this hall image, arrange 19 tables with 8 chairs each, return a photoreal revision, inspect it, then keep refining until it looks real.”</p>
      </section>
    </aside>
  );
}
