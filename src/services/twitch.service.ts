import type { ChromeStorageAPI } from "../infrastructure/chrome/types";
import type {
  DeviceCodeResponse,
  TwitchApiClient,
  TwitchAuthAPI,
  TwitchAuthToken,
  TwitchStream,
  TwitchUser,
  TwitchVideo,
} from "../infrastructure/twitch-api";
import { parseTwitchDuration } from "../core/twitch/timestamp-parser";
import {
  createStreamsEndpoint,
  createUsersEndpoint,
  createVideosEndpoint,
  type StreamsEndpoint,
  type UsersEndpoint,
  type VideosEndpoint,
} from "../infrastructure/twitch-api/endpoints";
import { CACHE_TTL, STORAGE_KEYS } from "../shared/constants";

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

export interface TwitchServiceDeps {
  auth: TwitchAuthAPI;
  client: TwitchApiClient;
  storage: ChromeStorageAPI;
}

export interface TwitchService {
  isAuthenticated(): Promise<boolean>;
  startDeviceAuth(): Promise<DeviceCodeResponse>;
  pollForToken(deviceCode: string, interval: number): Promise<TwitchAuthToken>;
  cancelAuth(): void;
  logout(): Promise<void>;
  getStreamerInfo(login: string): Promise<StreamerInfo | null>;
  getVodMetadata(vodId: string): Promise<VodMetadata | null>;
  getCurrentStream(login: string): Promise<LiveStreamInfo | null>;
  // Cached versions
  getCurrentStreamCached(login: string): Promise<LiveStreamInfo | null>;
  invalidateStreamCache(login: string): Promise<void>;
  // VOD discovery
  getRecentVodsByUserId(userId: string, limit?: number): Promise<VodMetadata[]>;
  findVodByStreamId(userId: string, streamId: string): Promise<VodMetadata | null>;
}

// Cache entry type
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

// Persistent cache types
interface StreamCache {
  [login: string]: CacheEntry<LiveStreamInfo | null>;
}

interface VodCache {
  [userId: string]: CacheEntry<VodMetadata[]>;
}

export function createTwitchService(deps: TwitchServiceDeps): TwitchService {
  const { auth, client, storage } = deps;

  const usersEndpoint: UsersEndpoint = createUsersEndpoint(client);
  const videosEndpoint: VideosEndpoint = createVideosEndpoint(client);
  const streamsEndpoint: StreamsEndpoint = createStreamsEndpoint(client);

  // In-memory caches (fast, but cleared on service worker restart)
  const userMemCache = new Map<string, CacheEntry<StreamerInfo>>();
  const streamMemCache = new Map<string, CacheEntry<LiveStreamInfo | null>>();
  const vodMemCache = new Map<string, CacheEntry<VodMetadata[]>>();

  // Helper to get persistent stream cache
  async function getPersistentStreamCache(): Promise<StreamCache> {
    return (await storage.get<StreamCache>(STORAGE_KEYS.STREAM_CACHE)) ?? {};
  }

  async function updatePersistentStreamCache(
    login: string,
    entry: CacheEntry<LiveStreamInfo | null>,
  ): Promise<void> {
    const cache = await getPersistentStreamCache();
    cache[login] = entry;
    await storage.set(STORAGE_KEYS.STREAM_CACHE, cache);
  }

  // Helper to get persistent VOD cache
  async function getPersistentVodCache(): Promise<VodCache> {
    return (await storage.get<VodCache>(STORAGE_KEYS.VOD_CACHE)) ?? {};
  }

  async function updatePersistentVodCache(
    userId: string,
    entry: CacheEntry<VodMetadata[]>,
  ): Promise<void> {
    const cache = await getPersistentVodCache();
    cache[userId] = entry;
    await storage.set(STORAGE_KEYS.VOD_CACHE, cache);
  }

  function mapUserToStreamerInfo(user: TwitchUser): StreamerInfo {
    return {
      id: user.id,
      login: user.login,
      displayName: user.display_name,
      profileImageUrl: user.profile_image_url || null,
    };
  }

  function mapVideoToVodMetadata(video: TwitchVideo): VodMetadata {
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

  function mapStreamToLiveStreamInfo(stream: TwitchStream): LiveStreamInfo {
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

  return {
    async isAuthenticated(): Promise<boolean> {
      return client.isAuthenticated();
    },

    async startDeviceAuth(): Promise<DeviceCodeResponse> {
      return auth.startDeviceAuth();
    },

    async pollForToken(deviceCode: string, interval: number): Promise<TwitchAuthToken> {
      return auth.pollForToken(deviceCode, interval);
    },

    cancelAuth(): void {
      auth.cancelPolling();
    },

    async logout(): Promise<void> {
      const token = await auth.getStoredToken();
      if (token) {
        await auth.revokeToken(token.access_token);
        await auth.clearToken();
      }
    },

    async getStreamerInfo(login: string): Promise<StreamerInfo | null> {
      const normalizedLogin = login.toLowerCase();

      // Check in-memory cache
      const cached = userMemCache.get(normalizedLogin);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
      }

      try {
        const user = await usersEndpoint.getByLogin(normalizedLogin);
        if (!user) return null;

        const streamerInfo = mapUserToStreamerInfo(user);

        // Update in-memory cache
        userMemCache.set(normalizedLogin, {
          data: streamerInfo,
          expiresAt: Date.now() + CACHE_TTL.USER,
        });

        return streamerInfo;
      } catch {
        // API error - return null to trigger fallback
        return null;
      }
    },

    async getVodMetadata(vodId: string): Promise<VodMetadata | null> {
      try {
        const video = await videosEndpoint.getById(vodId);
        if (!video) return null;
        return mapVideoToVodMetadata(video);
      } catch {
        return null;
      }
    },

    async getCurrentStream(login: string): Promise<LiveStreamInfo | null> {
      try {
        const stream = await streamsEndpoint.getByUserLogin(login.toLowerCase());
        if (!stream) return null;
        return mapStreamToLiveStreamInfo(stream);
      } catch {
        return null;
      }
    },

    async getCurrentStreamCached(login: string): Promise<LiveStreamInfo | null> {
      const normalizedLogin = login.toLowerCase();

      // Check in-memory cache first (fastest)
      const memCached = streamMemCache.get(normalizedLogin);
      if (memCached && memCached.expiresAt > Date.now()) {
        return memCached.data;
      }

      // Check persistent cache (survives SW restart)
      const persistentCache = await getPersistentStreamCache();
      const cached = persistentCache[normalizedLogin];
      if (cached && cached.expiresAt > Date.now()) {
        // Hydrate memory cache
        streamMemCache.set(normalizedLogin, cached);
        return cached.data;
      }

      // Cache miss - fetch from API
      const stream = await this.getCurrentStream(login);

      // Update both caches
      const entry: CacheEntry<LiveStreamInfo | null> = {
        data: stream,
        expiresAt: Date.now() + CACHE_TTL.STREAM,
      };
      streamMemCache.set(normalizedLogin, entry);
      await updatePersistentStreamCache(normalizedLogin, entry);

      return stream;
    },

    async invalidateStreamCache(login: string): Promise<void> {
      const normalizedLogin = login.toLowerCase();

      // Clear in-memory cache
      streamMemCache.delete(normalizedLogin);

      // Clear persistent cache
      const cache = await getPersistentStreamCache();
      delete cache[normalizedLogin];
      await storage.set(STORAGE_KEYS.STREAM_CACHE, cache);
    },

    async getRecentVodsByUserId(userId: string, limit = 20): Promise<VodMetadata[]> {
      // Check in-memory cache first
      const memCached = vodMemCache.get(userId);
      if (memCached && memCached.expiresAt > Date.now()) {
        return memCached.data;
      }

      // Check persistent cache
      const persistentCache = await getPersistentVodCache();
      const cached = persistentCache[userId];
      if (cached && cached.expiresAt > Date.now()) {
        // Hydrate memory cache
        vodMemCache.set(userId, cached);
        return cached.data;
      }

      // Cache miss - fetch from API
      try {
        const videos = await videosEndpoint.getArchivesByUserId(userId, { first: limit });
        const vods = videos.map(mapVideoToVodMetadata);

        // Update both caches
        const entry: CacheEntry<VodMetadata[]> = {
          data: vods,
          expiresAt: Date.now() + CACHE_TTL.VOD,
        };
        vodMemCache.set(userId, entry);
        await updatePersistentVodCache(userId, entry);

        return vods;
      } catch {
        return [];
      }
    },

    async findVodByStreamId(userId: string, streamId: string): Promise<VodMetadata | null> {
      const vods = await this.getRecentVodsByUserId(userId);
      return vods.find((v) => v.streamId === streamId) ?? null;
    },
  };
}
