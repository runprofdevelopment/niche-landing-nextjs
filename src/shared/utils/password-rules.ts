/**
 * Password strength rules used by set-password / initiate-password flows.
 *
 * Change the `test` regex (or `minLength`) here to update validation everywhere
 * these rules are consumed.
 */

export type PasswordRuleId = "minLength" | "uppercase" | "special" | "number";

export type PasswordRule = {
  id: PasswordRuleId;
  /** i18n key under the `auth` namespace. */
  labelKey:
    | "passwordRuleMinLength"
    | "passwordRuleUppercase"
    | "passwordRuleSpecial"
    | "passwordRuleNumber";
  /** Return true when the password satisfies this rule. */
  test: (password: string) => boolean;
};

/** Minimum length rule — change `PASSWORD_MIN_LENGTH` to adjust. */
export const PASSWORD_MIN_LENGTH = 8;

/**
 * Special-character pattern — edit this regex to change which symbols count.
 * Default: common punctuation / symbols.
 */
export const PASSWORD_SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/;'`~]/;

/** Uppercase letter pattern. */
export const PASSWORD_UPPERCASE_REGEX = /[A-Z]/;

/** Digit pattern. */
export const PASSWORD_NUMBER_REGEX = /\d/;

export const PASSWORD_RULES: readonly PasswordRule[] = [
  {
    id: "minLength",
    labelKey: "passwordRuleMinLength",
    test: (password) => password.length >= PASSWORD_MIN_LENGTH,
  },
  {
    id: "uppercase",
    labelKey: "passwordRuleUppercase",
    test: (password) => PASSWORD_UPPERCASE_REGEX.test(password),
  },
  {
    id: "special",
    labelKey: "passwordRuleSpecial",
    test: (password) => PASSWORD_SPECIAL_CHAR_REGEX.test(password),
  },
  {
    id: "number",
    labelKey: "passwordRuleNumber",
    test: (password) => PASSWORD_NUMBER_REGEX.test(password),
  },
] as const;

export type PasswordRuleResult = PasswordRule & { met: boolean };

export function evaluatePasswordRules(password: string): PasswordRuleResult[] {
  return PASSWORD_RULES.map((rule) => ({
    ...rule,
    met: rule.test(password),
  }));
}

export function isPasswordValid(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}
