/** Light and dark palettes. Keep both modes in sync — `ThemeColor` is their intersection. */

import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  light: {
    // Text
    text: "#29333D",
    textSecondary: "#687783",
    textTertiary: "#96A2AC",
    textOnPrimary: "#FFFFFF",

    // Backgrounds — Soft Steel
    background: "#F2F5F7",
    backgroundElement: "#FFFFFF",
    backgroundSecondary: "#E8EDF1",
    /** Shares its value with primaryLight by design. */
    backgroundSelected: "#DCE6EE",
    backgroundOverlay: "rgba(31, 43, 54, 0.5)",

    // Primary — Steel Blue
    primary: "#527D9E",
    primaryLight: "#DCE6EE",
    primaryDisabled: "#A9BECE",

    // Borders
    border: "#D7E0E6",

    // Accent — Brushed Silver
    accent: "#B18D55",

    // Status
    error: "#C95757",
    errorLight: "#F9EAEA",
    errorBorder: "#E7B5B5",
  },

  dark: {
    // Text
    text: "#E8EDF2",
    textSecondary: "#A5B1BC",
    textTertiary: "#788693",
    textOnPrimary: "#FFFFFF",

    // Backgrounds — Carbon
    background: "#171B20",
    backgroundElement: "#212830",
    backgroundSecondary: "#2A333D",
    /** Shares its value with primaryLight by design. */
    backgroundSelected: "#344B60",
    backgroundOverlay: "rgba(0, 0, 0, 0.72)",

    // Primary — Metallic Steel Blue
    primary: "#6D9FC5",
    primaryLight: "#344B60",
    primaryDisabled: "#4D6B82",

    // Borders
    border: "#3A4652",

    // Accent — Warm Titanium
    accent: "#C5A66E",

    // Status
    error: "#F08080",
    errorLight: "#422B30",
    errorBorder: "#78444B",
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
