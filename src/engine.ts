import type {
  ElementKind,
  EventBrief,
  LayoutElement,
  LayoutIssue,
  LayoutPlan,
  LayoutRequirement,
  LayoutStrategy,
} from "./types";

interface ElementPosition {
  x: number;
  y: number;
}

const strategyDetails: Record<LayoutStrategy, { name: string; description: string }> = {
  balanced: { name: "Balanced Flow", description: "Distributes dining, entertainment, and service zones evenly across the hall." },
  guest_flow: { name: "Open Arrival", description: "Protects the entrance and keeps a generous route through the centre." },
  entertainment_first: { name: "Show Focus", description: "Makes the stage and dance floor the visual centre of the event." },
  service_first: { name: "Service Ready", description: "Prioritises catering access and keeps operational zones at the perimeter." },
};

const positions: Record<LayoutStrategy, Partial<Record<ElementKind, ElementPosition[]>>> = {
  balanced: {
    stage: [{ x: 50, y: 46 }],
    band: [{ x: 50, y: 45 }],
    dj: [{ x: 73, y: 52 }],
    dance_floor: [{ x: 50, y: 66 }],
    seating: [{ x: 25, y: 69 }, { x: 75, y: 69 }, { x: 28, y: 87 }, { x: 72, y: 87 }],
    catering: [{ x: 9, y: 54 }],
    bar: [{ x: 91, y: 56 }],
    bbq: [{ x: 89, y: 92 }],
    registration: [{ x: 8, y: 90 }],
    lounge: [{ x: 82, y: 76 }],
    photo_booth: [{ x: 16, y: 74 }],
    power: [{ x: 89, y: 49 }],
    restroom: [{ x: 91, y: 88 }],
  },
  guest_flow: {
    stage: [{ x: 51, y: 46 }],
    band: [{ x: 51, y: 45 }],
    dj: [{ x: 80, y: 53 }],
    dance_floor: [{ x: 61, y: 67 }],
    seating: [{ x: 26, y: 67 }, { x: 28, y: 83 }, { x: 73, y: 83 }, { x: 74, y: 95 }],
    catering: [{ x: 8, y: 53 }],
    bar: [{ x: 92, y: 57 }],
    bbq: [{ x: 90, y: 92 }],
    registration: [{ x: 8, y: 90 }],
    lounge: [{ x: 79, y: 76 }],
    photo_booth: [{ x: 18, y: 76 }],
    power: [{ x: 89, y: 49 }],
    restroom: [{ x: 92, y: 89 }],
  },
  entertainment_first: {
    stage: [{ x: 50, y: 47 }],
    band: [{ x: 50, y: 46 }],
    dj: [{ x: 75, y: 53 }],
    dance_floor: [{ x: 50, y: 69 }],
    seating: [{ x: 21, y: 70 }, { x: 79, y: 70 }, { x: 24, y: 88 }, { x: 76, y: 88 }],
    catering: [{ x: 8, y: 54 }],
    bar: [{ x: 92, y: 56 }],
    bbq: [{ x: 89, y: 92 }],
    registration: [{ x: 8, y: 90 }],
    lounge: [{ x: 50, y: 88 }],
    photo_booth: [{ x: 17, y: 77 }],
    power: [{ x: 89, y: 49 }],
    restroom: [{ x: 92, y: 89 }],
  },
  service_first: {
    stage: [{ x: 50, y: 46 }],
    band: [{ x: 50, y: 45 }],
    dj: [{ x: 74, y: 52 }],
    dance_floor: [{ x: 50, y: 66 }],
    seating: [{ x: 28, y: 70 }, { x: 72, y: 70 }, { x: 28, y: 87 }, { x: 72, y: 87 }],
    catering: [{ x: 8, y: 54 }],
    bar: [{ x: 92, y: 56 }],
    bbq: [{ x: 90, y: 92 }],
    registration: [{ x: 8, y: 90 }],
    lounge: [{ x: 82, y: 78 }],
    photo_booth: [{ x: 17, y: 76 }],
    power: [{ x: 90, y: 49 }],
    restroom: [{ x: 92, y: 89 }],
  },
};

const dimensions: Record<ElementKind, { width: number; height: number }> = {
  seating: { width: 10, height: 5 },
  dance_floor: { width: 27, height: 18 },
  stage: { width: 42, height: 12 },
  band: { width: 23, height: 11 },
  dj: { width: 18, height: 10 },
  catering: { width: 18, height: 8 },
  bar: { width: 18, height: 8 },
  bbq: { width: 17, height: 11 },
  lounge: { width: 22, height: 12 },
  photo_booth: { width: 18, height: 11 },
  registration: { width: 14, height: 9 },
  power: { width: 12, height: 8 },
  restroom: { width: 9, height: 8 },
  custom: { width: 14, height: 10 },
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

function layoutPosition(kind: ElementKind, strategy: LayoutStrategy, index: number): ElementPosition {
  const choices = positions[strategy][kind];
  if (choices?.length) return choices[index % choices.length];
  return { x: 20 + (index % 4) * 20, y: 36 + Math.floor(index / 4) * 16 };
}

const seatingColumns = [18, 29, 40, 60, 71, 82];
const partialSeatingColumns = [[35], [35, 65], [24, 50, 76], [24, 38, 62, 76], [16, 28, 40, 65, 80], seatingColumns];
const seatingRowY = [78, 83, 88, 93];

function seatingPosition(strategy: LayoutStrategy, index: number, count: number): ElementPosition {
  const rowIndex = Math.floor(index / seatingColumns.length);
  const rowStart = rowIndex * seatingColumns.length;
  const itemsInRow = Math.min(seatingColumns.length, count - rowStart);
  const columns = partialSeatingColumns[itemsInRow - 1] ?? seatingColumns;
  const remaining = index - rowStart;
  let x = columns[remaining];
  let y = seatingRowY[rowIndex] ?? seatingRowY[seatingRowY.length - 1];
  if (strategy === "guest_flow") x += x < 50 ? -2 : x > 50 ? 2 : 0;
  if (strategy === "entertainment_first") y += rowIndex > 1 ? 1 : 0;
  if (strategy === "service_first") x += x < 50 ? 1 : x > 50 ? -1 : 0;
  return { x, y };
}

export function createLayoutElement(
  input: Pick<LayoutElement, "kind" | "label" | "quantity"> & Partial<Omit<LayoutElement, "id" | "kind" | "label" | "quantity">>,
  id: string,
  fallbackPosition: ElementPosition = { x: 50, y: 50 },
): LayoutElement {
  const size = dimensions[input.kind];
  return {
    id,
    kind: input.kind,
    label: input.label,
    quantity: Math.max(1, Math.round(input.quantity)),
    capacityPerUnit: input.capacityPerUnit,
    x: clamp(input.x ?? fallbackPosition.x, 5, 95),
    y: clamp(input.y ?? fallbackPosition.y, 7, 93),
    width: clamp(input.width ?? size.width, 6, 65),
    height: clamp(input.height ?? size.height, 6, 50),
    rotation: clamp(input.rotation ?? 0, -180, 180),
    rotateX: clamp(input.rotateX ?? 0, -65, 65),
    rotateY: clamp(input.rotateY ?? 0, -65, 65),
    locked: input.locked ?? false,
  };
}

function generateElements(brief: EventBrief, requirements: LayoutRequirement[], strategy: LayoutStrategy) {
  const elements: LayoutElement[] = [];
  let fallbackIndex = 0;
  for (const requirement of requirements) {
    if (requirement.kind === "seating") {
      const visualCount = Math.min(24, requirement.quantity);
      const baseQuantity = Math.floor(requirement.quantity / visualCount);
      const remainder = requirement.quantity % visualCount;
      const quantities = Array.from({ length: visualCount }, (_, index) => baseQuantity + (index < remainder ? 1 : 0));
      quantities.forEach((quantity, index) => {
        elements.push(createLayoutElement({
          kind: "seating",
          label: visualCount === requirement.quantity ? `Table ${index + 1}` : `Table group ${index + 1}`,
          quantity,
          capacityPerUnit: requirement.capacityPerUnit ?? brief.seatsPerTable,
        }, `${strategy}-seating-${index + 1}`, seatingPosition(strategy, index, visualCount)));
      });
      continue;
    }
    elements.push(createLayoutElement({
      kind: requirement.kind,
      label: requirement.label,
      quantity: requirement.quantity,
      capacityPerUnit: requirement.capacityPerUnit,
    }, `${strategy}-${requirement.kind}-${fallbackIndex + 1}`, layoutPosition(requirement.kind, strategy, fallbackIndex)));
    fallbackIndex += 1;
  }
  return elements;
}

function overlaps(first: LayoutElement, second: LayoutElement) {
  const horizontal = Math.max(0, Math.min(first.x + first.width / 2, second.x + second.width / 2) - Math.max(first.x - first.width / 2, second.x - second.width / 2));
  const vertical = Math.max(0, Math.min(first.y + first.height / 2, second.y + second.height / 2) - Math.max(first.y - first.height / 2, second.y - second.height / 2));
  const intersection = horizontal * vertical;
  const smallerArea = Math.min(first.width * first.height, second.width * second.height);
  return smallerArea > 0 && intersection / smallerArea > 0.28;
}

export function validateLayout(brief: EventBrief, requirements: LayoutRequirement[], elements: LayoutElement[]) {
  const issues: LayoutIssue[] = [];
  const seatingCapacity = elements
    .filter((element) => element.kind === "seating")
    .reduce((total, element) => total + element.quantity * (element.capacityPerUnit ?? brief.seatsPerTable), 0);

  if (seatingCapacity < brief.guestCount) {
    issues.push({
      id: "insufficient-seating",
      code: "INSUFFICIENT_SEATING",
      severity: "error",
      message: `Capacity is ${seatingCapacity}; ${brief.guestCount} guests need seats.`,
      elementIds: elements.filter((element) => element.kind === "seating").map((element) => element.id),
    });
  }

  for (const requirement of requirements.filter((item) => item.required)) {
    const actual = elements.filter((element) => element.kind === requirement.kind).reduce((total, element) => total + element.quantity, 0);
    if (actual < requirement.quantity) {
      issues.push({
        id: `missing-${requirement.id}`,
        code: "MISSING_REQUIREMENT",
        severity: "error",
        message: `${requirement.label} needs ${requirement.quantity}; the plan includes ${actual}.`,
        elementIds: elements.filter((element) => element.kind === requirement.kind).map((element) => element.id),
      });
    }
  }

  for (let firstIndex = 0; firstIndex < elements.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < elements.length; secondIndex += 1) {
      const first = elements[firstIndex];
      const second = elements[secondIndex];
      const pair = new Set([first.kind, second.kind]);
      if (pair.has("stage") && (pair.has("band") || pair.has("dj"))) continue;
      if (overlaps(first, second)) {
        issues.push({
          id: `overlap-${first.id}-${second.id}`,
          code: "ELEMENT_OVERLAP",
          severity: "warning",
          message: `${first.label} overlaps ${second.label}.`,
          elementIds: [first.id, second.id],
        });
      }
    }
  }

  for (const element of elements.filter((item) => item.kind === "bbq" && item.y < 70)) {
    issues.push({
      id: `bbq-${element.id}`,
      code: "BBQ_PLACEMENT",
      severity: "warning",
      message: `${element.label} should sit at the open-air edge of the venue.`,
      elementIds: [element.id],
    });
  }

  for (const element of elements.filter((item) => item.kind !== "registration" && item.x < 17 && item.y > 76)) {
    issues.push({
      id: `exit-${element.id}`,
      code: "EXIT_BLOCKED",
      severity: "warning",
      message: `${element.label} may narrow the main arrival route.`,
      elementIds: [element.id],
    });
  }

  const coverageParts = requirements.map((requirement) => {
    const actual = elements.filter((element) => element.kind === requirement.kind).reduce((total, element) => total + element.quantity, 0);
    return Math.min(1, actual / requirement.quantity);
  });
  const requirementCoverage = coverageParts.length ? Math.round((coverageParts.reduce((total, value) => total + value, 0) / coverageParts.length) * 100) : 100;
  const errors = issues.filter((issue) => issue.severity === "error").length;
  const warnings = issues.filter((issue) => issue.severity === "warning").length;
  const flowScore = clamp(98 - warnings * 7 - errors * 14, 0, 100);
  const serviceScore = clamp(96 - issues.filter((issue) => issue.code === "BBQ_PLACEMENT").length * 18, 0, 100);
  const safetyScore = clamp(98 - issues.filter((issue) => issue.code === "EXIT_BLOCKED").length * 18 - errors * 12, 0, 100);
  const overallScore = Math.round((requirementCoverage + flowScore + serviceScore + safetyScore) / 4);

  return {
    issues,
    metrics: { overallScore, requirementCoverage, guestCapacity: seatingCapacity, flowScore, serviceScore, safetyScore },
    valid: errors === 0,
  };
}

export function refreshLayoutPlan(plan: LayoutPlan, brief: EventBrief, requirements: LayoutRequirement[], elements: LayoutElement[], manuallyAdjusted = true): LayoutPlan {
  const validation = validateLayout(brief, requirements, elements);
  return { ...plan, elements, issues: validation.issues, metrics: validation.metrics, valid: validation.valid, manuallyAdjusted };
}

export function generateLayoutPlans(
  brief: EventBrief,
  requirements: LayoutRequirement[],
  revision: number,
  strategies: LayoutStrategy[] = ["balanced", "guest_flow", "service_first"],
) {
  return strategies.map((strategy) => {
    const elements = generateElements(brief, requirements, strategy);
    const validation = validateLayout(brief, requirements, elements);
    return {
      id: `${strategy}-${revision + 1}`,
      name: strategyDetails[strategy].name,
      description: strategyDetails[strategy].description,
      strategy,
      revision,
      elements,
      issues: validation.issues,
      metrics: validation.metrics,
      valid: validation.valid,
      manuallyAdjusted: false,
    } satisfies LayoutPlan;
  });
}
