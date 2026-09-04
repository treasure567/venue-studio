import { expect, test } from "@playwright/test";

test("capture judge-facing Venue Studio states", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.addInitScript(() => {
    const tools = new Map();
    Object.defineProperty(document, "modelContext", {
      configurable: true,
      value: {
        registerTool(tool: { name: string }, options: { signal?: AbortSignal }) {
          tools.set(tool.name, tool);
          Object.assign(window, { __venueTools: tools });
          options.signal?.addEventListener("abort", () => tools.delete(tool.name));
        },
      },
    });
  });
  await page.goto("/");

  await page.evaluate(async () => {
    const tools = (window as any).__venueTools as Map<
      string,
      { execute: (input: unknown) => Promise<{ content: Array<{ text?: string }> }> }
    >;
    const call = async (name: string, input: unknown = {}) => {
      const result = await tools.get(name)!.execute(input);
      const text = result.content.find((item) => item.text)?.text;
      return text ? JSON.parse(text) : {};
    };
    await call("venue.configure_event", {
      name: "Golden Hour Garden Reception",
      eventType: "wedding",
      guestCount: 160,
      tableCount: 20,
      seatsPerTable: 8,
      notes: "A luxurious reception with a wide central aisle and balanced service zones.",
    });
    await call("venue.generate_layouts", {
      strategies: ["balanced", "guest_flow", "service_first"],
    });
    const request = await tools.get("venue.render_scene")!.execute({
      instruction: "Make the central aisle generous and preserve the warm architectural light.",
    });
    const metadata = JSON.parse(request.content.find((item) => item.text)!.text!);
    await call("venue.apply_image_revision", {
      imageUrl: "/renders/agent-revision-2.png",
      baseStateVersion: metadata.baseStateVersion,
      instruction: metadata.instruction,
      label: "Agent refined reception",
    });
  });

  await page.screenshot({
    path: "docs/submission/assets/venue-studio-photoreal.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.screenshot({
    path: "docs/submission/assets/venue-studio-thumbnail.png",
  });
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.getByRole("button", { name: "Plan map" }).click();
  await page.screenshot({
    path: "docs/submission/assets/venue-studio-plan-map.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Connect agent" }).click();
  await expect(page.getByRole("dialog", { name: "Describe it. Your agent renders it." })).toBeVisible();
  await page.waitForTimeout(500);
  await page.screenshot({
    path: "docs/submission/assets/venue-studio-agent-handoff.png",
    fullPage: true,
  });
});
