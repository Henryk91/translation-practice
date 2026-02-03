import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import StickyProgressBar from "../StickyProgressBar";
import PageHeader from "../PageHeader";
import uiSlice from "../../../../store/ui-slice";
import settingsSlice from "../../../../store/settings-slice";
import { Row } from "../../../../types";

// Mock store setup
const createMockStore = (uiStateOverride = {}) => {
  return configureStore({
    reducer: {
      ui: uiSlice.reducer,
      settings: settingsSlice.reducer,
    },
    preloadedState: {
      ui: {
        levelSelected: "A1",
        subLevelSelected: "Unit 1",
        levels: [],
        levelSentences: {},
        notification: null,
        ...uiStateOverride,
      },
      settings: {
        settings: {
          // defaults...
          shouldSave: true,
          useGapFill: true,
          shuffleSentences: true,
          hasGapFill: true,
          showLevels: true,
          redoErrors: false,
          useMic: false,
          isComplete: false,
          chatUi: false,
          mode: "easy",
          showNav: false,
        } as any,
      },
    } as any,
  });
};

describe("Session Components Snapshots", () => {
  describe("StickyProgressBar", () => {
    const mockRows: Row[] = [
      {
        id: "1",
        isCorrect: true,
        sentence: "A",
        translation: "B",
        userInput: "B",
        feedback: [{ word: "B", correct: true }],
      },
      {
        id: "2",
        isCorrect: false,
        sentence: "C",
        translation: "D",
        userInput: "E",
        feedback: [{ word: "D", correct: false }],
      },
      { id: "3", isCorrect: undefined, sentence: "F", translation: "G", userInput: "", feedback: null },
    ];

    test("renders correctly with mixed progress", () => {
      const { asFragment } = render(<StickyProgressBar rows={mockRows} subLevel="Unit Test" />);
      expect(asFragment()).toMatchSnapshot();
    });

    test("renders null if no rows", () => {
      const { container } = render(<StickyProgressBar rows={[]} subLevel="Unit Test" />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("PageHeader", () => {
    test("renders correctly with selected Level and SubLevel", () => {
      const store = createMockStore({ levelSelected: "A1", subLevelSelected: "Unit 1" });
      const { asFragment } = render(
        <Provider store={store}>
          <PageHeader sentenceCount={10} />
        </Provider>,
      );
      expect(asFragment()).toMatchSnapshot();
    });

    test("renders correctly when no level selected", () => {
      const store = createMockStore({ levelSelected: undefined, subLevelSelected: undefined });
      const { asFragment } = render(
        <Provider store={store}>
          <PageHeader sentenceCount={0} />
        </Provider>,
      );
      expect(asFragment()).toMatchSnapshot();
    });

    test("renders success message if Incorrect Sentences and count 0", () => {
      const store = createMockStore({ levelSelected: "Incorrect Sentences", subLevelSelected: undefined });
      const { asFragment } = render(
        <Provider store={store}>
          <PageHeader sentenceCount={0} />
        </Provider>,
      );
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
