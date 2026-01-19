export interface PageInfo {
  type: "live" | "vod" | "channel" | "other";
  streamerId: string | null;
  vodId: string | null;
}

// URL patterns:
// Live: https://www.twitch.tv/{username}
// VOD: https://www.twitch.tv/videos/{videoId}
// Channel: https://www.twitch.tv/{username}/videos (or /clips, /about, etc.)

const VOD_PATTERN = /^\/videos\/(\d+)/;
const CHANNEL_SUBPAGE_PATTERN = /^\/([a-zA-Z0-9_]+)\/(videos|clips|about|schedule)/;
const LIVE_PATTERN = /^\/([a-zA-Z0-9_]+)$/;
const EXCLUDED_PATHS = ["directory", "downloads", "jobs", "turbo", "settings", "wallet", "subscriptions"];

export function detectPage(url: string): PageInfo {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "www.twitch.tv" && parsed.hostname !== "twitch.tv") {
      return { type: "other", streamerId: null, vodId: null };
    }

    const pathname = parsed.pathname;

    // VOD page
    const vodMatch = pathname.match(VOD_PATTERN);
    if (vodMatch) {
      return { type: "vod", streamerId: null, vodId: vodMatch[1] ?? null };
    }

    // Channel subpage (videos, clips, etc.)
    const subpageMatch = pathname.match(CHANNEL_SUBPAGE_PATTERN);
    if (subpageMatch) {
      return { type: "channel", streamerId: subpageMatch[1]?.toLowerCase() ?? null, vodId: null };
    }

    // Live stream page
    const liveMatch = pathname.match(LIVE_PATTERN);
    if (liveMatch) {
      const username = liveMatch[1]?.toLowerCase();
      if (username && EXCLUDED_PATHS.includes(username)) {
        return { type: "other", streamerId: null, vodId: null };
      }
      return { type: "live", streamerId: username ?? null, vodId: null };
    }

    return { type: "other", streamerId: null, vodId: null };
  } catch {
    return { type: "other", streamerId: null, vodId: null };
  }
}
