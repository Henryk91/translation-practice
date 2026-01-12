import React from "react";
import styled from "styled-components";
import { ProgressBarContainer, ProgressBarFill } from "../helpers/style";

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
`;

interface StickyProgressBarProps {
  completed: number;
  total: number;
}

const StickyProgressBar: React.FC<StickyProgressBarProps> = ({ completed, total }) => {
  if (total === 0) return null;

  return (
    <StickyWrapper>
      <BarWrapper>
        <ProgressBarContainer style={{ marginTop: 0 }}>
          <ProgressBarFill $width={(completed / total) * 100} />
        </ProgressBarContainer>
      </BarWrapper>
    </StickyWrapper>
  );
};

export default StickyProgressBar;
