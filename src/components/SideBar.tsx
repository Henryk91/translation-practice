import React, { useMemo } from "react";
import { LevelSelect, MenuButton, SideMenu, SubLevelOptionItem } from "../helpers/style";
import { Level as defaultLevels } from "../helpers/types";
import { faBars, faDoorOpen, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { logoutUser } from "../helpers/requests";
import { clearLocalScores } from "../helpers/utils";

interface SideBarProps {
  selectedLevel: string | undefined;
  levels: defaultLevels;
  levelScoreText: (level: string) => string;
  subLevels: defaultLevels;
  selectedSubLevel: string | undefined;
  handleLevelChange: (level: defaultLevels) => void;
  handleSubLevelChange: (subLevel: string) => void;
  showLevels: boolean;
  setShowLevels: (show: boolean) => void;
}

const noSubLevel: string[] = ["Incorrect Sentences", "Own Sentences"];

const SideBar: React.FC<SideBarProps> = ({
  selectedLevel,
  levels,
  levelScoreText,
  subLevels,
  selectedSubLevel,
  handleLevelChange,
  handleSubLevelChange,
  showLevels,
  setShowLevels,
}) => {
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
            <FontAwesomeIcon icon={loggedIn ? faDoorOpen : faUser} size="lg" />
            <div style={{ fontSize: "12px", color: "white" }}>{loggedIn ? "Log Out" : "Log In"}</div>
          </MenuButton>
          <p style={{ borderBottom: "1px solid #333", paddingBottom: "10px", fontSize: "20px" }}>
            Levels Selected: <br />
            <span style={{ color: "green" }}>
              {selectedLevel ? `${selectedLevel} ${levelScoreText(selectedLevel)}` : ""} {}
            </span>
          </p>
          <span style={{ minWidth: "50px" }}>
            <label htmlFor="toggle" className="sidebar-menu-button1 menu-button">
              <FontAwesomeIcon icon={faBars} size="lg" />
            </label>
          </span>
        </div>
        <MenuButton
          style={{ fontSize: "15px", backgroundColor: showLevels ? "rgba(51, 51, 51, 0.8)" : "" }}
          onClick={() => setShowLevels(true)}
        >
          Select Level
        </MenuButton>
        <MenuButton
          disabled={!!selectedLevel && noSubLevel.includes(selectedLevel)}
          style={{ fontSize: "15px", backgroundColor: !showLevels ? "rgba(51, 51, 51, 0.8)" : "" }}
          onClick={() => setShowLevels(false)}
        >
          Select Sub Level
        </MenuButton>
      </LevelSelect>
      {subLevels && !showLevels && <p id="sub-level-label">Sub Levels:</p>}
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
            {Object.values(levels as defaultLevels).map((lvl) => (
              <SubLevelOptionItem
                onClick={() => {
                  handleMenuLevelClick(lvl);
                }}
                key={lvl}
                style={{ color: selectedLevel === lvl ? "green" : "" }}
              >
                <span style={{ textAlign: "left" }}>{lvl}</span> <span>{levelScoreText(lvl)}</span>
              </SubLevelOptionItem>
            ))}
          </>
        )}
        {subLevels && !showLevels && (
          <>
            {Object.values(subLevels as defaultLevels).map((lvl) => (
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
