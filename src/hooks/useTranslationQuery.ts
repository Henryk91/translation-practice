import { useQuery } from "@tanstack/react-query";
import { useServices } from "../providers/ServiceProvider";
import { Row } from "../types";

export const useTranslationQuery = (level: string, subLevel: string) => {
  const { translationService } = useServices();

  return useQuery<Row[] | undefined>({
    queryKey: ["translations", level, subLevel],
    queryFn: () => translationService.getSentenceWithTranslation(level, subLevel),
    staleTime: Infinity, // Translations are static
    enabled: !!level && !!subLevel,
  });
};
