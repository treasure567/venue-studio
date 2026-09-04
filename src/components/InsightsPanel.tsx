import { AlertTriangle, Bot, Check, CheckCircle2, Download, LayoutTemplate, ShieldCheck, Sparkles, Users, Waypoints, X } from "lucide-react";
import type { ActivityEntry, EventBrief, LayoutPlan, LayoutRequirement } from "../types";

interface InsightsPanelProps {
  brief: EventBrief;
  requirements: LayoutRequirement[];
  plans: LayoutPlan[];
  selectedPlanId: string | null;
  projectRevision: number;
  stagedPlanId: string | null;
  stagedReason: string;
  approvedPlanId: string | null;
  activity: ActivityEntry[];
  onSelect: (planId: string) => void;
  onStage: (planId: string) => void;
  onReject: () => void;
  onApprove: () => void;
  onExport: () => void;
}

export function InsightsPanel({
  brief,
  requirements,
  plans,
  selectedPlanId,
  projectRevision,
  stagedPlanId,
  stagedReason,
  approvedPlanId,
  activity,
  onSelect,
  onStage,
  onReject,
  onApprove,
  onExport,
}: InsightsPanelProps) {
  const selected = plans.find((plan) => plan.id === selectedPlanId);
  const staged = plans.find((plan) => plan.id === stagedPlanId);
  const approved = plans.find((plan) => plan.id === approvedPlanId);

  return (
    <aside className="panel insights-panel">
      <section className="panel-section layouts-section">
        <div className="section-title-row compact"><div><p className="eyebrow">Layout options</p><h2>Choose a direction</h2></div><span className="layout-count">{plans.length}</span></div>
        {plans.length ? (
          <div className="layout-list">
            {plans.map((plan) => (
              <button className={`layout-card ${plan.id === selectedPlanId ? "is-selected" : ""}`} type="button" key={plan.id} onClick={() => onSelect(plan.id)}>
                <span className="layout-score">{plan.metrics.overallScore}</span>
                <span><strong>{plan.name}</strong><small>{plan.description}</small></span>
                <i className={plan.valid ? "valid" : "invalid"}>{plan.valid ? <Check size={11} /> : <AlertTriangle size={11} />}</i>
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-side-state"><LayoutTemplate size={20} /><strong>No layout yet</strong><p>Generate options manually or ask your agent to arrange the venue.</p></div>
        )}
      </section>

      {selected && (
        <section className="panel-section analysis-section">
          <div className="section-title-row compact"><div><p className="eyebrow">Live plan check</p><h2>{selected.name}</h2></div><span className={`validity-pill ${selected.valid ? "valid" : "invalid"}`}>{selected.valid ? "Ready" : "Blocked"}</span></div>
          {selected.revision !== projectRevision && <div className="analysis-warning"><Sparkles size={13} />This plan is stale. Regenerate it from the latest brief.</div>}
          <div className="metric-grid">
            <div><Users size={14} /><span>Capacity</span><strong>{selected.metrics.guestCapacity}</strong><small>for {brief.guestCount}</small></div>
            <div><Waypoints size={14} /><span>Flow</span><strong>{selected.metrics.flowScore}</strong><small>out of 100</small></div>
            <div><ShieldCheck size={14} /><span>Coverage</span><strong>{selected.metrics.requirementCoverage}%</strong><small>{selected.elements.length} zones</small></div>
          </div>
          <div className="coverage-list">
            {requirements.map((requirement) => {
              const actual = selected.elements.filter((element) => element.kind === requirement.kind).reduce((total, element) => total + element.quantity, 0);
              const covered = actual >= requirement.quantity;
              return <div key={requirement.id}><i className={covered ? "covered" : "missing"}>{covered ? <Check size={10} /> : <X size={10} />}</i><span>{requirement.label}</span><b>{actual}/{requirement.quantity}</b></div>;
            })}
          </div>
          <div className="issue-list">
            {selected.issues.length ? selected.issues.map((issue) => (
              <div className={`issue-row ${issue.severity}`} key={issue.id}><AlertTriangle size={13} /><span><strong>{issue.severity === "error" ? "Blocking issue" : "Check placement"}</strong><small>{issue.message}</small></span></div>
            )) : <div className="no-issues"><CheckCircle2 size={14} />No layout issues detected</div>}
          </div>
          <button className="button button-stage" type="button" disabled={!selected.valid || selected.revision !== projectRevision} onClick={() => onStage(selected.id)}><ShieldCheck size={14} />Stage this layout for review</button>
        </section>
      )}

      {(staged || approved) && (
        <section className={`review-card ${approved ? "is-approved" : ""}`}>
          <div className="review-kicker">{approved ? <CheckCircle2 size={14} /> : <Bot size={14} />}{approved ? "Approved by you" : "Human review required"}</div>
          <h3>{(approved ?? staged)?.name}</h3>
          <p>{approved ? "This venue layout is locked and ready to share with vendors." : stagedReason}</p>
          {approved ? (
            <button className="button button-approve full-width" type="button" onClick={onExport}><Download size={14} />Export layout JSON</button>
          ) : (
            <div className="review-actions"><button className="button button-quiet" type="button" onClick={onReject}>Keep editing</button><button className="button button-approve" type="button" onClick={onApprove}>Approve layout</button></div>
          )}
        </section>
      )}

      <section className="panel-section activity-section">
        <div className="section-title-row compact"><div><p className="eyebrow">Shared activity</p><h2>What changed</h2></div><span className="live-pulse">Live</span></div>
        <div className="activity-list">
          {activity.slice(0, 7).map((entry) => (
            <div className="activity-row" key={entry.id}><span className={`activity-source ${entry.source}`}>{entry.source === "agent" ? "AI" : entry.source === "human" ? "You" : "SYS"}</span><p><strong>{entry.summary}</strong><small>State {entry.stateVersion}</small></p></div>
          ))}
        </div>
      </section>
    </aside>
  );
}
