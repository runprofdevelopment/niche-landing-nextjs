"use client";

import { useMutation } from "@apollo/client";

import {
  SET_USER_STATUS_MUTATION,
  type GenericStatus,
  type SetUserStatusMutationData,
  type SetUserStatusMutationVariables,
} from "../mutations/set-user-status";
import {
  USER_ASSIGN_ROLE_MUTATION,
  type UserAssignRoleMutationData,
  type UserAssignRoleMutationVariables,
} from "../mutations/user-assign-role";
import {
  USER_DESTROY_MUTATION,
  type UserDestroyMutationData,
  type UserDestroyMutationVariables,
} from "../mutations/user-destroy";
import {
  USER_UPDATE_MUTATION,
  type UpdateUserInput,
  type UserUpdateMutationData,
  type UserUpdateMutationVariables,
} from "../mutations/user-update";

type UseUserMutationsOptions = {
  /** Named operations to refetch after update, destroy, or status changes. */
  refetchQueries?: string[] | undefined;
};

export function useUserMutations(options: UseUserMutationsOptions = {}) {
  const refetchQueries = options.refetchQueries ?? [];
  const mutationOptions =
    refetchQueries.length > 0 ? { refetchQueries, awaitRefetchQueries: true } : {};

  const [destroyMutation, destroyState] = useMutation<
    UserDestroyMutationData,
    UserDestroyMutationVariables
  >(USER_DESTROY_MUTATION, mutationOptions);
  const [updateMutation, updateState] = useMutation<
    UserUpdateMutationData,
    UserUpdateMutationVariables
  >(USER_UPDATE_MUTATION, mutationOptions);
  const [assignRoleMutation, assignRoleState] = useMutation<
    UserAssignRoleMutationData,
    UserAssignRoleMutationVariables
  >(USER_ASSIGN_ROLE_MUTATION, mutationOptions);
  const [setStatusMutation, statusState] = useMutation<
    SetUserStatusMutationData,
    SetUserStatusMutationVariables
  >(SET_USER_STATUS_MUTATION, mutationOptions);

  return {
    destroying: destroyState.loading,
    updating: updateState.loading,
    assigningRole: assignRoleState.loading,
    updatingStatus: statusState.loading,
    destroyUser: async (id: string) => {
      const result = await destroyMutation({ variables: { userDestroyId: id } });
      return result.data?.userDestroy ?? null;
    },
    updateUser: async (id: string, data: UpdateUserInput) => {
      const result = await updateMutation({ variables: { userUpdateId: id, data } });
      return result.data?.userUpdate ?? null;
    },
    assignUserRoles: async (id: string, roleIds: string[]) => {
      const result = await assignRoleMutation({
        variables: { userAssignRoleId: id, roleIds },
      });
      return result.data?.userAssignRole ?? null;
    },
    setUserStatus: async (id: string, status: GenericStatus) => {
      const result = await setStatusMutation({
        variables: { setUserStatusId: id, status },
      });
      return result.data?.setUserStatus ?? null;
    },
  };
}
