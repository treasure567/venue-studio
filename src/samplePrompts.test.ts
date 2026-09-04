import { describe, expect, it } from "vitest";
import { samplePrompts } from "./samplePrompts";

describe("sample prompt library", () => {
  it("contains ten distinct, agent-ready briefs and ten showcase renders", () => {
    expect(samplePrompts).toHaveLength(10);
    expect(new Set(samplePrompts.map((sample) => sample.id)).size).toBe(10);
    expect(samplePrompts.filter((sample) => sample.preview)).toHaveLength(10);
    expect(samplePrompts.filter((sample) => sample.source.url)).toHaveLength(7);
    expect(samplePrompts.every((sample) => sample.prompt.includes("capture") || sample.prompt.includes("Capture"))).toBe(true);
  });
});
