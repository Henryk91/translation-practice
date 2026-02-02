import { useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { uiActions } from "../store/ui-slice";
import { getLevels, logUse } from "../helpers/requests";
import { initialLevelDict } from "../data/levelSentences";
import { checkLogin, initScores } from "../helpers/utils";

export const useAppInitialization = () => {
  const dispatch = useDispatch();
  const hasInit = useRef(false);

  const getTranslateSentence = useCallback(() => {
    getLevels().then((data) => {
      if (data) {
        const newLevelSentences = { ...initialLevelDict, ...data };
        dispatch(uiActions.setLevelSentences(newLevelSentences));
        dispatch(uiActions.setLevels(Object.keys(newLevelSentences)));
      }
    });
  }, [dispatch]);

  useEffect(() => {
    if (hasInit.current) return;
    console.log("App initialized");
    hasInit.current = true;

    getTranslateSentence();

    const hasLoggedUse = sessionStorage.getItem("hasLoggedUse");
    if (!hasLoggedUse) {
      sessionStorage.setItem("hasLoggedUse", "true");
      logUse();
    }

    checkLogin();
    initScores();
  }, [getTranslateSentence]);
};
