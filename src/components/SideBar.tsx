import React, { useMemo } from "react";
import { LevelOptions, LevelSelect, MenuButton, SideMenu, SubLevelOptionItem } from "../style";
import { Level as defaultLevels } from "../types";

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
      const score = localStorage.getItem(`${selectedLevel}-${lvl}`) || null;
      return score ? `(${score}%)` : "";
    },
    [selectedLevel]
  );

  return (
    <SideMenu>
      <LevelSelect>
        <p style={{ borderBottom: "1px solid #333", paddingBottom: "10px", width: "100%", fontSize: "20px" }}>
          Levels Selected: <br />
          <span style={{ color: "green" }}>
            {selectedLevel ? `${selectedLevel} ${levelScoreText(selectedLevel)}` : ""} {}
          </span>
        </p>
        <MenuButton
          style={{ fontSize: "15px" }}
          onClick={() => {
            setShowLevels(!showLevels);
          }}
        >
          {showLevels ? "Hide Options" : "Show Level Options"}
        </MenuButton>
        {showLevels && (
          <LevelOptions>
            {Object.values(levels as defaultLevels).map((lvl) => (
              <SubLevelOptionItem
                onClick={() => {
                  setShowLevels(false);
                  handleLevelChange(lvl as any);
                }}
                key={lvl}
                style={{ margin: "0 10px", color: selectedLevel === lvl ? "green" : "" }}
              >
                <span style={{ textAlign: "left" }}>{lvl}</span> <span>{levelScoreText(lvl)}</span>
              </SubLevelOptionItem>
            ))}
          </LevelOptions>
        )}
      </LevelSelect>

      {subLevels && !showLevels && (
        <div>
          <p style={{ borderTop: "1px solid #333", paddingTop: "10px", minWidth: "300px", fontSize: "20px" }}>
            Sub Levels: <br />
          </p>
          {Object.values(subLevels as defaultLevels).map((lvl) => (
            <SubLevelOptionItem
              onClick={() => handleSubLevelChange(lvl as any)}
              key={lvl}
              style={{
                color: selectedSubLevel === lvl ? "green" : "",
              }}
            >
              <span style={{ textAlign: "left" }}>{lvl}</span> <span>{subLevelScoreText(lvl)}</span>
            </SubLevelOptionItem>
          ))}
        </div>
      )}
    </SideMenu>
  );
};

export default SideBar;
