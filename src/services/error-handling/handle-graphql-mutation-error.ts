import type { Channel, ErrorContext } from "./types";
import type { UseErrorHandlerResult } from "./use-error-handler";

type MutationResultLike = {
  error?: unknown;
};

type HandleGraphQLMutationErrorOptions = {
  channels?: Channel[];
};

/**
 * Routes Apollo mutation failures to a toast when `errorPolicy: 'all'` prevents throw.
 *
 * Returns `true` when the caller should abort (error was handled).
 */
export function handleGraphQLMutationError(
  result: MutationResultLike,
  handleError: UseErrorHandlerResult["handleError"],
  context: ErrorContext,
  options: HandleGraphQLMutationErrorOptions = {},
): boolean {
  if (!result.error) {
    return false;
  }

  handleError(result.error, {
    context,
    channels: options.channels ?? ["toast"],
  });
  return true;
}
