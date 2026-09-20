import { toApiDialCode } from "@/shared/utils/international-phone";

import type { SecurityMember, SecurityMemberStatus } from "../../types";
import type { CreateFrontDeskInput } from "../mutations/front-desk-create";
import type { FrontDeskListRowNode } from "../queries/front-desk-list";

const STATUSES: SecurityMemberStatus[] = ["active", "inactive", "pending", "rejected"];

export function mapFrontDeskStatus(status: string | null | undefined): SecurityMemberStatus {
  if (status && STATUSES.includes(status as SecurityMemberStatus)) {
    return status as SecurityMemberStatus;
  }
  return "pending";
}

export function mapFrontDeskListRow(row: FrontDeskListRowNode): SecurityMember {
  return {
    id: row.id,
    name: row.fullName?.trim() || "",
    email: row.email?.trim() || "",
    phone: row.formattedPhoneNumber?.trim() || "",
    ...(row.countryCode ? { countryCode: row.countryCode } : {}),
    status: mapFrontDeskStatus(row.status),
    registeredAt: "",
  };
}

export function toFrontDeskProfileInput(values: {
  name: string;
  email: string;
  countryCode: string;
  phone: string;
}): CreateFrontDeskInput {
  return {
    countryCode: toApiDialCode(values.countryCode),
    email: values.email.trim(),
    fullName: values.name.trim(),
    phoneNumber: values.phone.trim(),
  };
}
