import { describe, expect, it } from "vitest";
import { buildClipCreationUrl } from "./clip-url";

describe("buildClipCreationUrl", () => {
  it("builds correct URL with time parameter", () => {
    const url = buildClipCreationUrl({ vodId: "1234567890", offsetSeconds: 5445 });
    expect(url).toBe("https://www.twitch.tv/videos/1234567890?t=1h30m45s");
  });

  it("handles zero offset", () => {
    const url = buildClipCreationUrl({ vodId: "123", offsetSeconds: 0 });
    expect(url).toBe("https://www.twitch.tv/videos/123?t=0h0m0s");
  });

  it("handles large offset", () => {
    const url = buildClipCreationUrl({ vodId: "123", offsetSeconds: 86399 });
    expect(url).toBe("https://www.twitch.tv/videos/123?t=23h59m59s");
  });

  it("handles minutes only", () => {
    const url = buildClipCreationUrl({ vodId: "123", offsetSeconds: 330 });
    expect(url).toBe("https://www.twitch.tv/videos/123?t=0h5m30s");
  });
});
