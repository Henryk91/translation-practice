import React from "react";
import { HeaderStyle, Label, MobileMenu, Select, Image, TitleSpan } from "../helpers/style";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SubLevelOption } from "../helpers/subLevel";

interface HeaderProps {
  handleLevelChange: (level: string) => void;
  handleSubLevelChange: (subLevel: string) => void;
  selectedLevel: string | undefined;
  levels: string[];
  subLevels: string[] | undefined;
  selectedSubLevel: string | undefined;
  mode: string;
  setMode: (mode: "easy" | "hard") => void;
}

const Header: React.FC<HeaderProps> = ({
  handleLevelChange,
  handleSubLevelChange,
  selectedLevel,
  levels,
  subLevels,
  selectedSubLevel,
  mode,
  setMode,
}) => {
  const eventHandleSubLevelChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    handleSubLevelChange(e.target.value);
  };

  const eventHandleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    handleLevelChange(e.target.value);
  };

  return (
    <HeaderStyle>
      <div className="image-wrapper">
        <Image src={process.env.PUBLIC_URL + "/logo192.png"} alt="App Logo" />
        <div style={{ display: "flex", flexDirection: "row", width: "fit-content" }}>
          <TitleSpan $correct={false}>Translate</TitleSpan> <span>to</span>{" "}
          <TitleSpan $correct={true}> German </TitleSpan>
        </div>
        <label htmlFor="toggle" className="menu-button">
          <FontAwesomeIcon icon={faBars} />
        </label>
      </div>
      <MobileMenu>
        <Label>Level:</Label>
        <Select value={selectedLevel || "Select your Language Level"} onChange={eventHandleLevelChange}>
          <option disabled>Select your Language Level</option>
          {levels.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl.toUpperCase()}
            </option>
          ))}
        </Select>
        {subLevels && (
          <>
            <Select value={selectedSubLevel || "Select Sub Level"} onChange={eventHandleSubLevelChange}>
              <option disabled>Select Sub Level</option>
              {subLevels?.map((lvl) => (
                <SubLevelOption key={lvl} selectedLevel={selectedLevel} subLevel={lvl} />
              ))}
            </Select>
          </>
        )}
        {selectedLevel !== "Own Sentences" && (
          <>
            <Label>Mode:</Label>
            <Select value={mode} onChange={(e: any) => setMode(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="hard">Hard</option>
            </Select>
          </>
        )}
      </MobileMenu>
    </HeaderStyle>
  );
};

export default Header;
