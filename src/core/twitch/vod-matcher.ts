import type { Record } from "../record";

export interface VodInfo {
  vodId: string;
  streamerId: string;
  startedAt: Date;
  durationSeconds: number;
}

// Check if a live record falls within a VOD's timeframe
export function matchRecordToVod(record: Record, vod: VodInfo): boolean {
  if (record.sourceType !== "live") return false;
  if (record.streamerId !== vod.streamerId) return false;

  const recordTime = new Date(record.recordedAt);
  const vodEndTime = new Date(vod.startedAt.getTime() + vod.durationSeconds * 1000);

  return recordTime >= vod.startedAt && recordTime <= vodEndTime;
}

// Calculate the offset in the VOD for a live record
export function calculateVodOffset(record: Record, vodStartedAt: Date): number {
  const recordTime = new Date(record.recordedAt);
  const offsetMs = recordTime.getTime() - vodStartedAt.getTime();
  return Math.max(0, Math.floor(offsetMs / 1000));
}

// Link multiple records to a VOD
export function linkRecordsToVod(
  records: Record[],
  vod: VodInfo,
): Array<{ record: Record; vodOffset: number }> {
  return records
    .filter((r) => matchRecordToVod(r, vod))
    .map((record) => ({
      record,
      vodOffset: calculateVodOffset(record, vod.startedAt),
    }));
}
