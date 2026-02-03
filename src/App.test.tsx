import React from "react";
import { render, screen, waitFor } from "./test-utils";
import App from "./App";

test("renders app without crashing", async () => {
  render(<App />);

  // Wait for async initialization to complete
  await waitFor(() => {
    expect(screen.getByText("Select Your Level")).toBeInTheDocument();
  });
  // const linkElement = screen.getByText(/Translation Practice/i); // Header might not have text
});
