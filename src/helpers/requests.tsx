import { KeyValue, NextFn } from "./types";

const BACKEND_URL = "https://note.henryk.co.za";

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

async function refreshToken(): Promise<Response | { ok: false }> {
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
  }
  return res;
}

export async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  const localUrl = url.startsWith("http") ? url : BACKEND_URL + url;

  const res = await fetch(localUrl, {
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

  apiFetch("/api/log?site=translation-practice")
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

export const getSentences = async (): Promise<KeyValue | undefined> => {
  try {
    const res: Response = await apiFetch("/api/full-translate-practice");
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
