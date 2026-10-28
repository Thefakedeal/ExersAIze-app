/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  light: {
    // Text
    text: "#171717",
    textSecondary: "#626B67",
    textTertiary: "#858D89",
    textDisabled: "#A4ADA8",
    textOnPrimary: "#FFFFFF",
    textOnSecondary: "#FFFFFF",
    textOnAccent: "#171717",
    textLink: "#0F5D4A",

    // Backgrounds
    background: "#F7F9F7",
    backgroundElement: "#FFFFFF",
    backgroundSecondary: "#EEEEEE",
    backgroundTertiary: "#E5EAE7",
    backgroundSelected: "#D9EAE3",
    backgroundDisabled: "#E5E7E5",
    backgroundOverlay: "rgba(23, 23, 23, 0.5)",

    // Primary
    primary: "#0F5D4A",
    primaryPressed: "#0A4437",
    primaryHover: "#0C4F3F",
    primaryLight: "#EDF4F0",
    primaryDisabled: "#A3C5B8",

    // Secondary
    secondary: "#626B67",
    secondaryPressed: "#48534D",
    secondaryHover: "#545D58",
    secondaryLight: "#EEEEEE",
    secondaryDisabled: "#C5CBC7",

    // Accent
    accent: "#D99A36",
    accentPressed: "#B77B22",
    accentHover: "#C88A2D",
    accentLight: "#FBF0DC",
    accentDisabled: "#E8D0A6",

    // Borders and separators
    border: "#D9DEDB",
    borderStrong: "#A4ADA8",
    borderFocus: "#0F5D4A",
    separator: "#EEEEEE",

    // Interactive elements
    inputBackground: "#FFFFFF",
    inputBorder: "#D9DEDB",
    inputBorderFocused: "#0F5D4A",
    inputPlaceholder: "#858D89",
    switchTrack: "#D9DEDB",
    switchTrackActive: "#0F5D4A",
    switchThumb: "#FFFFFF",
    checkboxBackground: "#FFFFFF",
    checkboxBorder: "#A4ADA8",
    checkboxChecked: "#0F5D4A",

    // Status
    success: "#067647",
    successLight: "#E7F6EC",
    successBorder: "#ABEFC6",

    error: "#B42318",
    errorLight: "#FEECEB",
    errorBorder: "#FDA29B",

    warning: "#946200",
    warningLight: "#FFF4D6",
    warningBorder: "#E8C66A",

    info: "#175CD3",
    infoLight: "#EFF8FF",
    infoBorder: "#B2DDFF",

    // Charts and workout tracking
    chartPrimary: "#0F5D4A",
    chartSecondary: "#D99A36",
    chartTertiary: "#5486A8",
    chartQuaternary: "#9B7EBD",
    chartGrid: "#D9DEDB",

    // Miscellaneous
    shadow: "#171717",
    scrim: "rgba(23, 23, 23, 0.32)",
    skeleton: "#E5EAE7",
    progressTrack: "#D9DEDB",
    progressFill: "#0F5D4A",
  },

  dark: {
    // Text
    text: "#FFFFFF",
    textSecondary: "#A4ADA8",
    textTertiary: "#858D89",
    textDisabled: "#626B67",
    textOnPrimary: "#171717",
    textOnSecondary: "#FFFFFF",
    textOnAccent: "#171717",
    textLink: "#8AC8AC",

    // Backgrounds
    background: "#171717",
    backgroundElement: "#202522",
    backgroundSecondary: "#252B28",
    backgroundTertiary: "#303834",
    backgroundSelected: "#173C32",
    backgroundDisabled: "#303834",
    backgroundOverlay: "rgba(0, 0, 0, 0.65)",

    // Primary
    primary: "#8AC8AC",
    primaryPressed: "#66AD90",
    primaryHover: "#9BD5BA",
    primaryLight: "#252F2A",
    primaryDisabled: "#40594D",

    // Secondary
    secondary: "#A4ADA8",
    secondaryPressed: "#C1C9C4",
    secondaryHover: "#B5BDB8",
    secondaryLight: "#303834",
    secondaryDisabled: "#48534D",

    // Accent
    accent: "#F4D18B",
    accentPressed: "#E8B95E",
    accentHover: "#F7DDA5",
    accentLight: "#3A3020",
    accentDisabled: "#655333",

    // Borders and separators
    border: "#48534D",
    borderStrong: "#626B67",
    borderFocus: "#8AC8AC",
    separator: "#303834",

    // Interactive elements
    inputBackground: "#202522",
    inputBorder: "#48534D",
    inputBorderFocused: "#8AC8AC",
    inputPlaceholder: "#858D89",
    switchTrack: "#48534D",
    switchTrackActive: "#8AC8AC",
    switchThumb: "#171717",
    checkboxBackground: "#202522",
    checkboxBorder: "#626B67",
    checkboxChecked: "#8AC8AC",

    // Status
    success: "#75D9A4",
    successLight: "#18372A",
    successBorder: "#286747",

    error: "#FDA29B",
    errorLight: "#442321",
    errorBorder: "#7A271A",

    warning: "#F4D06F",
    warningLight: "#3A3020",
    warningBorder: "#655333",

    info: "#84CAFF",
    infoLight: "#172D43",
    infoBorder: "#1849A9",

    // Charts and workout tracking
    chartPrimary: "#8AC8AC",
    chartSecondary: "#F4D18B",
    chartTertiary: "#84CAFF",
    chartQuaternary: "#C3A6E8",
    chartGrid: "#303834",

    // Miscellaneous
    shadow: "#000000",
    scrim: "rgba(0, 0, 0, 0.55)",
    skeleton: "#303834",
    progressTrack: "#303834",
    progressFill: "#8AC8AC",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
