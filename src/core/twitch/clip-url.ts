export interface ClipUrlParams {
  vodId: string;
  offsetSeconds: number;
}

// Twitch clip creation URL format:
// https://www.twitch.tv/videos/{vodId}?t={time}
// Then user clicks "Create Clip" button on that page
export function buildClipCreationUrl(params: ClipUrlParams): string {
  const hours = Math.floor(params.offsetSeconds / 3600);
  const minutes = Math.floor((params.offsetSeconds % 3600) / 60);
  const seconds = params.offsetSeconds % 60;

  const timeParam = `${hours}h${minutes}m${seconds}s`;
  return `https://www.twitch.tv/videos/${params.vodId}?t=${timeParam}`;
}
