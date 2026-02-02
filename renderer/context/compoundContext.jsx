import React from "react";
import { FinalDataProvider } from "./finalBasketContext";
import { GlobalContextprovider } from "./GlobalContext";
import { HealthContextProvider } from "./healthContext";
import { RightSiderContextProvider } from "./RightSiderContext";
export const CompoundContextProvider = ({ children }) => (
  <GlobalContextprovider>
    <FinalDataProvider>
      <HealthContextProvider>

      <RightSiderContextProvider>{children}</RightSiderContextProvider>
      </HealthContextProvider>
    </FinalDataProvider>
  </GlobalContextprovider>
);
