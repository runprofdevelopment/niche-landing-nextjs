"use client";

import { useMutation } from "@apollo/client";

import {
  CONTACT_US_COMMENT_CREATE_MUTATION,
  type ContactUsCommentCreateMutationData,
  type ContactUsCommentCreateMutationVariables,
} from "../mutations/contact-us-comment-create";
import {
  CONTACT_US_COMMENT_UPDATE_MUTATION,
  type ContactUsCommentUpdateMutationData,
  type ContactUsCommentUpdateMutationVariables,
} from "../mutations/contact-us-comment-update";
import {
  CONTACT_US_MARK_RESOLVED_MUTATION,
  type ContactUsMarkResolvedMutationData,
  type ContactUsMarkResolvedMutationVariables,
} from "../mutations/contact-us-mark-resolved";

const listAndFindRefetch = ["ContactUsList", "ContactUsFind"];
const commentRefetch = ["ContactUsCommentList"];

export function useContactUsMutations() {
  const [createCommentMutation, createCommentState] = useMutation<
    ContactUsCommentCreateMutationData,
    ContactUsCommentCreateMutationVariables
  >(CONTACT_US_COMMENT_CREATE_MUTATION, {
    refetchQueries: commentRefetch,
    awaitRefetchQueries: true,
  });

  const [updateCommentMutation, updateCommentState] = useMutation<
    ContactUsCommentUpdateMutationData,
    ContactUsCommentUpdateMutationVariables
  >(CONTACT_US_COMMENT_UPDATE_MUTATION, {
    refetchQueries: commentRefetch,
    awaitRefetchQueries: true,
  });

  const [markResolvedMutation, markResolvedState] = useMutation<
    ContactUsMarkResolvedMutationData,
    ContactUsMarkResolvedMutationVariables
  >(CONTACT_US_MARK_RESOLVED_MUTATION, {
    refetchQueries: listAndFindRefetch,
    awaitRefetchQueries: true,
  });

  return {
    creatingComment: createCommentState.loading,
    updatingComment: updateCommentState.loading,
    markingResolved: markResolvedState.loading,
    createComment: async (contactUsId: string, comment: string) => {
      const result = await createCommentMutation({
        variables: {
          data: {
            contactUsId,
            comment: comment.trim(),
          },
        },
      });
      return result.data?.contactUsCommentCreate ?? null;
    },
    updateComment: async (commentId: string, comment: string) => {
      const result = await updateCommentMutation({
        variables: {
          contactUsCommentUpdateId: commentId,
          data: {
            comment: comment.trim(),
          },
        },
      });
      return result.data?.contactUsCommentUpdate ?? null;
    },
    markResolved: async (id: string) => {
      const result = await markResolvedMutation({
        variables: { contactUsRequestMarkResolvedId: id },
      });
      return result.data?.contactUsRequestMarkResolved ?? null;
    },
  };
}
