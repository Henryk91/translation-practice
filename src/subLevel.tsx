export function SubLevelOption({ selectedLevel, subLevel }: { selectedLevel: string | undefined; subLevel: string }) {
  const getLevelScore = (level: string, subLevel: string): string | null => {
    return localStorage.getItem(`${level}-${subLevel}`) || null;
  };

  const levelScoreElements = (selectedLevel: string | undefined, subLevel: string) => {
    const score = getLevelScore(selectedLevel || "", subLevel);
    return score ? `(${score}%)` : "";
  };

  return (
    <option key={subLevel} value={subLevel}>
      {levelScoreElements(selectedLevel, subLevel)} {subLevel.toUpperCase()}
    </option>
  );
}
