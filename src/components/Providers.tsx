"use client";

import React from "react";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/redux/store";
import { ThemeProvider } from "@/components/theme-provider";

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </ReduxProvider>
  );
}

export default Providers;



