import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { RootState } from "../store";
import { uiActions } from "../store/ui-slice";
import { settingsActions } from "../store/settings-slice";
import { parseUrlParams, updateUrl, splitAndShuffle } from "../helpers/utils";

export const useRoutingSync = (
  setText: (text: string) => void,
  setAllRows: (rows: any[]) => void,
  setCurrentBatchIndex: (index: number) => void,
  loadIncorrectSentences: () => void,
  BATCH_SIZE: number,
) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const selectedLevel = useSelector((state: RootState) => state.ui.levelSelected);
  const selectedSubLevel = useSelector((state: RootState) => state.ui.subLevelSelected);
  const subLevels = useSelector((state: RootState) => state.ui.subLevels);
  const levels = useSelector((state: RootState) => state.ui.levels);
  const levelSentences = useSelector((state: RootState) => state.ui.levelSentences);

  const urlInitialized = useRef(false);
  const pendingSubLevelFromUrl = useRef<string | null>(null);

  const loadSettingsFromLocalStorage = useCallback(() => {
    const redoErrors = localStorage.getItem("redoErrors");
    if (redoErrors !== null) {
      dispatch(settingsActions.setRedoErrors(JSON.parse(redoErrors)));
    }

    const useGapFill = localStorage.getItem("useGapFill");
    if (useGapFill !== null) {
      dispatch(settingsActions.setUseGapFill(JSON.parse(useGapFill)));
    }
  }, [dispatch]);

  const handleSubLevelChange = (subLevel: string): void => {
    setAllRows([]);
    setCurrentBatchIndex(0);
    dispatch(uiActions.setSubLevel({ subLevel: subLevel }));
    localStorage.setItem("selectedSubLevel", subLevel);
    if (selectedLevel) updateUrl(selectedLevel, subLevel, navigate);
  };

  const handleLevelChange = (level: string): void => {
    const text = level ? levelSentences[level] : "";
    dispatch(uiActions.setLevel({ level: level }));

    if (level) localStorage.setItem("selectedLevel", level);
    if (level === "Incorrect Sentences") {
      setAllRows([]);
      setCurrentBatchIndex(0);
      dispatch(uiActions.setSubLevels(undefined));
      dispatch(uiActions.setSubLevel({ subLevel: undefined }));
      localStorage.removeItem("selectedSubLevel");
      updateUrl(level, undefined, navigate);
      return;
    }

    if (typeof text === "string") {
      const sentences = splitAndShuffle(text);
      dispatch(uiActions.setSubLevels(undefined));

      setText(text);
      const sentencesWithIds = sentences.map((sentence: string, idx: number) => ({
        sentence,
        userInput: "",
        translation: "",
        feedback: null,
        id: `${level}-none-${idx}`,
        batchId: Math.floor(idx / BATCH_SIZE),
      }));
      setAllRows(sentencesWithIds);
      setCurrentBatchIndex(0);
      updateUrl(level, undefined, navigate);
    } else if (typeof text === "object") {
      setText("");
      setAllRows([]);
      setCurrentBatchIndex(0);
      dispatch(uiActions.setSubLevels(text));
      dispatch(uiActions.setSubLevel({ subLevel: undefined }));
      localStorage.removeItem("selectedSubLevel");
      updateUrl(level, undefined, navigate);
    }
  };

  const nextExercise = (previous?: boolean) => {
    if (!subLevels || !selectedSubLevel) return;
    const currentIndex = subLevels.indexOf(selectedSubLevel);
    if (currentIndex < 0) return;

    const canGoForwards = previous !== true && subLevels.length - 1 > currentIndex;
    const canGoBackwards = previous === true && currentIndex > 0;

    if (canGoForwards || canGoBackwards) {
      const nextInd = previous ? currentIndex - 1 : currentIndex + 1;
      handleSubLevelChange(subLevels[nextInd]);
      return;
    }

    const currentLevelIndex = levels.indexOf(`${selectedLevel}`);
    if (currentLevelIndex < 0) return;

    const nextLevelIndex = previous ? currentLevelIndex - 1 : currentLevelIndex + 1;
    const newLevel = levels[nextLevelIndex];
    const localSubLevels = levelSentences[newLevel];
    const newSubLevel = previous ? localSubLevels[localSubLevels.length - 1] : localSubLevels[0];

    handleLevelChange(newLevel);
    handleSubLevelChange(newSubLevel);
  };

  const handleIncorrectSentencesLevel = useCallback(
    (level: string, urlLevel: string | undefined, urlSubLevel: string | undefined) => {
      dispatch(uiActions.setSubLevels(undefined));
      dispatch(uiActions.setSubLevel({ subLevel: undefined }));
      localStorage.removeItem("selectedSubLevel");
      if (!urlLevel || urlSubLevel) updateUrl(level, undefined, navigate);
    },
    [dispatch, navigate],
  );

  const handleLevelWithSubLevels = useCallback(
    (
      level: string,
      subLevelsArray: string[],
      subLevelToUse: string | null,
      urlLevel: string | undefined,
      urlSubLevel: string | undefined,
    ) => {
      dispatch(uiActions.setSubLevels(subLevelsArray));
      dispatch(settingsActions.setShowLevels(false));

      if (!subLevelToUse) {
        if (level && !urlLevel) updateUrl(level, undefined, navigate);
        return;
      }

      if (subLevelsArray.includes(subLevelToUse)) {
        pendingSubLevelFromUrl.current = subLevelToUse;
        dispatch(uiActions.setSubLevel({ subLevel: subLevelToUse }));
        localStorage.setItem("selectedSubLevel", subLevelToUse);

        const urlHasChanged = !urlLevel || !urlSubLevel || urlLevel !== level || urlSubLevel !== subLevelToUse;
        if (urlHasChanged) updateUrl(level, subLevelToUse, navigate);
      } else {
        console.warn(`Sublevel "${subLevelToUse}" not found in level "${level}". Available sublevels:`, subLevelsArray);
        if (urlSubLevel) updateUrl(level, undefined, navigate);
      }
    },
    [dispatch, navigate],
  );

  const handleLevelWithStringContent = useCallback(
    (level: string, content: string, urlLevel: string | undefined) => {
      setText(content);
      if (level && !urlLevel) updateUrl(level, undefined, navigate);
    },
    [navigate, setText],
  );

  useEffect(() => {
    if (urlInitialized.current || !levels.length || Object.keys(levelSentences).length === 0) return;

    const { level: urlLevel, subLevel: urlSubLevel } = parseUrlParams(location.pathname);
    const levelFromStorage = localStorage.getItem("selectedLevel");
    const subLevelFromStorage = localStorage.getItem("selectedSubLevel");

    const levelToUse = urlLevel || levelFromStorage;
    const subLevelToUse = urlSubLevel || subLevelFromStorage || null;

    if (!levelToUse || !levels.includes(levelToUse)) return;

    urlInitialized.current = true;
    dispatch(uiActions.setLevel({ level: levelToUse }));
    localStorage.setItem("selectedLevel", levelToUse);

    if (levelToUse === "Incorrect Sentences") {
      handleIncorrectSentencesLevel(levelToUse, urlLevel, urlSubLevel);
      loadSettingsFromLocalStorage();
      return;
    }

    const levelContent = levelSentences[levelToUse];

    if (typeof levelContent === "object" && Array.isArray(levelContent)) {
      handleLevelWithSubLevels(levelToUse, levelContent, subLevelToUse, urlLevel, urlSubLevel);
    } else if (typeof levelContent === "string") {
      handleLevelWithStringContent(levelToUse, levelContent, urlLevel);
    }

    loadSettingsFromLocalStorage();
  }, [
    levels,
    levelSentences,
    dispatch,
    location.pathname,
    handleIncorrectSentencesLevel,
    handleLevelWithSubLevels,
    handleLevelWithStringContent,
    loadSettingsFromLocalStorage,
  ]);

  // Set sublevel from URL after sublevels are loaded
  useEffect(() => {
    if (pendingSubLevelFromUrl.current && subLevels && subLevels.length > 0) {
      const subLevelToSet = pendingSubLevelFromUrl.current;
      if (subLevels.includes(subLevelToSet) && selectedSubLevel !== subLevelToSet) {
        dispatch(uiActions.setSubLevel({ subLevel: subLevelToSet }));
        localStorage.setItem("selectedSubLevel", subLevelToSet);
      }
      pendingSubLevelFromUrl.current = null;
    }
  }, [subLevels, selectedSubLevel, dispatch]);

  return { handleLevelChange, handleSubLevelChange, nextExercise };
};
