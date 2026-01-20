export interface ClipUrlParams {
  vodId: string;
  offsetSeconds: number;
  broadcasterLogin: string;
}

// Twitch clip creation URL format:
// https://clips.twitch.tv/create?broadcasterLogin={login}&offsetSeconds={seconds}&vodID={vodId}
export function buildClipCreationUrl(params: ClipUrlParams): string {
  const searchParams = new URLSearchParams({
    broadcasterLogin: params.broadcasterLogin,
    offsetSeconds: String(params.offsetSeconds),
    vodID: params.vodId,
  });
  return `https://clips.twitch.tv/create?${searchParams.toString()}`;
}
