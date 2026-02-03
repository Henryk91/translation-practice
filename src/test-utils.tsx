import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { ServiceProvider } from "./providers/ServiceProvider";
import uiSlice from "./store/ui-slice";
import settingsSlice from "./store/settings-slice";
import sessionSlice from "./store/session-slice";

// Create a custom render function that wraps components with all necessary providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper"> & {
    preloadedState?: any;
    route?: string;
  },
) => {
  const { preloadedState = {}, route = "/", ...renderOptions } = options || {};

  const store = configureStore({
    reducer: {
      ui: uiSlice.reducer,
      settings: settingsSlice.reducer,
      session: sessionSlice.reducer,
    } as any,
    preloadedState: {
      ui: { levels: ["A1"], levelSentences: {}, notification: null },
      settings: {
        settings: {
          shouldSave: false,
          useGapFill: true,
          shuffleSentences: false,
          hasGapFill: true,
          showLevels: true,
          redoErrors: false,
          useMic: false,
          isComplete: false,
          chatUi: false,
          mode: "easy",
          showNav: false,
        },
      },
      session: { status: "idle", batchIndex: 0 },
      ...preloadedState,
    } as any,
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Turn off retries for testing
      },
    },
  });

  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ServiceProvider>
            <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
          </ServiceProvider>
        </QueryClientProvider>
      </Provider>
    );
  };

  return {
    store,
    ...render(ui, { wrapper: AllTheProviders, ...renderOptions }),
  };
};

// Re-export everything
export * from "@testing-library/react";

// Override render method
export { customRender as render };
