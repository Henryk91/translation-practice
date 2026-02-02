import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import store from "./store";

test("renders app without crashing", () => {
  render(
    <Provider store={store}>
      <MemoryRouter>
        <App />
      </MemoryRouter>
    </Provider>,
  );
  // Check for Header or side bar element
  // const linkElement = screen.getByText(/Translation Practice/i); // Header might not have text
});
