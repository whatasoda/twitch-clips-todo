import { describe, it, expect } from "vitest";
import { parseTimeString, formatTimestamp } from "./timestamp-parser";

describe("parseTimeString", () => {
  it("parses HH:MM:SS format", () => {
    expect(parseTimeString("01:30:45")).toBe(5445);
  });

  it("parses MM:SS format", () => {
    expect(parseTimeString("05:30")).toBe(330);
  });

  it("parses zero values", () => {
    expect(parseTimeString("00:00:00")).toBe(0);
    expect(parseTimeString("00:00")).toBe(0);
  });

  it("handles single digit values", () => {
    expect(parseTimeString("1:2:3")).toBe(3723);
  });
});

describe("formatTimestamp", () => {
  it("formats seconds to HH:MM:SS", () => {
    expect(formatTimestamp(5445)).toBe("01:30:45");
  });

  it("pads single digits", () => {
    expect(formatTimestamp(61)).toBe("00:01:01");
  });

  it("formats zero", () => {
    expect(formatTimestamp(0)).toBe("00:00:00");
  });

  it("formats large values", () => {
    expect(formatTimestamp(86399)).toBe("23:59:59");
  });
});
