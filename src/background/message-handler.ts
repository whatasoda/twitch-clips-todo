import type { LinkingService, RecordService } from "../services";
import type {
  CreateRecordPayload,
  LinkVodPayload,
  MessageResponse,
  MessageToBackground,
} from "../shared/types";

export interface MessageHandlerDeps {
  recordService: RecordService;
  linkingService: LinkingService;
}

export async function handleMessage(
  message: MessageToBackground,
  deps: MessageHandlerDeps,
): Promise<MessageResponse<unknown>> {
  const { recordService, linkingService } = deps;

  try {
    switch (message.type) {
      case "CREATE_RECORD": {
        const record = await recordService.create(message.payload as CreateRecordPayload);
        return { success: true, data: record };
      }

      case "GET_RECORDS": {
        const payload = message.payload as { streamerId?: string } | undefined;
        const records = payload?.streamerId
          ? await recordService.getByStreamerId(payload.streamerId)
          : await recordService.getAll();
        return { success: true, data: records };
      }

      case "UPDATE_MEMO": {
        const { id, memo } = message.payload as { id: string; memo: string };
        const record = await recordService.updateMemo(id, memo);
        return { success: true, data: record };
      }

      case "MARK_COMPLETED": {
        const { id } = message.payload as { id: string };
        const record = await recordService.markCompleted(id);
        return { success: true, data: record };
      }

      case "DELETE_RECORD": {
        const { id } = message.payload as { id: string };
        await recordService.delete(id);
        return { success: true, data: null };
      }

      case "LINK_VOD": {
        const records = await linkingService.linkVod(message.payload as LinkVodPayload);
        return { success: true, data: records };
      }

      case "GET_PENDING_COUNT": {
        const { streamerId } = message.payload as { streamerId: string };
        const count = await recordService.getPendingCount(streamerId);
        return { success: true, data: count };
      }

      case "OPEN_SIDE_PANEL": {
        // This is handled directly in index.ts
        return { success: true, data: null };
      }

      default:
        return { success: false, error: "Unknown message type" };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
