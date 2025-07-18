import styled, { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background-color: #121212;
    color: #e0e0e0;
    font-family: sans-serif;
  }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  width: 100vw;
  overflow: hidden;

  @media (max-width: 600px) {
    padding: 0;
  }
`;

export const Image = styled.img`
  border-radius: 5px;
`;
export const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  flex-direction: column;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const Label = styled.label`
  margin-right: 10px;
  color: #e0e0e0;
`;

export const Select = styled.select`
  margin-right: 20px;
  padding: 6px;
  border: none;
  border-radius: 4px;
  background-color: #1e1e1e;
  color: #e0e0e0;
  font-size: 18px;
  text-align: center;

  @media (max-width: 600px) {
    margin: 0 0 10px 0;
    width: 100%;
  }
`;

export const TextArea = styled.textarea`
  padding: 8px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  background-color: #1e1e1e;
  color: #e0e0e0;
  width: -webkit-fill-available;
`;
export const TextInput = styled.input`
  padding: 8px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  background-color: #1e1e1e;
  color: #e0e0e0;
  width: 300px;
  margin-right: 10px;
`;

export const Button = styled.button`
  padding: 8px;
  border: none;
  border-radius: 4px;
  background-color: #333;
  color: #e0e0e0;
  cursor: pointer;
  width: fit-content;
  white-space: nowrap;
  &:hover {
    background-color: #444;
  }

  @media (min-width: 600px) {
    margin: 5px;
  }
`;

export const Table = styled.table`
  border-collapse: collapse;
  table-layout: fixed;
  margin: 0 auto;
  max-width: 80%;
  @media (max-width: 600px) {
    max-width: none;
    width: 100vw;
    margin: 0;
  }
`;

export const TableRow = styled.tr`
  border-bottom: 1px solid #333;
  max-width: 100vw;
  width: 100%;

  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-content: center;

  @media (max-width: 600px) {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    align-items: center;
    overflow: hidden;
    padding: 3px;
  }
`;

export const TableColGroup = styled.colgroup`
  display: flex;
  col {
    width: 33%;
    flex: 1; /* each .col takes equal share of available space */
    /* optional spacing */
    padding: 0 10px;
  }
`;

export const TableCell = styled.td`
  padding: 10px;
  vertical-align: middle;
  text-align: center;
  flex: 1;

  @media (min-width: 600px) {
    align-items: center;
    justify-content: center;
    display: flex;
  }
  @media (max-width: 600px) {
    display: block;
    width: 95vw;
    text-align: left;
    padding: 8px 10px;
  }
`;

export const FeedBackTableCell = styled.td`
  padding: 10px;
  vertical-align: middle;
  text-align: center;
  display: flex;
  flex-wrap: wrap;
  margin: 10px;
  flex: 1;

  @media (min-width: 600px) {
    align-items: center;
    justify-content: center;
    display: flex;
  }

  @media (max-width: 600px) {
    width: 95vw;
    text-align: left;
    padding: 8px 10px;
    margin: unset;
  }
`;

export const TextAreaButtonWrapper = styled.div`
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
  @media (min-width: 600px) {
    flex-direction: column;
  }
  @media (max-width: 600px) {
    align-items: stretch;
  }
`;

export const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 600px) {
    align-items: stretch;
  }
`;

export const FeedbackSpan = styled.span<{ $correct: boolean }>`
  color: ${(props) => (props.$correct ? "#00ff00" : "#ff4444")};
  margin-right: 4px;
`;
