import { describe, expect, it } from "vitest";
import { detectPage } from "./page-detector";

describe("detectPage", () => {
  it("detects live stream page", () => {
    const result = detectPage("https://www.twitch.tv/streamer123");
    expect(result).toEqual({ type: "live", streamerId: "streamer123", vodId: null });
  });

  it("detects live stream page with different casing", () => {
    const result = detectPage("https://www.twitch.tv/Streamer123");
    expect(result).toEqual({ type: "live", streamerId: "streamer123", vodId: null });
  });

  it("detects VOD page", () => {
    const result = detectPage("https://www.twitch.tv/videos/1234567890");
    expect(result).toEqual({ type: "vod", streamerId: null, vodId: "1234567890" });
  });

  it("detects channel subpage (videos)", () => {
    const result = detectPage("https://www.twitch.tv/streamer123/videos");
    expect(result).toEqual({ type: "channel", streamerId: "streamer123", vodId: null });
  });

  it("detects channel subpage (clips)", () => {
    const result = detectPage("https://www.twitch.tv/streamer123/clips");
    expect(result).toEqual({ type: "channel", streamerId: "streamer123", vodId: null });
  });

  it("returns other for excluded paths", () => {
    const result = detectPage("https://www.twitch.tv/directory");
    expect(result.type).toBe("other");
  });

  it("returns other for settings path", () => {
    const result = detectPage("https://www.twitch.tv/settings");
    expect(result.type).toBe("other");
  });

  it("handles non-twitch URLs", () => {
    const result = detectPage("https://youtube.com/watch?v=123");
    expect(result.type).toBe("other");
  });

  it("handles invalid URLs", () => {
    const result = detectPage("not-a-url");
    expect(result.type).toBe("other");
  });

  it("handles twitch.tv without www", () => {
    const result = detectPage("https://twitch.tv/streamer123");
    expect(result).toEqual({ type: "live", streamerId: "streamer123", vodId: null });
  });
});
