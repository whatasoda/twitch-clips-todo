import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

vi.stubGlobal("chrome", {
  i18n: { getMessage: (key: string) => key },
});

vi.mock("./messaging", () => ({
  checkAuthStatus: vi.fn(),
  createRecord: vi.fn(),
  getVodMetadataFromApi: vi.fn(),
}));

vi.mock("./providers", () => ({
  getBroadcastId: vi.fn(),
  getLiveTimestamp: vi.fn(),
  getStreamerWithFallback: vi.fn(),
  getVodTimestamp: vi.fn(),
}));

vi.mock("./ui", () => ({
  showMemoInput: vi.fn(),
  showToast: vi.fn(),
}));

import type { PageInfo } from "../core/twitch";
import { checkAuthStatus, createRecord, getVodMetadataFromApi } from "./messaging";
import {
  getBroadcastId,
  getLiveTimestamp,
  getStreamerWithFallback,
  getVodTimestamp,
} from "./providers";
import { createRecordHandler } from "./record-handler";
import { showMemoInput, showToast } from "./ui";

function getMemoInputCalls(mock: Mock) {
  const calls = mock.mock.calls[0];
  if (!calls) throw new Error("showMemoInput was not called");
  return {
    onSave: calls[0] as (memo: string) => Promise<void>,
    onCancel: calls[1] as () => void,
    readyPromise: calls[2] as Promise<void>,
  };
}

function createDeps() {
  return {
    getCurrentPageInfo: vi.fn<() => PageInfo>(),
    onRecordComplete: vi.fn(),
    onOpenPopup: vi.fn(),
  };
}

function setupAuthenticated() {
  (checkAuthStatus as Mock).mockResolvedValue({ isAuthenticated: true });
}

describe("createRecordHandler", () => {
  let deps: ReturnType<typeof createDeps>;

  beforeEach(() => {
    vi.clearAllMocks();
    deps = createDeps();
  });

  describe("handleRecord - authentication", () => {
    it("shows toast and opens popup when not authenticated", async () => {
      (checkAuthStatus as Mock).mockResolvedValue({ isAuthenticated: false });

      const { handleRecord } = createRecordHandler(deps);
      await handleRecord();

      expect(showToast).toHaveBeenCalledWith("toast_authRequired", "info");
      expect(deps.onOpenPopup).toHaveBeenCalled();
      expect(showMemoInput).not.toHaveBeenCalled();
    });
  });

  describe("handleRecord - page type", () => {
    it("shows toast when page is not live or vod", async () => {
      setupAuthenticated();
      deps.getCurrentPageInfo.mockReturnValue({
        type: "channel",
        streamerId: "test",
        vodId: null,
      });

      const { handleRecord } = createRecordHandler(deps);
      await handleRecord();

      expect(showToast).toHaveBeenCalledWith("toast_notAvailable", "info");
      expect(showMemoInput).not.toHaveBeenCalled();
    });
  });

  describe("handleRecord - live stream", () => {
    it("fetches live data and shows memo input", async () => {
      setupAuthenticated();
      deps.getCurrentPageInfo.mockReturnValue({
        type: "live",
        streamerId: "streamer1",
        vodId: null,
      });
      (getLiveTimestamp as Mock).mockResolvedValue({ seconds: 300, source: "api" });
      (getBroadcastId as Mock).mockResolvedValue({ broadcastId: "bc123", source: "api" });
      (getStreamerWithFallback as Mock).mockResolvedValue({
        displayName: "Streamer One",
        login: "streamer1",
      });
      (createRecord as Mock).mockResolvedValue({ id: "r1" });

      const { handleRecord } = createRecordHandler(deps);
      await handleRecord();

      expect(showMemoInput).toHaveBeenCalled();

      // Simulate memo submission
      const { onSave } = getMemoInputCalls(showMemoInput as Mock);
      await onSave("my memo");

      expect(createRecord).toHaveBeenCalledWith({
        streamerId: "streamer1",
        streamerName: "Streamer One",
        timestampSeconds: 300,
        sourceType: "live",
        vodId: null,
        broadcastId: "bc123",
        memo: "my memo",
      });
      expect(deps.onRecordComplete).toHaveBeenCalled();
    });
  });

  describe("handleRecord - VOD", () => {
    it("fetches VOD metadata for streamer info and shows memo input", async () => {
      setupAuthenticated();
      deps.getCurrentPageInfo.mockReturnValue({
        type: "vod",
        streamerId: null,
        vodId: "v456",
      });
      (getVodTimestamp as Mock).mockResolvedValue({ seconds: 120, source: "dom" });
      (getVodMetadataFromApi as Mock).mockResolvedValue({
        vodId: "v456",
        streamerId: "vod_streamer",
        streamerName: "VOD Streamer",
        title: "Test VOD",
        startedAt: "2025-01-01T00:00:00Z",
        durationSeconds: 3600,
        streamId: "stream789",
      });
      (createRecord as Mock).mockResolvedValue({ id: "r2" });

      const { handleRecord } = createRecordHandler(deps);
      await handleRecord();

      expect(getVodMetadataFromApi).toHaveBeenCalledWith("v456");
      expect(showMemoInput).toHaveBeenCalled();

      // getStreamerWithFallback should not be called since VOD metadata provides streamer info
      expect(getStreamerWithFallback).not.toHaveBeenCalled();

      // Simulate memo submission
      const { onSave } = getMemoInputCalls(showMemoInput as Mock);
      await onSave("vod memo");

      expect(createRecord).toHaveBeenCalledWith({
        streamerId: "vod_streamer",
        streamerName: "VOD Streamer",
        timestampSeconds: 120,
        sourceType: "vod",
        vodId: "v456",
        broadcastId: "stream789",
        memo: "vod memo",
      });
    });

    it("throws when VOD metadata API fails", async () => {
      setupAuthenticated();
      deps.getCurrentPageInfo.mockReturnValue({
        type: "vod",
        streamerId: null,
        vodId: "v999",
      });
      (getVodTimestamp as Mock).mockResolvedValue({ seconds: 60, source: "dom" });
      (getVodMetadataFromApi as Mock).mockResolvedValue(null);
      (getStreamerWithFallback as Mock).mockResolvedValue(null);

      const { handleRecord } = createRecordHandler(deps);
      await handleRecord();

      expect(showMemoInput).toHaveBeenCalled();

      const { onSave, readyPromise } = getMemoInputCalls(showMemoInput as Mock);

      // Catch the readyPromise to prevent unhandled rejection
      await readyPromise.catch(() => {});

      // Simulate memo submission — should fail because streamer info is unavailable
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      await onSave("memo");
      consoleSpy.mockRestore();

      expect(showToast).toHaveBeenCalledWith("toast_recordFailed", "error");
    });

    it("throws when VOD timestamp is unavailable", async () => {
      setupAuthenticated();
      deps.getCurrentPageInfo.mockReturnValue({
        type: "vod",
        streamerId: null,
        vodId: "v111",
      });
      (getVodTimestamp as Mock).mockResolvedValue(null);
      (getVodMetadataFromApi as Mock).mockResolvedValue({
        vodId: "v111",
        streamerId: "s1",
        streamerName: "S1",
        title: "T",
        startedAt: "2025-01-01T00:00:00Z",
        durationSeconds: 100,
        streamId: null,
      });

      const { handleRecord } = createRecordHandler(deps);
      await handleRecord();

      expect(showMemoInput).toHaveBeenCalled();

      const { onSave, readyPromise } = getMemoInputCalls(showMemoInput as Mock);

      // Catch the readyPromise to prevent unhandled rejection
      await readyPromise.catch(() => {});

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      await onSave("memo");
      consoleSpy.mockRestore();

      expect(showToast).toHaveBeenCalledWith("toast_recordFailed", "error");
    });
  });
});
