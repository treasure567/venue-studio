import { expect, test } from "@playwright/test";

test("the inspiration library exposes ten copyable prompts and ten finished examples", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Sample prompts" }).click();

  await expect(page.getByRole("dialog", { name: "Ten rooms worth imagining." })).toBeVisible();
  await expect(page.locator(".prompt-card")).toHaveCount(10);
  await expect(page.locator(".prompt-card.has-preview img")).toHaveCount(10);
  await expect(page.locator(".prompt-source-link")).toHaveCount(7);
  await expect(page.getByRole("heading", { name: "Emerald Nigerian Wedding" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Future Product Launch" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Black-Tie Awards Night" })).toBeVisible();
  await page.getByRole("button", { name: "Close sample prompts" }).click();
  await expect(page.getByRole("dialog", { name: "Ten rooms worth imagining." })).toHaveCount(0);
});

test("a planner can fill, adjust, approve, and export a venue layout", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Amina & Kelechi Celebration" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Empty venue: The Cedar Hall" })).toBeVisible();
  await page.getByRole("button", { name: "Connect agent" }).click();
  await expect(page.getByRole("dialog", { name: "Describe it. Your agent renders it." })).toBeVisible();
  await expect(page.getByText("Venue Studio needs no account or API key.")).toBeVisible();
  await expect(page.getByText("No hidden image service.")).toBeVisible();
  await page.getByRole("button", { name: "Close agent setup" }).click();

  await page.getByRole("button", { name: "Generate plan" }).click();
  await expect(page.getByRole("button", { name: /Balanced Flow/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Open Arrival/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Service Ready/ })).toBeVisible();
  await expect(page.getByText("Your agent has everything it needs.")).toBeVisible();
  await page.getByRole("button", { name: "Plan map" }).click();
  await expect(page.locator(".layout-element")).toHaveCount(27);

  const barbecue = page.getByRole("button", { name: /Barbecue spot/ });
  const bounds = await barbecue.boundingBox();
  if (!bounds) throw new Error("Barbecue layout element was not visible.");
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down();
  await page.mouse.move(bounds.x - 45, bounds.y - 30, { steps: 5 });
  await page.mouse.up();
  await expect(page.getByText("Transformed 1 layout element.").first()).toBeVisible();

  const band = page.getByRole("button", { name: /^Live band, 1 zone/ });
  await band.click();
  await page.getByRole("button", { name: "Make Live band larger" }).click();
  await page.getByRole("button", { name: "Rotate Live band right" }).click();
  const bandEditor = page.getByLabel("Edit Live band");
  await expect(bandEditor.getByText("25%", { exact: true })).toBeVisible();
  await expect(bandEditor.getByText("15°", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "AI render" }).click();
  await page.getByRole("button", { name: "Create with agent" }).click();
  await expect(page.getByRole("dialog", { name: "Describe it. Your agent renders it." })).toBeVisible();
  await page.getByRole("button", { name: "Close agent setup" }).click();

  await page.getByRole("button", { name: "Stage this layout for review" }).click();
  await expect(page.getByText("Human review required")).toBeVisible();
  await page.getByRole("button", { name: "Approve layout" }).click();
  await expect(page.getByText("Approved by you")).toBeVisible();
  await expect(page.getByRole("button", { name: "Export layout JSON" })).toBeVisible();
});

test("table and chair inputs produce exact individual seating objects", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("spinbutton", { name: "Tables" }).fill("16");
  await page.getByRole("spinbutton", { name: "Chairs per table" }).fill("10");
  await page.getByRole("button", { name: "Generate plan" }).click();
  await page.getByRole("button", { name: "Plan map" }).click();

  await expect(page.locator(".layout-element.kind-seating")).toHaveCount(16);
  await expect(page.getByText("16 tables · 160 chairs · 8 production zones")).toBeVisible();
  await expect(page.getByRole("button", { name: /^Table 1, 10 chairs/ })).toBeVisible();
});

test("WebMCP tools visibly arrange the hall while preserving human approval", async ({ page }) => {
  await page.addInitScript(() => {
    const tools = new Map();
    Object.defineProperty(document, "modelContext", {
      configurable: true,
      value: {
        registerTool(tool: { name: string }, options: { signal: AbortSignal }) {
          tools.set(tool.name, tool);
          Object.assign(window, { __venueTools: tools });
          options.signal.addEventListener("abort", () => tools.delete(tool.name));
        },
      },
    });
  });
  await page.goto("/");
  await expect(page.getByText("15 agent tools ready")).toBeVisible();

  const response = await page.evaluate(async () => {
    const tools = (window as any).__venueTools as Map<string, { execute: (input: unknown) => Promise<{ content: Array<{ type: string; text?: string; data?: string }>; isError?: boolean }> }>;
    const configured = await tools.get("venue.configure_event")!.execute({
      name: "Sunset Hall Experience",
      eventType: "concert",
      guestCount: 180,
      tableCount: 23,
      seatsPerTable: 8,
    });
    const required = await tools.get("venue.set_requirements")!.execute({
      mode: "replace",
      requirements: [
        { kind: "seating", label: "Dining tables", quantity: 23, capacityPerUnit: 8, required: true },
        { kind: "dance_floor", quantity: 1, required: true },
        { kind: "stage", quantity: 1, required: true },
        { kind: "band", quantity: 1, required: true },
        { kind: "dj", quantity: 1, required: true },
        { kind: "catering", quantity: 2, required: true },
        { kind: "bar", quantity: 1, required: true },
        { kind: "bbq", quantity: 1, required: true },
      ],
    });
    const generated = await tools.get("venue.generate_layouts")!.execute({ strategies: ["balanced", "guest_flow", "service_first"] });
    const project = await tools.get("venue.read_project")!.execute({});
    const projectData = JSON.parse(project.content[0].text!);
    const planId = projectData.selectedLayout.id;
    const band = projectData.selectedLayout.elements.find((element: { kind: string }) => element.kind === "band");
    const transformed = await tools.get("venue.transform_elements")!.execute({ transforms: [{ elementId: band.id, scale: 1.25, rotateBy: 30, rotateXBy: 15, rotateYBy: 20 }] });
    const transformedProject = await tools.get("venue.read_project")!.execute({});
    const transformedProjectData = JSON.parse(transformedProject.content[0].text!);
    const transformedBand = transformedProjectData.selectedLayout.elements.find((element: { kind: string }) => element.kind === "band");
    const rendered = await tools.get("venue.render_scene")!.execute({ instruction: "Keep the central aisle generous and make the band feel like the visual anchor." });
    const renderedImage = rendered.content.find((item) => item.type === "image");
    const renderedMeta = JSON.parse(rendered.content.find((item) => item.type === "text")!.text!);
    const appliedFirst = await tools.get("venue.apply_image_revision")!.execute({
      imageUrl: "/renders/agent-revision-1.png",
      baseStateVersion: renderedMeta.baseStateVersion,
      instruction: renderedMeta.instruction,
      label: "Agent first pass",
    });
    const refined = await tools.get("venue.refine_scene")!.execute({ instruction: "Open the central aisle and reduce the foreground floral scale." });
    const refinedImage = refined.content.find((item) => item.type === "image");
    const refinedMeta = JSON.parse(refined.content.find((item) => item.type === "text")!.text!);
    const appliedSecond = await tools.get("venue.apply_image_revision")!.execute({
      imageUrl: "/renders/agent-revision-2.png",
      baseStateVersion: refinedMeta.baseStateVersion,
      instruction: refinedMeta.instruction,
      label: "Agent refined pass",
    });
    const captured = await tools.get("venue.capture_scene")!.execute({});
    const image = captured.content.find((item) => item.type === "image");
    const validation = await tools.get("venue.validate_layout")!.execute({ planId });
    const staged = await tools.get("venue.stage_layout")!.execute({ planId, reason: "Best capacity, guest flow, and service balance." });
    return { configured, required, generated, transformed, transformedBand, renderRequest: { isError: rendered.isError, imageLength: renderedImage?.data?.length ?? 0, usesOwnImageTool: renderedMeta.agentAction.useOwnImageTool }, appliedFirst, refineRequest: { isError: refined.isError, imageLength: refinedImage?.data?.length ?? 0, currentRevision: refinedMeta.currentRevision }, appliedSecond, capture: { isError: captured.isError, imageLength: image?.data?.length ?? 0 }, validation, staged, toolNames: [...tools.keys()] };
  });

  expect(response.configured.isError).not.toBe(true);
  expect(response.required.isError).not.toBe(true);
  expect(response.generated.isError).not.toBe(true);
  expect(response.transformed.isError).not.toBe(true);
  expect(response.renderRequest.isError).not.toBe(true);
  expect(response.renderRequest.imageLength).toBeGreaterThan(10000);
  expect(response.renderRequest.usesOwnImageTool).toBe(true);
  expect(response.appliedFirst.isError).not.toBe(true);
  expect(response.refineRequest.isError).not.toBe(true);
  expect(response.refineRequest.imageLength).toBeGreaterThan(10000);
  expect(response.refineRequest.currentRevision).toBe(1);
  expect(response.appliedSecond.isError).not.toBe(true);
  expect(response.transformedBand.rotation).toBe(30);
  expect(response.transformedBand.rotateX).toBe(15);
  expect(response.transformedBand.rotateY).toBe(20);
  expect(response.transformedBand.width).toBeCloseTo(28.75);
  expect(response.capture.isError).not.toBe(true);
  expect(response.capture.imageLength).toBeGreaterThan(10000);
  expect(response.validation.isError).not.toBe(true);
  expect(response.staged.isError).not.toBe(true);
  expect(response.toolNames).not.toContain("venue.approve_layout");
  expect(response.toolNames).toContain("venue.transform_elements");
  expect(response.toolNames).toContain("venue.render_scene");
  expect(response.toolNames).toContain("venue.refine_scene");
  await expect(page.getByRole("heading", { name: "Sunset Hall Experience" })).toBeVisible();
  await expect(page.getByText("Returned by your agent · revision 2")).toBeVisible();
  await page.getByRole("button", { name: "Plan map" }).click();
  await expect(page.locator(".layout-element")).toHaveCount(30);
  await expect(page.getByText("AI", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Human review required")).toBeVisible();
  await expect(page.getByText("Approved by you")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Export layout JSON" })).toHaveCount(0);
});
