import { getStreamerInfo } from "../messaging";
import type { Provider } from "./types";

export interface StreamerResult {
  displayName: string;
  login: string;
}

/**
 * API provider for streamer info.
 */
export function createApiStreamerProvider(login: string): Provider<StreamerResult> {
  return {
    name: "api-streamer",
    async get(): Promise<StreamerResult | null> {
      const info = await getStreamerInfo(login);
      if (!info) return null;

      return {
        displayName: info.displayName,
        login: info.login,
      };
    },
  };
}

/**
 * Get streamer info via API.
 * Requires authentication.
 */
export async function getStreamerWithFallback(
  loginFromUrl: string | null,
): Promise<StreamerResult | null> {
  if (!loginFromUrl) return null;
  return createApiStreamerProvider(loginFromUrl).get();
}
