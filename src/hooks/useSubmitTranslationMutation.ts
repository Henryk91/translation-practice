import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServices } from "../providers/ServiceProvider";
import { TranslationScore, ScorePayload } from "../types";

export const useSubmitTranslationMutation = () => {
  const { translationService } = useServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ScorePayload) => translationService.setTranslationScore(payload),
    onMutate: async (newScore) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["translationScores"] });

      // Snapshot the previous value
      const previousScores = queryClient.getQueryData<TranslationScore[]>(["translationScores"]);

      // Optimistically update
      if (previousScores) {
        queryClient.setQueryData<TranslationScore[]>(["translationScores"], (old) => {
          if (!old) return [{ exerciseId: newScore.exerciseId, score: newScore.score }];
          const index = old.findIndex((s) => s.exerciseId === newScore.exerciseId);
          if (index !== -1) {
            const updated = [...old];
            updated[index] = { ...updated[index], score: newScore.score };
            return updated;
          } else {
            return [...old, { exerciseId: newScore.exerciseId, score: newScore.score }];
          }
        });
      }

      return { previousScores };
    },
    onError: (err, newScore, context) => {
      if (context?.previousScores) {
        queryClient.setQueryData(["translationScores"], context.previousScores);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["translationScores"] });
    },
  });
};
