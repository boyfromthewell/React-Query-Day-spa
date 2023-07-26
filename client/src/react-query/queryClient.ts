import { createStandaloneToast } from '@chakra-ui/react';
import { QueryCache, QueryClient } from '@tanstack/react-query';

import { theme } from '../theme';

const toast = createStandaloneToast({ theme });

function queryErrorHandler(error: unknown): void {
  // error is type unknown because in js, anything can be an error (e.g. throw(5))
  const title =
    error instanceof Error ? error.message : 'error connecting to server';

  toast({ title, status: 'error', variant: 'subtle', isClosable: true });
}

// to satisfy typescript until this file has uncommented contents
export const queryClient = new QueryClient({
  // set default options
  // 정보의 변동이 적거나 사용자 세션 동안 정보 변동이 거의 없는 treatments, staffs는 괜찮음
  // appointments는 실시간으로 정보가 업데이트 되는것이 중요
  defaultOptions: {
    queries: {
      staleTime: 60000,
      cacheTime: 90000,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  },
  queryCache: new QueryCache({
    onError: queryErrorHandler,
  }),
});
