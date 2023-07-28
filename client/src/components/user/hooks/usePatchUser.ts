import {
  UseMutateFunction,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import jsonpatch from 'fast-json-patch';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useCustomToast } from '../../app/hooks/useCustomToast';
import { useUser } from './useUser';

// for when we need a server function
async function patchUserOnServer(
  newData: User | null,
  originalData: User | null,
): Promise<User | null> {
  if (!newData || !originalData) return null;
  // create a patch for the difference between newData and originalData
  const patch = jsonpatch.compare(originalData, newData);

  // send patched data to the server
  const { data } = await axiosInstance.patch(
    `/user/${originalData.id}`,
    { patch },
    {
      headers: getJWTHeader(originalData),
    },
  );
  return data.user;
}

// TODO: update type to UseMutateFunction type
export function usePatchUser(): UseMutateFunction<
  User,
  unknown,
  User,
  unknown
> {
  const { user, updateUser } = useUser();
  const toast = useCustomToast();
  const queryClient = useQueryClient();

  const { mutate: patchUser } = useMutation(
    (newData: User) => patchUserOnServer(newData, user),
    {
      onSuccess: (userData: User | null) => {
        if (user) {
          toast({ title: 'User updated!', status: 'success' });
          updateUser(userData);
        }
      },
      // onMutate returns context that is passed to onError
      onMutate: async (newData: User | null) => {
        // cancel any outgoing queries for user data
        // so old server data doesn't overwrite our optimistic update
        queryClient.cancelQueries([queryKeys.user]);

        // snapshot of previous user value
        const previousUserData: User = queryClient.getQueryData([
          queryKeys.user,
        ]);
        // optimistically update the cache with new user value
        updateUser(newData);
        // return context object with snapshotted value
        return { previousUserData };
      },
      onError: (error, newData, previousUserDataContext) => {
        // roll back cache to saved value
        if (previousUserDataContext.previousUserData) {
          updateUser(previousUserDataContext.previousUserData);
          toast({
            title: 'Update failed; restoring previous value',
            status: 'warning',
          });
        }
      },
      onSettled: () => {
        // invalidate user query to make suure we're in sync with server data
        queryClient.invalidateQueries([queryKeys.user]);
      },
    },
  );

  return patchUser;
}
/* 
 user triggers update with mutate
 - send update to server
 - onMutate
    - Cancel queries in progress
    - update query cache
    - save previous cache value
*/
