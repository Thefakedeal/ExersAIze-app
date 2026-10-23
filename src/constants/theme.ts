/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#171717",
    background: "#F7F9F7",
    backgroundElement: "#FFFFFF",
    backgroundSelected: "#D9EAE3",
    textSecondary: "#626B67",

    primary: "#0F5D4A",
    primaryPressed: "#0A4437",
    primaryLight: "#EDF4F0",
    textOnPrimary: "#FFFFFF",

    border: "#D9DEDB",
    separator: "#EEEEEE",

    accent: "#D99A36",
    success: "#067647",
    error: "#B42318",
    warning: "#946200",
  },

  dark: {
    text: "#FFFFFF",
    background: "#171717",
    backgroundElement: "#202522",
    backgroundSelected: "#173C32",
    textSecondary: "#A4ADA8",

    primary: "#8AC8AC",
    primaryPressed: "#66AD90",
    primaryLight: "#252F2A",
    textOnPrimary: "#171717",

    border: "#48534D",
    separator: "#303834",

    accent: "#F4D18B",
    success: "#75D9A4",
    error: "#FDA29B",
    warning: "#F4D06F",
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
