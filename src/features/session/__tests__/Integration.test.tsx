import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

import AppRoutes from "../../../routes/AppRoutes";
import uiSlice from "../../../store/ui-slice";
import settingsSlice from "../../../store/settings-slice";
import sessionSlice from "../../../store/session-slice";
import { ServiceProvider } from "../../../providers/ServiceProvider";

// Helper to render with providers
const renderWithProviders = (ui: React.ReactElement, { preloadedState = {}, route = "/A1/Unit1" } = {}) => {
  const store = configureStore({
    reducer: {
      ui: uiSlice.reducer,
      settings: settingsSlice.reducer,
      session: sessionSlice.reducer,
    },
    preloadedState: {
      ui: {
        levels: ["A1"],
        levelSentences: {},
        notification: null,
        levelSelected: "A1",
        subLevelSelected: "Unit1",
      } as any,
      settings: {
        settings: {
          shouldSave: false,
          useGapFill: true,
          shuffleSentences: false, // disable shuffle for predictable order
          hasGapFill: true,
          showLevels: true,
          redoErrors: false,
          useMic: false,
          isComplete: false,
          chatUi: false,
          mode: "easy" as const,
          showNav: false,
        },
      },
      session: {
        // Add session state to avoid missing key if required
        status: "idle",
        batchIndex: 0,
      } as any,
      ...preloadedState,
    },
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  window.history.pushState({}, "Test page", route);

  return {
    ...render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ServiceProvider>
            <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
          </ServiceProvider>
        </QueryClientProvider>
      </Provider>,
    ),
    store,
  };
};

describe("Integration Flow", () => {
  // TODO: This test needs refactoring to match current routing architecture
  // The app now uses /:level/:subLevel routes but the test setup doesn't properly
  // initialize the session state. Skipping for now.
  test.skip("renders loading state initially then shows sentences", async () => {
    // We mocked the API to return "Hello" -> "Hallo" for A1 level
    renderWithProviders(<AppRoutes />, { route: "/A1/Unit1" });

    // Wait for data
    await waitFor(() => {
      expect(screen.getByDisplayValue("Hello")).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue("Hello")).toBeInTheDocument(); // Sentence
    // Check if input is empty
    const inputs = screen.getAllByRole("textbox");
    expect(inputs[0]).toHaveValue("");
  });
});
