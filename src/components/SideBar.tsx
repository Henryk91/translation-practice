import React, { useMemo } from "react";
import { LevelSelect, MenuButton, SideMenu, SubLevelOptionItem } from "../helpers/style";
import Tooltip from "./Tooltip";
import { faBars, faChevronLeft, faChevronRight, faDoorOpen, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { logoutUser } from "../helpers/requests";
import { clearLocalScores, getScoreColorRange, getLevelScoreAverage } from "../helpers/utils";
import { noSubLevel } from "../data/levelSentences";
import { settingsActions } from "../store/settings-slice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";

interface SideBarProps {
  handleLevelChange: (level: string) => void;
  handleSubLevelChange: (subLevel: string) => void;
}

const SideBar: React.FC<SideBarProps> = ({ handleLevelChange, handleSubLevelChange }) => {
  const dispatch = useDispatch();
  const selectedLevel = useSelector((state: RootState) => state.ui.levelSelected);
  const selectedSubLevel = useSelector((state: RootState) => state.ui.subLevelSelected);
  const subLevels = useSelector((state: RootState) => state.ui.subLevels);
  const levels = useSelector((state: RootState) => state.ui.levels);
  const levelSentences = useSelector((state: RootState) => state.ui.levelSentences);
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
            <Tooltip text={loggedIn ? "Log Out of your account" : "Log In to save your progress"}>
              <MenuButton className="login-button" onClick={clickLogin}>
                <FontAwesomeIcon icon={loggedIn ? faDoorOpen : faUser} />
                <div style={{ fontSize: "12px", color: "white" }}>{loggedIn ? "Log Out" : "Log In"}</div>
              </MenuButton>
            </Tooltip>
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
              <Tooltip text="Close side menu">
                <label htmlFor="toggle" className="sidebar-menu-button1 menu-button">
                  <FontAwesomeIcon icon={faBars} />
                </label>
              </Tooltip>
            </span>
          </div>
        </div>
        {showLevels ? (
          <div style={{ padding: "15px 10px", textAlign: "center", width: "100%", borderTop: "1px solid #333" }}>
            <h3 style={{ margin: 0, color: "rgba(49, 196, 141, 1)", fontSize: "18px" }}>Select Your Level</h3>
            <p style={{ margin: "5px 0 0", fontSize: "13px", color: "#888" }}>Step 1: Choose a language proficiency</p>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              padding: "15px 10px",
              borderTop: "1px solid #333",
            }}
          >
            <Tooltip text="Back to level selection">
              <MenuButton
                onClick={() => setShowLevels(true)}
                style={{
                  fontSize: "14px",
                  padding: "8px 12px",
                  marginRight: "15px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
                Back
              </MenuButton>
            </Tooltip>
            <div style={{ textAlign: "left" }}>
              <h3 style={{ margin: 0, color: "rgba(49, 196, 141, 1)", fontSize: "16px" }}>{selectedLevel}</h3>
              <p style={{ margin: 0, fontSize: "13px", color: "#888" }}>Step 2: Select a sub-level</p>
            </div>
          </div>
        )}
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
            <div
              style={{
                padding: "10px 10px 5px",
                textAlign: "left",
                fontSize: "12px",
                color: "#888",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Language Proficiency
            </div>
            {levels
              .filter((lvl) => !noSubLevel.includes(lvl))
              .map((lvl) => (
                <SubLevelOptionItem
                  onClick={() => {
                    handleMenuLevelClick(lvl);
                  }}
                  key={lvl}
                  $active={selectedLevel === lvl}
                  style={{ color: selectedLevel === lvl ? "rgba(49, 196, 141, 1)" : "" }}
                >
                  <div
                    style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <span style={{ textAlign: "left" }}>{lvl}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span>{levelInfo(lvl)}</span>
                      <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: "12px", opacity: 0.5 }} />
                    </div>
                  </div>
                </SubLevelOptionItem>
              ))}

            <div
              style={{
                padding: "20px 10px 5px",
                textAlign: "left",
                fontSize: "12px",
                color: "#888",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Personal Practice
            </div>
            {levels
              .filter((lvl) => noSubLevel.includes(lvl))
              .map((lvl) => (
                <SubLevelOptionItem
                  onClick={() => {
                    handleMenuLevelClick(lvl);
                  }}
                  key={lvl}
                  $active={selectedLevel === lvl}
                  style={{ color: selectedLevel === lvl ? "rgba(49, 196, 141, 1)" : "" }}
                >
                  <div
                    style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <span style={{ textAlign: "left" }}>{lvl}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span>{levelInfo(lvl)}</span>
                    </div>
                  </div>
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
                  $active={selectedSubLevel === lvl}
                  style={{
                    color: selectedSubLevel === lvl ? "rgba(49, 196, 141, 1)" : "",
                  }}
                >
                  <div
                    style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <span style={{ textAlign: "left" }}>{lvl}</span>
                    <span>{subLevelScoreText(lvl)}</span>
                  </div>
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
