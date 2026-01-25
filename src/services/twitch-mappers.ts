import { parseTwitchDuration } from "../core/twitch/timestamp-parser";
import type { TwitchStream, TwitchUser, TwitchVideo } from "../infrastructure/twitch-api";

export interface StreamerInfo {
  id: string;
  login: string;
  displayName: string;
  profileImageUrl: string | null;
}

export interface VodMetadata {
  vodId: string;
  streamerId: string;
  streamerName: string;
  title: string;
  startedAt: string; // ISO 8601
  durationSeconds: number;
  streamId: string | null;
}

export interface LiveStreamInfo {
  streamId: string;
  userId: string;
  userLogin: string;
  userName: string;
  startedAt: string; // ISO 8601
  title: string;
  gameName: string;
}

export function mapUserToStreamerInfo(user: TwitchUser): StreamerInfo {
  return {
    id: user.id,
    login: user.login,
    displayName: user.display_name,
    profileImageUrl: user.profile_image_url || null,
  };
}

export function mapVideoToVodMetadata(video: TwitchVideo): VodMetadata {
  return {
    vodId: video.id,
    streamerId: video.user_login,
    streamerName: video.user_name,
    title: video.title,
    startedAt: video.created_at,
    durationSeconds: parseTwitchDuration(video.duration),
    streamId: video.stream_id,
  };
}

export function mapStreamToLiveStreamInfo(stream: TwitchStream): LiveStreamInfo {
  return {
    streamId: stream.id,
    userId: stream.user_id,
    userLogin: stream.user_login,
    userName: stream.user_name,
    startedAt: stream.started_at,
    title: stream.title,
    gameName: stream.game_name,
  };
}
