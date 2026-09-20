"use client";

import { createContext, useContext, type ReactNode } from "react";

import { DEFAULT_PHONE_COUNTRY_CODE } from "@/shared/utils/international-phone";

const PhoneCountryContext = createContext<string>(DEFAULT_PHONE_COUNTRY_CODE);

type PhoneCountryProviderProps = {
  children: ReactNode;
  countryCode?: string | undefined;
};

export function PhoneCountryProvider({
  children,
  countryCode = DEFAULT_PHONE_COUNTRY_CODE,
}: PhoneCountryProviderProps) {
  return (
    <PhoneCountryContext.Provider value={countryCode.toUpperCase()}>
      {children}
    </PhoneCountryContext.Provider>
  );
}

export function usePhoneCountry() {
  return useContext(PhoneCountryContext);
}
