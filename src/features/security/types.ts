export type SecurityMemberStatus = "active" | "inactive" | "pending" | "rejected";

export type SecurityMember = {
  id: string;
  name: string;
  email: string;
  phone: string;
  countryCode?: string;
  status: SecurityMemberStatus;
  registeredAt: string;
  rejectionReason?: string;
};
