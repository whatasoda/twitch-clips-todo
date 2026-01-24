import { describe, expect, it } from "vitest";
import { formatTimestamp, parseTimeString, parseTwitchDuration } from "./timestamp-parser";

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

describe("parseTwitchDuration", () => {
  it("parses full duration (hours, minutes, seconds)", () => {
    expect(parseTwitchDuration("3h45m20s")).toBe(13520);
  });

  it("parses hours only", () => {
    expect(parseTwitchDuration("2h")).toBe(7200);
  });

  it("parses minutes only", () => {
    expect(parseTwitchDuration("30m")).toBe(1800);
  });

  it("parses seconds only", () => {
    expect(parseTwitchDuration("45s")).toBe(45);
  });

  it("parses minutes and seconds", () => {
    expect(parseTwitchDuration("30m15s")).toBe(1815);
  });

  it("parses hours and minutes", () => {
    expect(parseTwitchDuration("1h30m")).toBe(5400);
  });

  it("parses hours and seconds", () => {
    expect(parseTwitchDuration("1h30s")).toBe(3630);
  });

  it("returns 0 for empty string", () => {
    expect(parseTwitchDuration("")).toBe(0);
  });

  it("returns 0 for invalid format", () => {
    expect(parseTwitchDuration("invalid")).toBe(0);
  });
});
