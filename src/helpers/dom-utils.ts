export const focusNextInput = (
  currentInput: HTMLInputElement | undefined,
  refMap: Map<number, HTMLInputElement>,
  currentIndex: number,
  back: boolean = false,
): void => {
  if (!currentInput) {
    // If no current input, try to focus the first available one
    const firstInput = document.querySelector<HTMLInputElement>(".practice-input");
    firstInput?.focus();
    return;
  }

  const allInputs = Array.from(document.querySelectorAll<HTMLInputElement>(".practice-input"));
  const currentIdx = allInputs.indexOf(currentInput);

  if (currentIdx !== -1) {
    const nextIdx = back ? currentIdx - 1 : currentIdx + 1;
    const nextInput = allInputs[nextIdx];

    if (nextInput) {
      nextInput.focus();
      nextInput.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }
  }

  // Fallback to the old Map logic if DOM search fails for some reason
  const newIndex = back ? currentIndex - 1 : currentIndex + 1;
  const fallbackInput = refMap.get(newIndex);

  if (fallbackInput) {
    fallbackInput.focus();
    fallbackInput.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
};
