import type { GuestType } from "../constants";

export type RegistrationUser = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  guestType: GuestType;
  registeredAt: string;
  avatarUrl: string | null;
  status: string;
};

export type RegistrationUserDetails = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  guestType: GuestType;
  registeredAt: string;
  avatarUrl: string | null;
  status: string;
  emailVerified: boolean;
  countryCode: string;
  profileType: string;
};
