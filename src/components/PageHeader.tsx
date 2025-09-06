import React from "react";
import { SelectedHeader, TableRow } from "../helpers/style";

interface PageHeaderProps {
  selectedLevel: string | undefined;
  selectedSubLevel: string | undefined;
}

const PageHeader: React.FC<PageHeaderProps> = ({ selectedLevel, selectedSubLevel }) => {
  if (selectedLevel === "Own Sentences") return <></>;
  return (
    <TableRow>
      <SelectedHeader>
        {selectedLevel ? (
          <>
            <div>
              Level: <span style={{ fontWeight: "bold" }}>{selectedLevel}</span>
            </div>
            {selectedSubLevel ? (
              <div>
                Sub Level: <span style={{ fontWeight: "bold" }}>{selectedSubLevel}</span>
              </div>
            ) : (
              <h3>Please select a sub level to start</h3>
            )}
          </>
        ) : (
          <>
            <p>Please select a Level and Sub Level from the menue to start</p>
          </>
        )}
      </SelectedHeader>
    </TableRow>
  );
};

export default PageHeader;
