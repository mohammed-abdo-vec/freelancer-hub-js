import type { ReactNode } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

type Props = { children: ReactNode };

export function AppThemeProvider({ children }: Props) {
  return (
    // Dark by default; the user's choice is persisted in localStorage ("mui-mode")
    <ThemeProvider theme={theme} defaultMode="dark" disableTransitionOnChange>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
}
