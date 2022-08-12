import {
  createTheme,
  alpha,
  responsiveFontSizes,
  ThemedProps,
  Theme,
} from "@mui/material/styles";

const defaultTheme = createTheme({});

export const theme = customizeComponents({
  palette: {
    common: {
      white: "#FFFFFF",
      black: "#000000",
    },
    primary: {
      lighter: "#DBF1FF",
      light: "#71B9F0",
      main: "#10519C",
      dark: "#023666",
      darker: "#002B4D",
      contrastText: "#FFFFFF",
    },
    secondary: {
      lighter: "#FDC0CA",
      light: "#FA8194",
      main: "#F8425F",
      dark: "#CA0726",
      darker: "#650413",
      contrastText: "#FFFFFF",
    },
    info: {
      lighter: "#D0F2FF",
      light: "#74CAFF",
      main: "#1890FF",
      dark: "#0C53B7",
      darker: "#04297A",
      contrastText: "#FFFFFF",
    },
    success: {
      lighter: "#E9FCD4",
      light: "#AAF27F",
      main: "#54D62C",
      dark: "#229A16",
      darker: "#08660D",
      contrastText: "#212B36",
    },
    warning: {
      lighter: "#FFF7CD",
      light: "#FFE16A",
      main: "#FFC107",
      dark: "#B78103",
      darker: "#7A4F01",
      contrastText: "#212B36",
    },
    error: {
      lighter: "#FFE7D9",
      light: "#FFA48D",
      main: "#FF4842",
      dark: "#B72136",
      darker: "#7A0C2E",
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
      "2xl": 1536,
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
  shadows: [
    "none",
    "0px 2px 3px 0px  rgba(139, 152, 165, 0.075),0px 4px 5px 0px  rgba(139, 152, 165, 0.075),0px 2px 1px -1px  rgba(139, 152, 165, 0.075)",
    "0px 2px 5px 0px rgba(145, 158, 171, 0.12),0px 2px 2px 0px rgba(145, 158, 171, 0.12),0px 3px 1px -2px rgba(145, 158, 171, 0.12)",
    "0px 2px 9px 0px rgba(145, 158, 171, 0.12),0px 1px 3px 0px rgba(145, 158, 171, 0.12),0px 3px 3px -2px rgba(145, 158, 171, 0.12)",
    "0px 4px 4px -1px rgba(145, 158, 171, 0.12),0px 0px 5px 0px rgba(145, 158, 171, 0.12),0px 1px 10px 0px rgba(145, 158, 171, 0.12)",
    "0px 6px 6px -1px rgba(145, 158, 171, 0.12),0px -1px 10px 0px rgba(145, 158, 171, 0.12),0px 1px 14px 0px rgba(145, 158, 171, 0.12)",
    "0px 6px 6px -1px rgba(145, 158, 171, 0.2),0px -2px 12px 0px rgba(145, 158, 171, 0.2),0px 1px 18px 0px rgba(145, 158, 171, 0.2)",
  ],
  components: {
    MuiTabs: {
      defaultProps: {
        variant: "scrollable",
        scrollButtons: "auto",
        allowScrollButtonsMobile: true,
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          padding: 3,
          minWidth: 10,
          marginRight: 30,
        },
      },
      defaultProps: {
        sx: {
          typography: {
            fontSize: 14,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiInputBase-root": {
            borderRadius: 8,
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
    MuiLoadingButton: {
      defaultProps: {
        variant: "contained",
        style: {
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        variant: "contained",
        style: {
          borderRadius: 8,
        },
      },
    },
    MuiChip: {
      variants: [
        {
          props: { variant: "outlined-opaque", color: "primary" },
          style: {
            backgroundColor: "#d0e6f6",
          },
        },
        {
          props: { variant: "outlined-opaque", color: "success" },
          style: {
            backgroundColor: alpha(defaultTheme.palette.success.main, 0.1),
            color: defaultTheme.palette.success.main,
          },
        },
        {
          props: { variant: "outlined-opaque", color: "error" },
          style: {
            backgroundColor: alpha(defaultTheme.palette.error.main, 0.1),
            color: defaultTheme.palette.error.main,
          },
        },
        {
          props: { variant: "outlined-opaque", color: "warning" },
          style: {
            backgroundColor: alpha(defaultTheme.palette.warning.main, 0.1),
            color: defaultTheme.palette.warning.main,
          },
        },
        {
          props: { variant: "outlined-opaque", color: "info" },
          style: {
            backgroundColor: alpha(defaultTheme.palette.info.main, 0.1),
            color: defaultTheme.palette.info.main,
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
function customizeComponents(theme: Theme) {
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

// console.log(theme);
