import { beforeEach, describe, expect, it } from "vitest";
import { useSeatingStore } from "./store";

describe("venue project store", () => {
  beforeEach(() => useSeatingStore.getState().resetDemo());

  it("marks generated layouts stale when the event brief changes", () => {
    useSeatingStore.getState().generateLayouts();
    const planId = useSeatingStore.getState().selectedPlanId!;

    useSeatingStore.getState().setBrief({ guestCount: 180 });
    const validation = useSeatingStore.getState().validatePlan(planId);

    expect(validation.ok).toBe(false);
    expect(validation.error?.code).toBe("STALE_LAYOUT");
  });

  it("lets an agent stage a plan while approval remains human-only", () => {
    useSeatingStore.getState().generateLayouts(undefined, "agent");
    const planId = useSeatingStore.getState().selectedPlanId!;
    const staged = useSeatingStore.getState().stagePlan(planId, "Best balance of guest flow and service access.", "agent");

    expect(staged.ok).toBe(true);
    expect(useSeatingStore.getState().approvedPlanId).toBeNull();
    expect(useSeatingStore.getState().activity[0].source).toBe("agent");

    useSeatingStore.getState().approveStaged();
    expect(useSeatingStore.getState().approvedPlanId).toBe(planId);
    expect(useSeatingStore.getState().activity[0].source).toBe("human");
  });

  it("moves, scales, rotates, and revalidates a visible element", () => {
    useSeatingStore.getState().generateLayouts(["balanced"], "agent");
    const plan = useSeatingStore.getState().plans[0];
    const barbecue = plan.elements.find((element) => element.kind === "bbq")!;

    const transformed = useSeatingStore.getState().transformElements([{ elementId: barbecue.id, x: 50, y: 45, scale: 1.25, rotateBy: 30, rotateXBy: 15, rotateYBy: -20 }], "agent");
    const updated = useSeatingStore.getState().plans[0];
    const updatedBarbecue = updated.elements.find((element) => element.id === barbecue.id)!;

    expect(transformed.ok).toBe(true);
    expect(updatedBarbecue.width).toBeCloseTo(barbecue.width * 1.25);
    expect(updatedBarbecue.height).toBeCloseTo(barbecue.height * 1.25);
    expect(updatedBarbecue.rotation).toBe(30);
    expect(updatedBarbecue.rotateX).toBe(15);
    expect(updatedBarbecue.rotateY).toBe(-20);
    expect(updated.manuallyAdjusted).toBe(true);
    expect(updated.issues.some((issue) => issue.code === "BBQ_PLACEMENT")).toBe(true);
  });
});
