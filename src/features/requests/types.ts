export type ContactUsStatus = "pending" | "resolved";

export type ContactUsRequest = {
  id: string;
  customerName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  eventType: string;
  date: string;
  time: string;
  message: string;
  status: ContactUsStatus;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
};

export type ContactUsComment = {
  id: string;
  contactUsId: string;
  comment: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  employee: {
    id: string;
    fullName: string;
  } | null;
};
