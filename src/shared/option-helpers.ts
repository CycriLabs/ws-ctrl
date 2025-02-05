/**
 * This function checks if the user has provided an input to an option.
 *
 * @param option The option input to check.
 * @returns True if the user has provided an input, false otherwise.
 */
export function hasUserInput(
  option: string | boolean | undefined
): option is string | boolean {
  return (
    (typeof option === 'string' && !!option.trim()) ||
    typeof option === 'boolean'
  );
}
