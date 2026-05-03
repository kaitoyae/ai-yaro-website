export type HttpsUrl = `https://${string}`;

export const safeExternalUrl = (url?: string): HttpsUrl | undefined => {
  if (!url) return undefined;

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol !== 'https:') return undefined;

    return parsedUrl.href as HttpsUrl;
  } catch {
    return undefined;
  }
};
