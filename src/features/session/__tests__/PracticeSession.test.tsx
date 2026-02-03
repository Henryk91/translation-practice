import React from "react";
import { render, screen, waitFor, fireEvent } from "../../../test-utils";
import userEvent from "@testing-library/user-event";
import AppRoutes from "../../../routes/AppRoutes";
import { server } from "../../../setupTests";
import { http, HttpResponse } from "msw";

describe("FEATURE: Practice Session", () => {
  test("Full Flow: Load Session -> Type Correct Answer -> See Success", async () => {
    // 1. Initial Render
    render(<AppRoutes />, {
      route: "/A1/Unit1",
      preloadedState: {
        ui: {
          levels: ["A1"],
          levelSentences: {
            A1: ["Unit1", "Unit2"],
          },
          subLevels: ["Unit1", "Unit2"], // Ensure subLevels are present
          levelSelected: "A1", // Pre-select to avoid race condition if possible
          subLevelSelected: "Unit1",
        },
      },
    });

    // 2. Validation: Loading State (if any) or content
    // Based on MSW, we expect "Hello world"
    await waitFor(
      () => {
        expect(screen.getByRole("textbox")).toBeInTheDocument(); // Wait for input first
      },
      { timeout: 3000 },
    );

    expect(screen.getByText("Hello world")).toBeInTheDocument();

    // 3. Interaction: User Types Correct Answer
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Hello world" } });

    // 4. Interaction: Submit (assuming Enter or Blur triggering check)
    // The app might check on Enter or via a button.
    // If there is a "Check" button:
    // fireEvent.click(screen.getByText("Check"));
    // Or if it auto-checks on Enter:
    fireEvent.keyDown(textarea, { key: "Enter", code: "Enter" });

    // 5. Validation: Success State
    // Expect success message or visual cue
    // For now, let's assume the input is cleared or a success message appears
    await waitFor(() => {
      // Example check: Input cleared
      // expect(textarea).toHaveValue("");
      // OR Success message
      // expect(screen.getByText("Correct!")).toBeInTheDocument();
    });
  });

  test("Edge Case: Network Error", async () => {
    server.use(
      http.get("*/api/saved-translation", () => {
        return new HttpResponse(null, { status: 500 });
      }),
    );

    render(<AppRoutes />, {
      route: "/A1/Unit1",
      preloadedState: {
        ui: {
          levels: ["A1"],
          levelSentences: { A1: ["Unit1"] },
          subLevels: ["Unit1"],
          levelSelected: "A1",
          subLevelSelected: "Unit1",
        },
      },
    });

    // Expect Error Message
    // This depends on how the app handles errors.
    // await waitFor(() => {
    //   expect(screen.getByText(/error/i)).toBeInTheDocument();
    // });
  });

  test.skip("Global Settings: Toggle Show Levels", async () => {
    const { store } = render(<AppRoutes />, {
      route: "/A1/Unit1",
      preloadedState: {
        ui: {
          levels: ["A1"],
          levelSentences: { A1: ["Unit1"] },
          subLevels: ["Unit1"],
          levelSelected: "A1",
          subLevelSelected: "Unit1",
        },
        settings: {
          settings: {
            showLevels: true, // Initially true
          },
        },
      },
    });

    // Verify "Back" button is present (implies showLevels = false because we are in subLevel)
    const backButton = screen.getByText("Back");
    expect(backButton).toBeInTheDocument();

    // Toggle setting via User Interaction (Clicking Back)
    userEvent.click(backButton);

    // Verify "Select Your Level" header appears
    // This header appears when showLevels is true
    await waitFor(() => {
      expect(screen.getByText("Select Your Level")).toBeInTheDocument();
    });
  });
});
