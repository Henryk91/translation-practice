import { To, NavigateOptions } from "react-router-dom";

export const splitSentences = (input: string): string[] => {
  if (!input) return [];
  return input
    ?.split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
};

export const shuffleArray = <T>(input: T[]): T[] => {
  const array = [...input];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const splitAndShuffle = (input: string): string[] => {
  const sentences = splitSentences(input);
  return shuffleArray(sentences);
};

export const encodeLevelName = (name: string): string => {
  const withUnderscores = name.replace(/\s+/g, "_");
  return encodeURIComponent(withUnderscores);
};

export const decodeLevelName = (name: string): string => {
  try {
    const decoded = decodeURIComponent(name);
    return decoded.replace(/_/g, " ");
  } catch (e) {
    return name.replace(/_/g, " ");
  }
};

export const parseUrlParams = (
  location_pathname: string,
): { level: string | undefined; subLevel: string | undefined } => {
  const pathParts = location_pathname.split("/").filter(Boolean);
  if (pathParts.length === 0) return { level: undefined, subLevel: undefined };

  const level = decodeLevelName(pathParts[0]);
  const subLevel = pathParts.length >= 2 ? decodeLevelName(pathParts[1]) : undefined;
  return { level, subLevel };
};

export const updateUrl = (
  level: string | undefined,
  subLevel: string | undefined,
  navigate: (to: To, options?: NavigateOptions | undefined) => void,
) => {
  let to = "/";
  if (level) to += encodeLevelName(level);
  if (subLevel) to += `/${encodeLevelName(subLevel)}`;

  navigate(to, { replace: true });
};
