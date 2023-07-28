import { Spinner, Text } from '@chakra-ui/react';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { ReactElement } from 'react';

export function Loading(): ReactElement {
  // 현재 가져오는 쿼리의 정수값 반환
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  const display = isFetching || isMutating ? 'inherit' : 'none';

  return (
    <Spinner
      thickness="4px"
      speed="0.65s"
      emptyColor="olive.200"
      color="olive.800"
      role="status"
      position="fixed"
      zIndex="9999"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
      display={display}
    >
      <Text display="none">Loading...</Text>
    </Spinner>
  );
}
