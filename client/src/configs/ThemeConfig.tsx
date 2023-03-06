import {
  createTheme,
  responsiveFontSizes,
  ThemeOptions,
} from "@mui/material/styles";

declare module "@mui/material/Fab" {
  interface FabPropsVariantOverrides {
    opaque: true;
  }
}

export const theme: any = customizeComponents({
  palette: {
    common: {
      white: "#FFFFFF",
      black: "#000000",
    },
    primary: {
      light: "#E9E9E9",
      main: "#000000",
      dark: "#7B7B7B",
      contrastText: "#FFFFFF",
    },
    secondary: {
      light: "#FA8194",
      main: "#F8425F",
      dark: "#CA0726",
      contrastText: "#FFFFFF",
    },
    info: {
      light: "#74CAFF",
      main: "#1890FF",
      dark: "#0C53B7",
      contrastText: "#FFFFFF",
    },
    success: {
      light: "#AAF27F",
      main: "#54D62C",
      dark: "#229A16",
      contrastText: "#212B36",
    },
    warning: {
      light: "#FFE16A",
      main: "#FFC107",
      dark: "#B78103",
      contrastText: "#212B36",
    },
    error: {
      light: "#FFA48D",
      main: "#FF4842",
      dark: "#B72136",
      contrastText: "#212B36",
    },
    grey: {
      50: "#fafafa",
      100: "#F9FAFB",
      200: "#F4F6F8",
      300: "#DFE3E8",
      400: "#C4CDD5",
      500: "#919EAB",
      600: "#637381",
      700: "#454F5B",
      800: "#212B36",
      900: "#161C24",
    },
    action: {
      active: "#637381",
      hover: "#919EAB14",
      selected: "#919EAB29",
      disabled: "#919EAB",
      disabledBackground: "#919EAB3D",
      focus: "#919EAB3D",
    },
    text: {
      primary: "#212B36",
      secondary: "#637381",
      disabled: "#919EAB",
    },
    divider: "#919EAB3D",
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },
  typography: {
    fontFamily: ["Nunito Sans", "sans-serif"].join(),
    fontSize: 12,
    button: {
      textTransform: "none",
      fontWeight: 700,
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiInputBase-root": {
            borderRadius: 0,
          },
          "&.chatInput-variant": {
            backgroundColor: "#222",
            borderRadius: "1rem",
            "& fieldset": {
              border: "none",
            },
            "&.MuiInputBase-input-MuiOutlinedInput-input": {
              color: "#fff",
            },
          },
        },
      },
    },
    MuiPopover: {
      defaultProps: {
        PaperProps: {
          style: {
            borderRadius: 10,
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        variant: "contained",
        style: {
          borderRadius: 0,
        },
      },
    },
    MuiFab: {
      variants: [
        {
          props: { variant: "opaque" },
          style: {
            color: "#FFFFFF",
            background: "rgba(255, 255, 255, 0.3)",
          },
        },
        {
          props: { variant: "opaque", color: "error" },
          style: {
            color: "#FFFFFF",
            background: "#F8425F",
            ":hover": {
              color: "#FFFFFF",
            },
            ":active": {
              color: "#FFFFFF",
            },
          },
        },
      ],
    },
  },
});

export default responsiveFontSizes(theme);

/**
 *
 * @param {import("@mui/material").Theme} theme
 */
function customizeComponents(theme: ThemeOptions) {
  return createTheme({
    ...theme,
  });
}

[
  "primary",
  "secondary",
  "success",
  "info",
  "grey",
  "warning",
  "error",
  "common",
  "text",
  "background",
  "action",
].forEach((palatteKey) => {
  Object.keys(theme.palette[palatteKey]).forEach((palatteKeyColor) => {
    document.documentElement.style.setProperty(
      `--color-${palatteKey}-${palatteKeyColor}`,
      theme.palette[palatteKey][palatteKeyColor]
    );
  });
});
