import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';

interface OptimisticOrderContext {
  previousOrders: unknown;
}

export function useOptimisticOrder(queryKey: QueryKey) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mutation: () => Promise<unknown>) => mutation(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previousOrders = queryClient.getQueryData(queryKey);
      return { previousOrders };
    },
    onError: (_err, _vars, context) => {
      if ((context as OptimisticOrderContext)?.previousOrders) {
        queryClient.setQueryData(queryKey, (context as OptimisticOrderContext).previousOrders);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
