import styled, { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background-color: rgba(10,12,19,255);
    color: rgb(230, 241, 255);
    font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    text-align: center;
  }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  overflow-x: hidden;
  height: 100vh;
  overflow-y: scroll;
  width: -webkit-fill-available;

  @media (min-width: 600px) {
    height: 100vh;
  }
  @media (max-width: 600px) {
    padding: 0;
  }
`;

export const MobileMenu = styled.div`
  display: none;
  @media (min-width: 600px) {
    display: none;
  }
`;

export const SideMenu = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  overflow-x: hidden;
  overscroll-behavior: contain;
  height: 100vh;
  width: 500px;

  @media (max-width: 600px) {
    width: 100vw;
    position: absolute;
    background: rgb(10, 12, 19);
    z-index: 100;
  }
  border-right: 1px solid #333;
`;

export const Image = styled.img`
  border-radius: 5px;
  height: 45px;
`;
export const HeaderStyle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;

  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: space-between;
  width: -webkit-fill-available;
  background-color: rgba(20, 23, 34, 255);
  height: 80px;
  padding: 5px 10px 5px 10px;
  @media (max-width: 600px) {
    flex-direction: column;
    height: fit-content;
  }
`;
export const LevelOptions = styled.div`
  border-bottom: 1px solid #333;
  transition: height 0.3s ease;
`;

export const Label = styled.label`
  margin-right: 10px;
  color: #e0e0e0;
`;

export const Select = styled.select`
  padding: 6px;
  border: none;
  border-radius: 4px;
  background-color: rgba(20, 23, 34, 255);
  color: #e0e0e0;
  font-size: 18px;
  text-align: center;
  margin: 0 0 10px 0;
  width: 100%;
`;

export const TextArea = styled.textarea`
  padding: 8px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  background-color: rgba(20, 23, 34, 255);
  color: #e0e0e0;
  width: 90%;
  height: 200px;
`;
export const TextInput = styled.input`
  padding: 8px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  background-color: rgba(10, 12, 20, 255);
  color: #e0e0e0;
  width: -webkit-fill-available;
  outline: 1px solid rgb(255 255 255 / 0.1);
`;

export const Button = styled.button`
  position: relative;
  border: none;
  background-color: #333;
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    background-color: #444;
  }
  width: 50px;
  height: 50px;

  font-size: 24px;
  border-radius: 100%;
  padding: 10px;
  color: black;
  -webkit-text-fill-color: black;
`;

export const MenuButton = styled.button`
  padding: 8px;
  border: none;
  border-radius: 4px;
  background-color: rgba(51, 51, 51, 0.4);
  color: #e0e0e0;
  cursor: pointer;
  width: fit-content;
  min-width: 60px;
  white-space: nowrap;
  font-size: 24px;
  &:hover {
    background-color: rgba(51, 51, 51, 0.8);
  }
  &:disabled {
    background-color: rgba(51, 51, 51, 0.2);
    color: rgba(57, 143, 106, 0.3) !important;
  }

  margin: 5px;
`;

export const Table = styled.div`
  border-collapse: collapse;
  table-layout: fixed;
  max-width: none;
  margin: 0;
  height: -webkit-fill-available;
  overflow-y: scroll;
  width: -webkit-fill-available;
  overflow-x: hidden;
  margin-top: 10px;
`;

export const TableRow = styled.div`
  max-width: 100vw;
  width: -webkit-fill-available;
  align-content: center;
  @media (min-width: 600px) {
    margin: 15px;
  }
  display: flex;
  flex-direction: column;
  align-items: center;
  // overflow: hidden;
  padding-top: 3px;
  padding-bottom: 3px;
`;

export const StickyHeaderRow = styled(TableRow)`
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: rgba(10, 12, 19, 1);
  padding-bottom: 15px;
  @media (min-width: 600px) {
    margin: 0px 15px 15px 15px;
  }
`;

export const TableCell = styled.div`
  vertical-align: middle;
  flex: 1;
  // margin-top: 10px;

  align-items: center;
  justify-content: center;
  display: block;
`;

export const FeedBackTableCell = styled.div`
  vertical-align: middle;
  display: flex;
  flex: 1;
  min-height: 1.2em;
  align-items: center;
  // margin-top: 10px;
  justify-content: flex-end;
`;

export const TextAreaButtonWrapper = styled.div`
  display: flex;
  Button {
    margin: 5px;
  }
`;

export const SettingsButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 5px;
  Button {
    margin: 5px;
  }
`;

export const NavWrapper = styled.div`
  display: flex;
  flex-direction: column;
  Button {
    margin: 5px;
  }
`;

export const TextAreaWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin-top: 10px;
  width: 100%;

  // margin: 5px 0px 5px 0;

  @media (max-width: 600px) {
    align-items: center;
  }
`;

export const HeaderButtonWrapper = styled.div`
  display: flex;
  align-items: end;
  justify-content: center;
  flex-direction: column;
  margin: 50px;
  width: 100%;

  margin: 5px 0px 5px 0;

  @media (max-width: 600px) {
    align-items: center;
  }
`;

export const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: -webkit-fill-available;
  justify-content: space-between;
`;

export const FeedbackSpan = styled.span<{ $correct: boolean }>`
  color: ${(props) => (props.$correct ? "rgba(49, 196, 141, 1)" : "rgba(236, 80, 80, 1)")};
  margin-right: 0px;
`;

export const TitleSpan = styled.span<{ $correct: boolean }>`
  color: ${(props) => (props.$correct ? "rgba(49, 196, 141, 1)" : "rgba(236, 80, 80, 1)")};
  margin: 0px 0px 0px 0px;
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol",
    "Noto Color Emoji";
  font-weight: bolder;
`;

export const LevelSelect = styled.div`
  transition: height 0.3s ease;
  width: -webkit-fill-available;
  margin-bottom: 5px;
`;

export const SubLevelOptionItem = styled.div`
  margin-top: 5px;
  padding: 8px;
  // min-width: 300px;
  // border-bottom: 1px solid #333;
  border-radius: 5px;
  background: rgba(20, 23, 34, 255);
  &:hover {
    background: rgba(20, 23, 34, 0.4);
  }
  justify-content: space-between;
  display: flex;
`;

export const SpeechContainer = styled.div`
  margin: 15px;
`;

export const SelectedHeader = styled.div`
  text-align: left;
  padding: 15px;
  margin: 5px 0px 5px 0px;
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: 12px;
  height: fit-content;
  width: 50%;
  @media (max-width: 600px) {
    width: 90%;
  }
`;

export const ProgressBarContainer = styled.div`
  width: 100%;
  background-color: rgb(32, 34, 44);
  border-radius: 8px;
  height: 10px;
  margin-top: 15px;
  overflow: hidden;
`;

export const ProgressBarFill = styled.div<{ $width: number }>`
  height: 100%;
  background-color: rgba(49, 196, 141, 1);
  transition: width 0.3s ease-in-out;
  width: ${(props) => props.$width}%;
`;

export const CollapsibleWrapper = styled.div<{ $isOpen: boolean }>`
  display: flex;
  overflow: hidden;
  max-width: ${(props) => (props.$isOpen ? "1000px" : "0px")};
  opacity: ${(props) => (props.$isOpen ? "1" : "0")};
  transition: max-width 0.4s ease-out, opacity 0.3s ease;
  flex-wrap: nowrap;
  align-items: center;
`;
export const VerticalCollapsibleWrapper = styled.div<{ $isOpen: boolean }>`
  width: 100%;
  overflow: ${(props) => (props.$isOpen ? "visible" : "hidden")};
  max-height: ${(props) => (props.$isOpen ? "500px" : "0px")};
  opacity: ${(props) => (props.$isOpen ? "1" : "0")};
  transition: max-height 0.4s ease-out, opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
