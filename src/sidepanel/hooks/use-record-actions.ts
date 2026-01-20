import type { Record } from "../../core/record";
import { buildClipCreationUrl } from "../../core/twitch";
import type { MessageResponse } from "../../shared/types";

export function useRecordActions() {
  async function updateMemo(id: string, memo: string): Promise<Record> {
    const response = await chrome.runtime.sendMessage<unknown, MessageResponse<Record>>({
      type: "UPDATE_MEMO",
      payload: { id, memo },
    });
    if (!response.success) throw new Error(response.error);
    return response.data;
  }

  async function markCompleted(id: string): Promise<Record> {
    const response = await chrome.runtime.sendMessage<unknown, MessageResponse<Record>>({
      type: "MARK_COMPLETED",
      payload: { id },
    });
    if (!response.success) throw new Error(response.error);
    return response.data;
  }

  async function deleteRecord(id: string): Promise<void> {
    const response = await chrome.runtime.sendMessage<unknown, MessageResponse<null>>({
      type: "DELETE_RECORD",
      payload: { id },
    });
    if (!response.success) throw new Error(response.error);
  }

  async function openClipCreation(record: Record): Promise<void> {
    if (!record.vodId) {
      throw new Error("Record is not linked to a VOD");
    }

    const url = buildClipCreationUrl({
      vodId: record.vodId,
      offsetSeconds: record.timestampSeconds,
    });

    await chrome.tabs.create({ url });
    await markCompleted(record.id);
  }

  return {
    updateMemo,
    markCompleted,
    deleteRecord,
    openClipCreation,
  };
}
