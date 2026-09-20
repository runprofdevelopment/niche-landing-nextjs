import type { ContactUsComment, ContactUsRequest, ContactUsStatus } from "../../types";
import type { ContactUsCommentNode } from "../queries/contact-us-comment-list";
import type { ContactUsFindNode } from "../queries/contact-us-find";
import type { ContactUsListRowNode } from "../queries/contact-us-list";

const STATUSES: ContactUsStatus[] = ["pending", "resolved"];

export function mapContactUsStatus(status: string | null | undefined): ContactUsStatus {
  const normalized = status?.trim().toLowerCase();
  if (normalized && STATUSES.includes(normalized as ContactUsStatus)) {
    return normalized as ContactUsStatus;
  }
  return "pending";
}

function mapRequestFields(
  row: ContactUsListRowNode | ContactUsFindNode,
): Omit<ContactUsRequest, "updatedAt" | "updatedBy"> {
  return {
    id: row.id,
    customerName: row.customerName?.trim() || "",
    email: row.email?.trim() || "",
    phoneNumber: row.phoneNumber?.trim() || "",
    countryCode: row.countryCode?.trim() || "",
    eventType: row.eventType?.trim() || "",
    date: row.date?.trim() || "",
    time: row.time?.trim() || "",
    message: row.message?.trim() || "",
    status: mapContactUsStatus(row.status),
    createdAt: row.createdAt?.trim() || "",
    createdBy: row.createdBy?.trim() || "",
  };
}

export function mapContactUsListRow(row: ContactUsListRowNode): ContactUsRequest {
  return mapRequestFields(row);
}

export function mapContactUsFind(row: ContactUsFindNode): ContactUsRequest {
  return {
    ...mapRequestFields(row),
    ...(row.updatedAt ? { updatedAt: row.updatedAt } : {}),
    ...(row.updatedBy ? { updatedBy: row.updatedBy } : {}),
  };
}

export function mapContactUsComment(node: ContactUsCommentNode): ContactUsComment {
  return {
    id: node.id,
    contactUsId: node.contactUsId?.trim() || "",
    comment: node.comment?.trim() || "",
    createdAt: node.createdAt?.trim() || "",
    createdBy: node.createdBy?.trim() || "",
    updatedAt: node.updatedAt?.trim() || "",
    updatedBy: node.updatedBy?.trim() || "",
    employee: node.employee
      ? {
          id: node.employee.id,
          fullName: node.employee.fullName?.trim() || "",
        }
      : null,
  };
}
