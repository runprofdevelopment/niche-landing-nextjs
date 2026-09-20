export const AUTH_DEPARTMENTS = [
  { value: "operations", label: "Operations" },
  { value: "creativity_and_design", label: "Creativity & Design" },
  { value: "accounting", label: "Accounting" },
  { value: "human_resources", label: "Human Resources" },
  { value: "it", label: "IT" },
] as const;

export type AuthDepartment = (typeof AUTH_DEPARTMENTS)[number]["value"];
