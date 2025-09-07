import React, { useMemo } from "react";
import { LevelSelect, MenuButton, SideMenu, SubLevelOptionItem } from "../helpers/style";
import { faBars, faDoorOpen, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { logoutUser } from "../helpers/requests";
import { clearLocalScores, getLevelScoreAverage } from "../helpers/utils";
import { noSubLevel } from "../data/levelSentences";
import { Dict } from "styled-components/dist/types";

interface SideBarProps {
  selectedLevel: string | undefined;
  levels: string[];
  subLevels: string[] | undefined;
  selectedSubLevel: string | undefined;
  handleLevelChange: (level: string) => void;
  handleSubLevelChange: (subLevel: string) => void;
  showLevels: boolean;
  setShowLevels: (show: boolean) => void;
  levelSentences: Dict;
}

const SideBar: React.FC<SideBarProps> = ({
  selectedLevel,
  levels,
  subLevels,
  selectedSubLevel,
  handleLevelChange,
  handleSubLevelChange,
  showLevels,
  setShowLevels,
  levelSentences,
}) => {
  const levelScoreText = useMemo(
    () => (lvl: string) => {
      const subItems = Object.keys(levelSentences[lvl] || {}).length;
      const score = getLevelScoreAverage(lvl, subItems) || null;
      return score ? `(${score}%)` : "";
    },
    [levelSentences]
  );

  const subLevelScoreText = useMemo(
    () => (lvl: string) => {
      if (!selectedLevel) return "";
      const localSave = localStorage.getItem(`translation-score-${selectedLevel}-${lvl}`);
      if (localSave === null) return "";
      const localSaveJson = JSON.parse(localSave);
      return `(${localSaveJson.score}%)`;
    },
    [selectedLevel]
  );

  const getIncorectSentenceCount = () => {
    const userId = localStorage.getItem("userId") ?? "unknown";
    const hasIncorrect = localStorage.getItem(userId + "-incorrectRows");
    if (hasIncorrect) {
      const savedRows = JSON.parse(hasIncorrect);
      return `(${savedRows.length})`;
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
    window.location.assign(`https://henryk.co.za/login.html?redirect=${window.location.href}`);
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
          <MenuButton className="login-button" onClick={clickLogin}>
            <FontAwesomeIcon icon={loggedIn ? faDoorOpen : faUser} />
            <div style={{ fontSize: "12px", color: "white" }}>{loggedIn ? "Log Out" : "Log In"}</div>
          </MenuButton>
          <div className="level-info">
            Levels Selected: <br />
            <span style={{ color: "green" }}>
              {selectedLevel ? `${selectedLevel} ${levelScoreText(selectedLevel)}` : ""} {}
            </span>
          </div>
          <span style={{ minWidth: "50px" }}>
            <label htmlFor="toggle" className="sidebar-menu-button1 menu-button">
              <FontAwesomeIcon icon={faBars} />
            </label>
          </span>
        </div>
        <MenuButton
          style={{ fontSize: "15px", backgroundColor: showLevels ? "rgba(51, 51, 51, 0.9)" : "" }}
          onClick={() => setShowLevels(true)}
        >
          Select Level
        </MenuButton>
        <MenuButton
          disabled={!!selectedLevel && noSubLevel.includes(selectedLevel)}
          style={{ fontSize: "15px", backgroundColor: !showLevels ? "rgba(51, 51, 51, 0.9)" : "" }}
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
                style={{ color: selectedLevel === lvl ? "green" : "" }}
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
                    color: selectedSubLevel === lvl ? "green" : "",
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
