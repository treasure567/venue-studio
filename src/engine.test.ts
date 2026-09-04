import { describe, expect, it } from "vitest";
import { demoBrief, demoRequirements } from "./data";
import { createLayoutElement, generateLayoutPlans, validateLayout } from "./engine";

describe("venue layout engine", () => {
  it("generates three count-based plans with enough seats and full requirement coverage", () => {
    const plans = generateLayoutPlans(demoBrief, demoRequirements, 0);

    expect(plans).toHaveLength(3);
    expect(new Set(plans.map((plan) => plan.strategy)).size).toBe(3);
    for (const plan of plans) {
      expect(plan.metrics.guestCapacity).toBeGreaterThanOrEqual(demoBrief.guestCount);
      expect(plan.metrics.requirementCoverage).toBe(100);
      expect(plan.valid).toBe(true);
      expect(plan.elements.filter((element) => element.kind === "seating")).toHaveLength(19);
      expect(plan.elements.filter((element) => element.kind === "seating").every((element) => element.quantity === 1 && element.capacityPerUnit === 8)).toBe(true);
      expect(plan.elements.some((element) => element.kind === "band")).toBe(true);
      expect(plan.elements.some((element) => element.kind === "bbq")).toBe(true);
    }
  });

  it("blocks a layout that cannot seat the guests or omits a required zone", () => {
    const seating = createLayoutElement({ kind: "seating", label: "Small dining area", quantity: 3, capacityPerUnit: 8 }, "seating", { x: 40, y: 50 });
    const validation = validateLayout(demoBrief, demoRequirements, [seating]);

    expect(validation.valid).toBe(false);
    expect(validation.issues.some((issue) => issue.code === "INSUFFICIENT_SEATING")).toBe(true);
    expect(validation.issues.some((issue) => issue.code === "MISSING_REQUIREMENT" && issue.message.includes("Live band"))).toBe(true);
  });

  it("warns when a barbecue is moved into the middle of the hall", () => {
    const plan = generateLayoutPlans(demoBrief, demoRequirements, 0, ["balanced"])[0];
    const elements = plan.elements.map((element) => element.kind === "bbq" ? { ...element, x: 50, y: 45 } : element);
    const validation = validateLayout(demoBrief, demoRequirements, elements);

    expect(validation.valid).toBe(true);
    expect(validation.issues.some((issue) => issue.code === "BBQ_PLACEMENT")).toBe(true);
  });
});
