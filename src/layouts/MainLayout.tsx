import React, { ReactNode } from "react";
import SideBar from "../features/navigation/SideBar";
import { GlobalStyle } from "../helpers/style";

interface MainLayoutProps {
  children: ReactNode;
  handleLevelChange: (level: string) => void;
  handleSubLevelChange: (subLevel: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, handleLevelChange, handleSubLevelChange }) => {
  return (
    <>
      <GlobalStyle />
      <section style={{ display: "flex" }}>
        <input type="checkbox" id="toggle" hidden></input>
        <SideBar handleLevelChange={handleLevelChange} handleSubLevelChange={handleSubLevelChange} />
        {children}
      </section>
    </>
  );
};

export default MainLayout;
