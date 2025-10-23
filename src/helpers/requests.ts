import { IncorrectSentences, KeyValue, NextFn } from "./types";
import { clearLocalScores } from "./utils";

const BACKEND_URL = "https://api.lingodrill.com";

const cache = new Map();

export async function fetchWithCache(url: string, options: RequestInit = {}, ttl = 300000): Promise<Response> {
  const cacheKey = createCacheKey(url, options);
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.response.clone();
  }

  const response = await fetch(url, options);

  if (response.ok && response.status < 300) {
    cache.set(cacheKey, {
      response: response.clone(),
      timestamp: Date.now(),
    });
  }

  return response;
}

function createCacheKey(url: string, options: RequestInit): string {
  const relevantOptions = {
    credentials: options.credentials,
    headers: options.headers,
  };

  return `GET:${url}:${JSON.stringify(relevantOptions)}`;
}

export const logoutUser = async (): Promise<KeyValue | undefined> => {
  try {
    const res: Response = await apiFetch("/api/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "",
    });
    if (res.ok) return res.json();

    return Promise.resolve(undefined);
  } catch (error) {
    console.error("Error:", error);
    return Promise.resolve(undefined);
  }
};

export async function refreshToken(): Promise<Response | { ok: false }> {
  const userId = localStorage.getItem("userId");
  if (!userId) return { ok: false };

  const res = await fetch(`${BACKEND_URL}/api/refresh`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: "",
  });

  if (res.status === 401 && userId) {
    localStorage.removeItem("userId");
    const e = await res.json();
    console.log("Error:", e?.error);
    clearLocalScores();
    window.location.reload();
  }
  return res;
}

export async function apiFetch(url: string, options?: RequestInit, useCache = true): Promise<Response> {
  const localUrl = url.startsWith("http") ? url : BACKEND_URL + url;

  const fetchMethod = (!options || options.method === "GET") && useCache ? fetchWithCache : fetch;

  const res = await fetchMethod(localUrl, {
    credentials: "include",
    ...options,
  });

  if (res.status === 401) {
    const refRes = await refreshToken();
    if (refRes instanceof Response && refRes.ok) {
      return await apiFetch(url, options);
    }
    return res;
  }

  return res;
}

export function loginRequest(note: Record<string, unknown>, next: NextFn): void {
  apiFetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(note),
  })
    .then((res: Response) => res.json())
    .then((data) => {
      next(data);
    })
    .catch((error) => {
      console.log("Error:", error);
      next(error);
    });
}

export function logUse(): void {
  const currentURL = window.location.href;
  if (currentURL.includes("localhost")) return;

  apiFetch("/api/log?site=lingodrill-practice")
    .then((res: Response) => res.json())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.log("Error:", error);
    });
}

export function getTranslationScores(next: NextFn): void {
  apiFetch("/api/translation-scores")
    .then((res: Response) => res.json())
    .then((data) => {
      next(data);
    })
    .catch((error) => {
      console.log("Error:", error);
      next(error);
    });
}

export function setTranslationScore(payload: Record<string, unknown>, next: NextFn): void {
  if (!localStorage.getItem("userId")) {
    next("Not Logged In!");
    return;
  }

  apiFetch("/api/translation-scores", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then((res: Response) => res?.json())
    .then((data) => {
      next(data);
    })
    .catch((error) => {
      console.log("Error:", error);
      next(error);
    });
}

export const translateSentence = async (sentence: string): Promise<string> => {
  try {
    const res: Response = await apiFetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sentence }),
    });

    if (!res.ok) {
      return "Error loading. Try again.";
    }

    const { translated } = await res.json();
    return translated;
  } catch (error) {
    console.error("Error:", error);
    return "Error loading. Try again.";
  }
};

export const getLevels = async (): Promise<KeyValue | undefined> => {
  try {
    const res: Response = await apiFetch("/api/translate-levels");
    if (res.ok) return res.json();

    return Promise.resolve(undefined);
  } catch (error) {
    console.error("Error:", error);
    return Promise.resolve(undefined);
  }
};

export const getSentenceWithTranslation = async (
  selectedLevel: String,
  selectedSubLevel: String
): Promise<KeyValue | undefined> => {
  const encodedSelectedLevel = encodeURIComponent(`${selectedLevel}`);
  const encodedSelectedSubLevel = encodeURIComponent(`${selectedSubLevel}`);

  try {
    const res = await apiFetch(
      `/api/saved-translation?level=${encodedSelectedLevel}&subLevel=${encodedSelectedSubLevel}`
    );

    if (res?.ok) return await res.json();

    return;
  } catch (error) {
    console.error("Error:", error);
    return;
  }
};

export const confirmTranslationCheck = async (english: string, german: string): Promise<boolean> => {
  if (!english || !german) return false;

  try {
    const res = await apiFetch("/api/confirm-translation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ english, german }),
    });

    if (!res?.ok) {
      return false;
    }

    const { isCorrect } = await res?.json();
    console.log("isCorrect", isCorrect);
    return isCorrect;
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
};

export const sendIncorrectSentences = async (sentences: IncorrectSentences[]): Promise<KeyValue | undefined> => {
  const userId = localStorage.getItem("userId");
  if (!userId) return { ok: false };
  try {
    const res: Response = await apiFetch("/api/incorrect-translations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sentences),
    });

    if (!res.ok) {
      return Promise.resolve(undefined);
    }
    if (res.ok) return res.json();
  } catch (error) {
    console.error("Error:", error);
    return Promise.resolve(undefined);
  }
};

export const getIncorrectSentences = async (): Promise<KeyValue | undefined> => {
  const userId = localStorage.getItem("userId");
  if (!userId) return { ok: false };
  try {
    const res: Response = await apiFetch("/api/incorrect-translations?corrected=false", {}, false);

    if (!res.ok) {
      console.error("Error:", res);
      return Promise.resolve(undefined);
    }
    if (res.ok) return res.json();
  } catch (error) {
    console.error("Error:", error);
    return Promise.resolve(undefined);
  }
};
