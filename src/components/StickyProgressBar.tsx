import React from "react";
import styled from "styled-components";
import { Row } from "../helpers/types";

const StickyWrapper = styled.div`
  position: sticky;
  top: 0;
  z-index: 900;
  width: 100%;
  background-color: rgb(10, 12, 19);
  padding: 5px 0 0 0;
  display: flex;
  justify-content: center;
`;

const BarWrapper = styled.div`
  width: 90%;
  margin: 0 auto;
  display: flex;
  gap: 8px;
  align-items: center;
`;

const BlocksContainer = styled.div`
  display: flex;
  gap: 4px;
  flex: 1;
`;

const Block = styled.div<{ $status: "correct" | "incorrect" | "empty" }>`
  flex: 1;
  height: 10px;
  background-color: ${({ $status }) =>
    $status === "correct"
      ? "rgba(49, 196, 141, 1)"
      : $status === "incorrect"
      ? "rgba(236, 80, 80, 1)"
      : "rgb(32, 34, 44)"};
  border-radius: 4px;
  transition: background-color 0.3s ease-in-out;
`;

const PercentageText = styled.span`
  color: rgb(159, 179, 200);
  font-size: 12px;
  font-weight: 600;
  min-width: 30px;
  text-align: right;
`;

interface StickyProgressBarProps {
  rows: Row[];
}

const StickyProgressBar: React.FC<StickyProgressBarProps> = ({ rows }) => {
  if (!rows || rows.length === 0) return null;

  const getStatus = (row: Row) => {
    if (!row.feedback) return "empty";
    if (row.isCorrect) return "correct";
    return "incorrect";
  };

  const completedCount = rows.filter((row) => row.feedback).length;
  const percentage = Math.round((completedCount / rows.length) * 100);

  return (
    <StickyWrapper>
      <BarWrapper>
        <BlocksContainer>
          {rows.map((row, index) => (
            <Block key={index} $status={getStatus(row)} />
          ))}
        </BlocksContainer>
        <PercentageText>{percentage}%</PercentageText>
      </BarWrapper>
    </StickyWrapper>
  );
};

export default StickyProgressBar;
