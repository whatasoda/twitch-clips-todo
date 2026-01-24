import { describe, expect, it } from "vitest";
import { buildClipCreationUrl } from "./clip-url";

describe("buildClipCreationUrl", () => {
  it("builds correct clip creation URL", () => {
    const url = buildClipCreationUrl({
      vodId: "1234567890",
      offsetSeconds: 5445,
      broadcasterLogin: "streamer1",
    });
    expect(url).toBe(
      "https://clips.twitch.tv/create?vodID=1234567890&broadcasterLogin=streamer1&offsetSeconds=5445",
    );
  });

  it("handles zero offset", () => {
    const url = buildClipCreationUrl({
      vodId: "123",
      offsetSeconds: 0,
      broadcasterLogin: "testuser",
    });
    expect(url).toBe(
      "https://clips.twitch.tv/create?vodID=123&broadcasterLogin=testuser&offsetSeconds=0",
    );
  });

  it("handles large offset", () => {
    const url = buildClipCreationUrl({
      vodId: "123",
      offsetSeconds: 86399,
      broadcasterLogin: "channel",
    });
    expect(url).toBe(
      "https://clips.twitch.tv/create?vodID=123&broadcasterLogin=channel&offsetSeconds=86399",
    );
  });
});
