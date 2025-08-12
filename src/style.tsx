import styled, { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background-color: rgba(10,12,19,255);
    color: rgba(255, 255, 255, 0.8);
    font-family: Roboto, sans-serif;
    text-align: center;
  }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  overflow: hidden;
  overflow-y: scroll;

  @media (min-width: 600px) {
    height: 100vh;
  }
  @media (max-width: 600px) {
    padding: 0;
  }
`;

export const MobileMenu = styled.div`
  @media (min-width: 600px) {
    display: none;
  }
`;

export const SideMenu = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  overflow-y: scroll;
  overscroll-behavior: contain;
  height: 100vh;
  width: 500px;

  @media (max-width: 600px) {
    display: none;
    width: 100vw;
    position: absolute;
    background: rgb(10, 12, 19);
    z-index: 100;
  }
  border-right: 1px solid #333;
`;

export const Image = styled.img`
  border-radius: 5px;
`;
export const HeaderStyle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
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
  width: 400px;
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
  outline: 0.5px solid #333;
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
  display: flex;
  justify-content: center;

  font-size: 30px;
  border-radius: 100%;
  padding: 10px;
  color: black;
  -webkit-text-fill-color: black;
`;

export const MenuButton = styled.button`
  padding: 8px;
  border: none;
  border-radius: 4px;
  background-color: #333;
  color: #e0e0e0;
  cursor: pointer;
  width: fit-content;
  min-width: 70px;
  white-space: nowrap;
  font-size: 30px;
  &:hover {
    background-color: #444;
  }

  margin: 5px;
`;

export const Table = styled.div`
  border-collapse: collapse;
  table-layout: fixed;
  max-width: none;
  width: 100vw;
  margin: 0;
`;

export const TableRow = styled.div`
  max-width: 100vw;
  width: 100%;
  align-content: center;
  @media (min-width: 600px) {
    margin: 15px;
  }
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  padding-top: 3px;
  padding-bottom: 3px;
`;

export const TableCell = styled.div`
  vertical-align: middle;
  flex: 1;
  margin-top: 10px;

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
  margin-top: 10px;
  justify-content: flex-end;
`;

export const TextAreaButtonWrapper = styled.div`
  display: flex;
  margin: 5px;
  Button {
    margin: 5px;
  }
`;

export const TextAreaWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin: 5px;
  width: 100%;
`;

export const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: -webkit-fill-available;
  justify-content: space-between;
`;

export const FeedbackSpan = styled.span<{ $correct: boolean }>`
  color: ${(props) => (props.$correct ? "#4a9c78" : "#ec3d4c")};
  margin-right: 0px;
`;

export const TitleSpan = styled.span<{ $correct: boolean }>`
  color: ${(props) => (props.$correct ? "#00ff00" : "#ff4444ff")};
  margin-right: 0px;
`;

export const LevelSelect = styled.div`
  // height: 100px;
  // overflow: hidden;
  transition: height 0.3s ease;

  // &:hover {
  //   height: 100%;
  // }
`;

export const SubLevelOptionItem = styled.div`
  margin: 0 10px;
  padding: 10px;
  min-width: 300px;
  border-bottom: 1px solid #333;
  background: rgba(20, 23, 34, 255);
  &:hover {
    background: rgba(20, 23, 34, 0.4);
  }
  justify-content: space-between;
  display: flex;
`;
