import { gql } from "@apollo/client";

export type PasswordResetMutationData = {
  passwordReset: boolean;
};

export const PASSWORD_RESET_MUTATION = gql`
  mutation PasswordReset($email: String!) {
    passwordReset(email: $email)
  }
`;

export type VerifyEmailMutationData = {
  verifyEmail: boolean;
};

export const VERIFY_EMAIL_MUTATION = gql`
  mutation VerifyEmail($code: String!) {
    verifyEmail(code: $code)
  }
`;

export type ResendVerificationCodeMutationData = {
  resendVerificationCode: boolean;
};

export const RESEND_VERIFICATION_CODE_MUTATION = gql`
  mutation ResendVerificationCode {
    resendVerificationCode
  }
`;
