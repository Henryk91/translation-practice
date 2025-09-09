import React from "react";
import { useSelector } from "react-redux";
import { SelectedHeader, TableRow } from "../helpers/style";
import { RootState } from "../store";

const PageHeader = () => {
  const selectedLevel = useSelector((state: RootState) => state.ui.levelSelected);
  const selectedSubLevel = useSelector((state: RootState) => state.ui.subLevelSelected);

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
              <div style={{ margin: "10px 0px 0px" }}>
                Sub Level: <span style={{ fontWeight: "bold" }}>{selectedSubLevel}</span>
              </div>
            ) : (
              selectedLevel !== "Incorrect Sentences" && (
                <h3 style={{ margin: "10px 0px 0px" }}>Please select a sub level from the menu</h3>
              )
            )}
          </>
        ) : (
          <>
            <p>Please select a Level and Sub Level from the menu to start</p>
          </>
        )}
      </SelectedHeader>
    </TableRow>
  );
};

export default PageHeader;
