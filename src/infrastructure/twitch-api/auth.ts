import { STORAGE_KEYS, TWITCH_CLIENT_ID } from "../../shared/constants";
import type { DeviceCodeResponse, TwitchAuthToken } from "./types";

export interface TwitchAuthAPI {
  // Device Code Flow
  startDeviceAuth(): Promise<DeviceCodeResponse>;
  pollForToken(deviceCode: string, interval: number): Promise<TwitchAuthToken>;
  cancelPolling(): void;

  // Token management
  refreshToken(refreshToken: string): Promise<TwitchAuthToken>;
  revokeToken(token: string): Promise<void>;
  getStoredToken(): Promise<TwitchAuthToken | null>;
  storeToken(token: TwitchAuthToken): Promise<void>;
  clearToken(): Promise<void>;
  isTokenExpired(token: TwitchAuthToken): boolean;
}

export function createTwitchAuthAPI(): TwitchAuthAPI {
  let pollingAbortController: AbortController | null = null;

  return {
    async startDeviceAuth(): Promise<DeviceCodeResponse> {
      const response = await fetch("https://id.twitch.tv/oauth2/device", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: TWITCH_CLIENT_ID,
          scopes: "", // Public endpoints only, no scope needed
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Device auth failed: ${errorData.message ?? response.statusText}`);
      }

      return response.json();
    },

    async pollForToken(deviceCode: string, interval: number): Promise<TwitchAuthToken> {
      pollingAbortController = new AbortController();
      const signal = pollingAbortController.signal;

      const pollInterval = Math.max(interval, 5) * 1000; // At least 5 seconds

      while (!signal.aborted) {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(resolve, pollInterval);
          signal.addEventListener("abort", () => {
            clearTimeout(timeout);
            reject(new DOMException("Polling cancelled", "AbortError"));
          });
        });

        if (signal.aborted) {
          throw new DOMException("Polling cancelled", "AbortError");
        }

        const response = await fetch("https://id.twitch.tv/oauth2/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: TWITCH_CLIENT_ID,
            device_code: deviceCode,
            grant_type: "urn:ietf:params:oauth:grant-type:device_code",
          }),
          signal,
        });

        if (response.ok) {
          const tokenData = await response.json();
          const token: TwitchAuthToken = {
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_in: tokenData.expires_in,
            scope: tokenData.scope ?? [],
            token_type: tokenData.token_type,
            obtained_at: Date.now(),
          };

          await this.storeToken(token);
          pollingAbortController = null;
          return token;
        }

        const errorData = await response.json();

        // Handle specific error cases
        if (errorData.message === "authorization_pending") {
          // User hasn't authorized yet, continue polling
          continue;
        }

        if (errorData.message === "slow_down") {
          // Need to slow down polling
          await new Promise((resolve) => setTimeout(resolve, 5000));
          continue;
        }

        if (errorData.message === "expired_token") {
          pollingAbortController = null;
          throw new Error("Device code expired. Please start again.");
        }

        if (errorData.message === "access_denied") {
          pollingAbortController = null;
          throw new Error("Authorization denied by user.");
        }

        // Unknown error
        pollingAbortController = null;
        throw new Error(`Token polling failed: ${errorData.message ?? response.statusText}`);
      }

      throw new DOMException("Polling cancelled", "AbortError");
    },

    cancelPolling(): void {
      if (pollingAbortController) {
        pollingAbortController.abort();
        pollingAbortController = null;
      }
    },

    async refreshToken(refreshToken: string): Promise<TwitchAuthToken> {
      const response = await fetch("https://id.twitch.tv/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: TWITCH_CLIENT_ID,
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Token refresh failed: ${errorData.message ?? response.statusText}`);
      }

      const tokenData = await response.json();
      const token: TwitchAuthToken = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        scope: tokenData.scope ?? [],
        token_type: tokenData.token_type,
        obtained_at: Date.now(),
      };

      await this.storeToken(token);
      return token;
    },

    async revokeToken(token: string): Promise<void> {
      await fetch("https://id.twitch.tv/oauth2/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: TWITCH_CLIENT_ID,
          token,
        }),
      });
    },

    async getStoredToken(): Promise<TwitchAuthToken | null> {
      const result = await chrome.storage.local.get(STORAGE_KEYS.TWITCH_AUTH);
      return (result[STORAGE_KEYS.TWITCH_AUTH] as TwitchAuthToken) ?? null;
    },

    async storeToken(token: TwitchAuthToken): Promise<void> {
      await chrome.storage.local.set({ [STORAGE_KEYS.TWITCH_AUTH]: token });
    },

    async clearToken(): Promise<void> {
      await chrome.storage.local.remove(STORAGE_KEYS.TWITCH_AUTH);
    },

    isTokenExpired(token: TwitchAuthToken): boolean {
      const expiresAt = token.obtained_at + token.expires_in * 1000;
      // Consider expired if less than 5 minutes remaining
      return Date.now() > expiresAt - 5 * 60 * 1000;
    },
  };
}
