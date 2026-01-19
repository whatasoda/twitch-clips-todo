import { setupNavigationListener, getCurrentPageInfo } from "./detector";
import { getPlayerTimestamp, getStreamerNameFromPage, getVodMetadata } from "./player";
import { createRecord, updateMemo, getPendingCount, linkVod, openSidePanel } from "./messaging";
import {
  injectRecordButton,
  removeRecordButton,
  showMemoInput,
  hideMemoInput,
  showToast,
  showIndicator,
  hideIndicator,
} from "./ui";
import type { PageInfo } from "../core/twitch";

let pendingRecordId: string | null = null;

async function handleRecord(): Promise<void> {
  const pageInfo = getCurrentPageInfo();
  if (pageInfo.type !== "live" && pageInfo.type !== "vod") {
    showToast("Can only record on stream or VOD pages", "error");
    return;
  }

  const timestamp = getPlayerTimestamp();
  if (timestamp === null) {
    showToast("Could not get timestamp", "error");
    return;
  }

  const streamerName = getStreamerNameFromPage();
  if (!streamerName) {
    showToast("Could not get streamer name", "error");
    return;
  }

  try {
    const record = await createRecord({
      streamerId: pageInfo.streamerId ?? streamerName.toLowerCase(),
      streamerName,
      timestampSeconds: timestamp,
      sourceType: pageInfo.type as "live" | "vod",
      vodId: pageInfo.vodId,
    });

    pendingRecordId = record.id;
    showMemoInput(
      async (memo) => {
        if (memo && pendingRecordId) {
          await updateMemo(pendingRecordId, memo);
        }
        showToast("Moment recorded!", "success");
        pendingRecordId = null;
        refreshIndicator();
      },
      () => {
        showToast("Moment recorded!", "success");
        pendingRecordId = null;
        refreshIndicator();
      }
    );
  } catch (error) {
    showToast("Failed to record moment", "error");
    console.error("[Twitch Clip Todo]", error);
  }
}

async function refreshIndicator(): Promise<void> {
  const pageInfo = getCurrentPageInfo();
  if (!pageInfo.streamerId) return;

  try {
    const count = await getPendingCount(pageInfo.streamerId);
    if (count > 0) {
      showIndicator(count, () => {
        openSidePanel().catch(console.error);
      });
    } else {
      hideIndicator();
    }
  } catch (error) {
    console.error("[Twitch Clip Todo] Failed to refresh indicator:", error);
  }
}

async function handlePageChange(pageInfo: PageInfo): Promise<void> {
  // Clean up UI
  removeRecordButton();
  hideIndicator();
  hideMemoInput();

  if (pageInfo.type === "live" || pageInfo.type === "vod") {
    // Inject record button
    injectRecordButton(handleRecord);

    // Show indicator if there are pending records
    if (pageInfo.streamerId) {
      try {
        const count = await getPendingCount(pageInfo.streamerId);
        if (count > 0) {
          showIndicator(count, () => {
            openSidePanel().catch(console.error);
          });
        }
      } catch (error) {
        console.error("[Twitch Clip Todo] Failed to get pending count:", error);
      }
    }

    // Auto-link VODs
    if (pageInfo.type === "vod") {
      const vodMeta = getVodMetadata();
      if (vodMeta && vodMeta.streamerId) {
        try {
          const linked = await linkVod({
            vodId: vodMeta.vodId,
            streamerId: vodMeta.streamerId,
            startedAt: vodMeta.startedAt ?? new Date().toISOString(),
            durationSeconds: vodMeta.durationSeconds ?? 0,
          });
          if (linked.length > 0) {
            showToast(`Linked ${linked.length} record(s) to this VOD`, "info");
          }
        } catch (error) {
          console.error("[Twitch Clip Todo] VOD linking failed:", error);
        }
      }
    }
  } else if (pageInfo.type === "channel" && pageInfo.streamerId) {
    // Show indicator on channel pages
    try {
      const count = await getPendingCount(pageInfo.streamerId);
      if (count > 0) {
        showIndicator(count, () => {
          openSidePanel().catch(console.error);
        });
      }
    } catch (error) {
      console.error("[Twitch Clip Todo] Failed to get pending count:", error);
    }
  }
}

// Listen for keyboard shortcut trigger from background
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "TRIGGER_RECORD") {
    handleRecord();
  }
});

// Initialize
setupNavigationListener(handlePageChange);

console.log("[Twitch Clip Todo] Content script initialized");
