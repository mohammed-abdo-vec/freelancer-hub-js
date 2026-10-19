import { createTheme } from "@mui/material/styles";

// Material Design 3 baseline tonal palette (m3.material.io/styles/color).
// Light uses the 40 tones, dark uses the 80 tones of the same key colors.
export const theme = createTheme({
  cssVariables: {
    // Toggles `.light` / `.dark` on <html>, so no flash and no re-render on switch
    colorSchemeSelector: "class",
  },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#6750A4", contrastText: "#FFFFFF" },
        secondary: { main: "#625B71", contrastText: "#FFFFFF" },
        error: { main: "#B3261E", contrastText: "#FFFFFF" },
        background: { default: "#FEF7FF", paper: "#F3EDF7" },
        text: { primary: "#1D1B20", secondary: "#49454F" },
        divider: "#CAC4D0",
      },
    },
    dark: {
      palette: {
        primary: { main: "#D0BCFF", contrastText: "#381E72" },
        secondary: { main: "#CCC2DC", contrastText: "#332D41" },
        error: { main: "#F2B8B5", contrastText: "#601410" },
        background: { default: "#141218", paper: "#211F26" },
        text: { primary: "#E6E0E9", secondary: "#CAC4D0" },
        divider: "#49454F",
      },
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    button: { textTransform: "none", fontWeight: 500 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 20 } }, // M3 full-pill buttons
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
    },
  },
});
