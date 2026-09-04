import { render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useSeatingStore } from "../store";
import { WebMCPTools } from "./WebMCPTools";

interface RegisteredTool {
  name: string;
  annotations?: { readOnlyHint?: boolean };
  execute: (input: unknown) => Promise<{ content: Array<{ type?: string; text?: string; data?: string; mimeType?: string }>; isError?: boolean }>;
}

const registeredTools = new Map<string, RegisteredTool>();

describe("WebMCP tool surface", () => {
  beforeEach(() => {
    registeredTools.clear();
    useSeatingStore.getState().resetDemo();
    Object.defineProperty(document, "modelContext", {
      configurable: true,
      value: {
        registerTool(tool: RegisteredTool, options: { signal: AbortSignal }) {
          registeredTools.set(tool.name, tool);
          options.signal.addEventListener("abort", () => registeredTools.delete(tool.name));
        },
      },
    });
  });

  afterEach(() => Reflect.deleteProperty(document, "modelContext"));

  it("registers fifteen focused tools and keeps approval unavailable to agents", async () => {
    const view = render(<WebMCPTools />);

    await waitFor(() => expect(registeredTools.size).toBe(15));
    expect([...registeredTools.keys()]).toEqual([
      "venue.read_project",
      "venue.capture_scene",
      "venue.load_image",
      "venue.get_edit_request",
      "venue.apply_image_revision",
      "venue.configure_event",
      "venue.set_requirements",
      "venue.generate_layouts",
      "venue.add_elements",
      "venue.transform_elements",
      "venue.remove_elements",
      "venue.render_scene",
      "venue.refine_scene",
      "venue.validate_layout",
      "venue.stage_layout",
    ]);
    expect(registeredTools.get("venue.read_project")?.annotations?.readOnlyHint).toBe(true);
    expect(registeredTools.get("venue.get_edit_request")?.annotations?.readOnlyHint).toBe(true);
    expect(registeredTools.get("venue.validate_layout")?.annotations?.readOnlyHint).toBe(true);
    expect(registeredTools.get("venue.render_scene")?.annotations?.readOnlyHint).toBe(true);
    expect(registeredTools.get("venue.refine_scene")?.annotations?.readOnlyHint).toBe(true);
    expect(registeredTools.has("venue.approve_layout")).toBe(false);

    view.unmount();
  });

  it("configures and fills the visible venue through WebMCP", async () => {
    render(<WebMCPTools />);
    await waitFor(() => expect(registeredTools.size).toBe(15));

    const configured = await registeredTools.get("venue.configure_event")!.execute({ guestCount: 180, tableCount: 23, seatsPerTable: 8 });
    const generated = await registeredTools.get("venue.generate_layouts")!.execute({ strategies: ["balanced", "service_first"] });
    const project = await registeredTools.get("venue.read_project")!.execute({});

    expect(configured.isError).not.toBe(true);
    expect(generated.isError).not.toBe(true);
    expect(project.content[0].text).toContain("Balanced Flow");
    expect(project.content[0].text).toContain("180");
    expect(useSeatingStore.getState().brief.guestCount).toBe(180);
    expect(useSeatingStore.getState().plans).toHaveLength(2);
    expect(useSeatingStore.getState().plans[0].metrics.guestCapacity).toBeGreaterThanOrEqual(180);
    expect(useSeatingStore.getState().activity[0].source).toBe("agent");
  });

  it("turns malformed agent input into an explicit error result", async () => {
    render(<WebMCPTools />);
    await waitFor(() => expect(registeredTools.size).toBe(15));

    const response = await registeredTools.get("venue.transform_elements")!.execute({ transforms: [] });

    expect(response.isError).toBe(true);
    expect(response.content[0].text).toContain("Too small");
  });

  it("hands the source image and edit brief to the calling agent without a site renderer", async () => {
    render(<WebMCPTools />);
    await waitFor(() => expect(registeredTools.size).toBe(15));
    await registeredTools.get("venue.load_image")!.execute({ imageBase64: "aW1hZ2U=", mimeType: "image/png", name: "Agent hall", width: 1200, height: 800 });
    await registeredTools.get("venue.generate_layouts")!.execute({ strategies: ["balanced"] });

    const response = await registeredTools.get("venue.render_scene")!.execute({ instruction: "Create a realistic wedding reception." });
    const metadata = JSON.parse(response.content[1].text!);

    expect(response.isError).not.toBe(true);
    expect(response.content[0]).toMatchObject({ type: "image", data: "aW1hZ2U=", mimeType: "image/png" });
    expect(metadata.agentAction).toEqual({ useOwnImageTool: true, editReturnedImage: true, thenCall: "venue.apply_image_revision" });
    expect(metadata.prompt).toContain("Create a realistic wedding reception.");
    expect(useSeatingStore.getState().render.status).toBe("idle");
  });

  it("accepts an agent-generated image revision and returns the image for inspection", async () => {
    render(<WebMCPTools />);
    await waitFor(() => expect(registeredTools.size).toBe(15));
    await registeredTools.get("venue.generate_layouts")!.execute({ strategies: ["balanced"] });
    const baseStateVersion = useSeatingStore.getState().stateVersion;

    const response = await registeredTools.get("venue.apply_image_revision")!.execute({
      imageBase64: "aW1hZ2U=",
      mimeType: "image/png",
      baseStateVersion,
      instruction: "Make the central aisle wider and the table spacing more natural.",
      label: "Wider central aisle",
    });

    expect(response.isError).not.toBe(true);
    expect(response.content[0]).toMatchObject({ type: "image", data: "aW1hZ2U=", mimeType: "image/png" });
    expect(response.content[1].text).toContain("Wider central aisle");
    expect(useSeatingStore.getState().render).toMatchObject({ mode: "agent", revision: 1, status: "complete" });
  });

  it("rejects an image revision produced against an outdated project state", async () => {
    render(<WebMCPTools />);
    await waitFor(() => expect(registeredTools.size).toBe(15));
    await registeredTools.get("venue.generate_layouts")!.execute({ strategies: ["balanced"] });
    const oldVersion = useSeatingStore.getState().stateVersion;
    await registeredTools.get("venue.configure_event")!.execute({ guestCount: 180 });

    const response = await registeredTools.get("venue.apply_image_revision")!.execute({
      imageBase64: "aW1hZ2U=",
      mimeType: "image/png",
      baseStateVersion: oldVersion,
      instruction: "Apply an old render.",
    });

    expect(response.isError).toBe(true);
    expect(response.content[0].text).toContain("STALE_IMAGE_REVISION");
  });
});
