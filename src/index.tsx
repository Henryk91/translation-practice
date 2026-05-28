import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/700.css";
import { Provider } from "react-redux";
import store from "./store";
import { BrowserRouter } from "react-router-dom";
import { ServiceProvider } from "./providers/ServiceProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import posthog from "posthog-js";
import { PostHogProvider, PostHogErrorBoundary } from "@posthog/react";

posthog.init(process.env.REACT_APP_PUBLIC_POSTHOG_KEY as string, {
  api_host: process.env.REACT_APP_PUBLIC_POSTHOG_HOST,
  defaults: "2026-01-30",
  persistence: "localStorage",
});

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

async function enableMocking() {
  // Only use MSW during E2E tests, not in normal development
  // E2E tests can be detected by checking if we're in a Playwright context
  // For now, we disable MSW in development to allow real API calls
  // If you need MSW for development, set REACT_APP_USE_MSW=true in your .env
  if (process.env.REACT_APP_USE_MSW === "true") {
    const { worker } = await import("./mocks/browser");
    console.log("[MSW] Starting service worker...");
    await worker.start({
      onUnhandledRequest: "bypass",
    });
    console.log("[MSW] Service worker started successfully");
  }
}

enableMocking().then(() => {
  root.render(
    <React.StrictMode>
      <PostHogProvider client={posthog}>
        <PostHogErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <Provider store={store}>
              <ServiceProvider>
                <BrowserRouter>
                  <App />
                </BrowserRouter>
              </ServiceProvider>
            </Provider>
          </QueryClientProvider>
        </PostHogErrorBoundary>
      </PostHogProvider>
    </React.StrictMode>,
  );
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
