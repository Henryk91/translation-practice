import { http, HttpResponse } from "msw";

export const handlers = [
  // Levels
  http.get("*/api/translate-levels", () => {
    return HttpResponse.json({
      A1: ["Unit 1", "Unit 2", "Unit 3"],
      A2: ["Unit 1", "Unit 2"],
      B1: ["Unit 1"],
    });
  }),

  // Sentences
  http.get("*/api/saved-translation", () => {
    return HttpResponse.json([
      {
        id: "test-id-1",
        sentence: "Hello world",
        translation: "Hallo Welt",
      },
    ]);
  }),

  // Translation Check (Scoring)
  http.post("*/api/confirm-translation", async ({ request }) => {
    const body = (await request.json()) as { english: string; german: string };
    const isCorrect = body.german === "Hallo Welt"; // Simple mock logic
    return HttpResponse.json({ isCorrect });
  }),

  // Translation Scores
  http.get("*/api/translation-scores", () => {
    return HttpResponse.json([{ id: "1", score: 100, timestamp: Date.now() }]);
  }),

  http.post("*/api/translation-scores", () => {
    return HttpResponse.json({ success: true });
  }),

  // Translate Helper
  http.post("*/api/translate", () => {
    return HttpResponse.json({ translated: "Translated Text" });
  }),

  // Login
  http.post("*/api/login", () => {
    return HttpResponse.json({ token: "fake-jwt-token", userId: "user-123" });
  }),

  // Incorrect Sentences
  http.get("*/api/incorrect-translations", () => {
    return HttpResponse.json([{ id: "inc-1", sentence: "Mistake", translation: "Fehler" }]);
  }),

  http.post("*/api/incorrect-translations", () => {
    return HttpResponse.json({ success: true });
  }),
];
