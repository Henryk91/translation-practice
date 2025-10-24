import React, { useMemo } from "react";
import { LevelSelect, MenuButton, SideMenu, SubLevelOptionItem } from "../helpers/style";
import { faBars, faDoorOpen, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { logoutUser } from "../helpers/requests";
import { clearLocalScores, getScoreColorRange, getLevelScoreAverage } from "../helpers/utils";
import { noSubLevel } from "../data/levelSentences";
import { Dict } from "styled-components/dist/types";
import { settingsActions } from "../store/settings-slice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";

interface SideBarProps {
  handleLevelChange: (level: string) => void;
  handleSubLevelChange: (subLevel: string) => void;
  levelSentences: Dict;
}

const SideBar: React.FC<SideBarProps> = ({ handleLevelChange, handleSubLevelChange, levelSentences }) => {
  const dispatch = useDispatch();
  const selectedLevel = useSelector((state: RootState) => state.ui.levelSelected);
  const selectedSubLevel = useSelector((state: RootState) => state.ui.subLevelSelected);
  const subLevels = useSelector((state: RootState) => state.ui.subLevels);
  const levels = useSelector((state: RootState) => state.ui.levels);
  const { showLevels } = useSelector((state: RootState) => state.settings.settings);

  const setShowLevels = (val: boolean) => {
    dispatch(settingsActions.setShowLevels(val));
  };

  const levelScoreText = useMemo(
    () => (lvl: string) => {
      const subItems = Object.keys(levelSentences[lvl] || {}).length;
      const score = getLevelScoreAverage(lvl, subItems) || null;
      if (!score) return <></>;
      return <span style={{ color: getScoreColorRange(Number(score)) }}>{`(${score}%)`}</span>;
    },
    [levelSentences]
  );

  const subLevelScoreText = useMemo(
    () => (lvl: string) => {
      if (!selectedLevel) return "";
      const localSave = localStorage.getItem(`translation-score-${selectedLevel}-${lvl}`);
      if (localSave === null) return "";
      const localSaveJson = JSON.parse(localSave);
      return <span style={{ color: getScoreColorRange(localSaveJson.score) }}>{`(${localSaveJson.score}%)`}</span>;
    },
    [selectedLevel]
  );

  const getIncorectSentenceCount = () => {
    const userId = localStorage.getItem("userId") ?? "unknown";
    const hasIncorrect = localStorage.getItem(userId + "-incorrectRows");
    if (hasIncorrect) {
      const savedRows = JSON.parse(hasIncorrect);
      return <span style={{ color: getScoreColorRange(savedRows.length, true) }}>{`(${savedRows.length})`}</span>;
    }
  };

  const levelInfo = (lvl: string) => {
    if (lvl !== "Incorrect Sentences") return levelScoreText(lvl);
    return getIncorectSentenceCount();
  };

  const loggedIn = localStorage.getItem("userId");

  const clickLogin = () => {
    if (loggedIn) {
      logoutUser().then((res) => {
        if (res?.ok) {
          localStorage.removeItem("userId");
          clearLocalScores();
          window.location.reload();
        }
      });
      return;
    }
    window.location.assign(`https://practice.lingodrill.com/login.html?redirect=${window.location.href}`);
  };

  const handleMenuLevelClick = (name: string) => {
    handleLevelChange(name as any);
    if (noSubLevel.includes(name)) {
      document.getElementById("toggle")?.click();
      return;
    }
    setShowLevels(false);
  };

  return (
    <SideMenu className="hidden-content">
      <LevelSelect>
        <div className="sidebar-menu">
          <div style={{ flex: "1" }}>
            <MenuButton className="login-button" onClick={clickLogin}>
              <FontAwesomeIcon icon={loggedIn ? faDoorOpen : faUser} />
              <div style={{ fontSize: "12px", color: "white" }}>{loggedIn ? "Log Out" : "Log In"}</div>
            </MenuButton>
          </div>
          <div className="level-info" style={{ flex: "3" }}>
            Levels Selected: <br />
            <span style={{ color: "rgba(49, 196, 141, 1)", fontSize: "16px" }}>
              {selectedLevel && (
                <>
                  {selectedLevel} {levelScoreText(selectedLevel)}
                </>
              )}
            </span>
          </div>
          <div style={{ flex: "1", display: "flex", justifyContent: "center" }}>
            <span>
              <label htmlFor="toggle" className="sidebar-menu-button1 menu-button">
                <FontAwesomeIcon icon={faBars} />
              </label>
            </span>
          </div>
        </div>
        <MenuButton
          className={showLevels ? "level-button-active" : "level-button-inactive"}
          style={{ fontSize: "15px" }}
          onClick={() => setShowLevels(true)}
        >
          Select Level
        </MenuButton>
        <MenuButton
          className={!showLevels ? "level-button-active" : "level-button-inactive"}
          disabled={!!selectedLevel && noSubLevel.includes(selectedLevel)}
          style={{ fontSize: "15px" }}
          onClick={() => setShowLevels(false)}
        >
          Select Sub Level
        </MenuButton>
      </LevelSelect>
      <div
        style={{
          height: "-webkit-fill-available",
          overflowY: "scroll",
          width: "-webkit-fill-available",
          padding: "0 10px",
        }}
      >
        {showLevels && (
          <>
            {levels.map((lvl) => (
              <SubLevelOptionItem
                onClick={() => {
                  handleMenuLevelClick(lvl);
                }}
                key={lvl}
                style={{ color: selectedLevel === lvl ? "rgba(49, 196, 141, 1)" : "" }}
              >
                <span style={{ textAlign: "left" }}>{lvl}</span> <span>{levelInfo(lvl)}</span>
              </SubLevelOptionItem>
            ))}
          </>
        )}
        {subLevels && !showLevels && (
          <>
            {subLevels.map((lvl) => (
              <label key={lvl} htmlFor="toggle" style={{ textAlign: "left" }}>
                <SubLevelOptionItem
                  onClick={() => handleSubLevelChange(lvl as any)}
                  style={{
                    color: selectedSubLevel === lvl ? "rgba(49, 196, 141, 1)" : "",
                  }}
                >
                  <span style={{ textAlign: "left" }}>{lvl}</span> <span>{subLevelScoreText(lvl)}</span>
                </SubLevelOptionItem>
              </label>
            ))}
          </>
        )}
      </div>
      <br />
    </SideMenu>
  );
};

export default SideBar;
