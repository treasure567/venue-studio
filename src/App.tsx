import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { ConnectAgentDialog } from "./components/ConnectAgentDialog";
import { Header } from "./components/Header";
import { InsightsPanel } from "./components/InsightsPanel";
import { PlanningPanel } from "./components/PlanningPanel";
import { SamplePromptsDialog } from "./components/SamplePromptsDialog";
import { VenueBoard } from "./components/VenueBoard";
import { useSeatingStore } from "./store";
import { WebMCPTools } from "./webmcp/WebMCPTools";

function downloadLayout() {
  const state = useSeatingStore.getState();
  const plan = state.plans.find((candidate) => candidate.id === state.approvedPlanId);
  if (!plan) return;
  const payload = JSON.stringify({ venue: state.venue.name, brief: state.brief, requirements: state.requirements, layout: plan }, null, 2);
  const blob = new Blob([payload], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "venue-studio-layout.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function App() {
  const [connectOpen, setConnectOpen] = useState(false);
  const [promptsOpen, setPromptsOpen] = useState(false);
  const venue = useSeatingStore((state) => state.venue);
  const brief = useSeatingStore((state) => state.brief);
  const requirements = useSeatingStore((state) => state.requirements);
  const plans = useSeatingStore((state) => state.plans);
  const selectedPlanId = useSeatingStore((state) => state.selectedPlanId);
  const stagedPlanId = useSeatingStore((state) => state.stagedPlanId);
  const stagedReason = useSeatingStore((state) => state.stagedReason);
  const approvedPlanId = useSeatingStore((state) => state.approvedPlanId);
  const projectRevision = useSeatingStore((state) => state.projectRevision);
  const activity = useSeatingStore((state) => state.activity);
  const webmcpSupported = useSeatingStore((state) => state.webmcpSupported);
  const webmcpRegistered = useSeatingStore((state) => state.webmcpRegistered);
  const render = useSeatingStore((state) => state.render);
  const setVenueImage = useSeatingStore((state) => state.setVenueImage);
  const setBrief = useSeatingStore((state) => state.setBrief);
  const adjustRequirement = useSeatingStore((state) => state.adjustRequirement);
  const generateLayouts = useSeatingStore((state) => state.generateLayouts);
  const selectPlan = useSeatingStore((state) => state.selectPlan);
  const transformElements = useSeatingStore((state) => state.transformElements);
  const removeElements = useSeatingStore((state) => state.removeElements);
  const stagePlan = useSeatingStore((state) => state.stagePlan);
  const clearStage = useSeatingStore((state) => state.clearStage);
  const approveStaged = useSeatingStore((state) => state.approveStaged);
  const resetDemo = useSeatingStore((state) => state.resetDemo);
  const selected = plans.find((plan) => plan.id === selectedPlanId);

  return (
    <div className="app-shell">
      <WebMCPTools />
      <Header
        eventName={brief.name}
        eventMeta={`${brief.eventType.replaceAll("_", " ")} · ${brief.guestCount} guests · ${venue.name}`}
        webmcpSupported={webmcpSupported}
        webmcpRegistered={webmcpRegistered}
        onGenerate={() => generateLayouts(undefined, "human")}
        onReset={resetDemo}
        onConnect={() => setConnectOpen(true)}
        onPrompts={() => setPromptsOpen(true)}
      />
      <div className="workspace-grid">
        <PlanningPanel
          venue={venue}
          brief={brief}
          requirements={requirements}
          onVenueImage={(image) => setVenueImage(image, "human")}
          onBriefChange={(updates) => setBrief(updates, "human")}
          onAdjustRequirement={adjustRequirement}
        />
        <VenueBoard
          venue={venue}
          brief={brief}
          plan={selected}
          render={render}
          stale={Boolean(selected && selected.revision !== projectRevision)}
          staged={Boolean(selected && selected.id === stagedPlanId)}
          onRequestAgent={() => setConnectOpen(true)}
          onTransformElement={(elementId, transform) => transformElements([{ elementId, ...transform }], "human")}
          onRemoveElement={(elementId) => removeElements([elementId], "human")}
        />
        <InsightsPanel
          brief={brief}
          requirements={requirements}
          plans={plans}
          selectedPlanId={selectedPlanId}
          projectRevision={projectRevision}
          stagedPlanId={stagedPlanId}
          stagedReason={stagedReason}
          approvedPlanId={approvedPlanId}
          activity={activity}
          onSelect={selectPlan}
          onStage={(planId) => stagePlan(planId, "Selected after reviewing capacity, flow, service access, and safety checks.", "human")}
          onReject={clearStage}
          onApprove={approveStaged}
          onExport={downloadLayout}
        />
      </div>
      <AnimatePresence>
        {connectOpen && <ConnectAgentDialog open={connectOpen} ready={webmcpRegistered} onClose={() => setConnectOpen(false)} />}
        {promptsOpen && <SamplePromptsDialog onClose={() => setPromptsOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
