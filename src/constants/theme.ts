/** Light and dark palettes. Keep both modes in sync — `ThemeColor` is their intersection. */

import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  light: {
    // Text
    text: "#292D28",
    textSecondary: "#6F756B",
    textTertiary: "#92978D",
    textOnPrimary: "#FFFFFF",

    // Backgrounds
    background: "#F7F5EF",
    backgroundElement: "#FFFDF9",
    backgroundSecondary: "#EFECE3",
    /** Shares its value with primaryLight by design. */
    backgroundSelected: "#E8EFE6",
    backgroundOverlay: "rgba(41, 45, 40, 0.5)",

    // Primary
    primary: "#718B75",
    primaryLight: "#E8EFE6",
    primaryDisabled: "#B9C8B8",

    // Borders
    border: "#DEDCD1",

    // Accent (graphics only)
    accent: "#C98262",

    // Status
    error: "#B94D45",
    errorLight: "#F8EAE7",
    errorBorder: "#E8B5AD",
  },

  dark: {
    // Text
    text: "#F2F0E9",
    textSecondary: "#B8BBAF",
    textTertiary: "#92978D",
    textOnPrimary: "#202A21",

    // Backgrounds
    background: "#1C211D",
    backgroundElement: "#252C26",
    backgroundSecondary: "#2C342D",
    /** Shares its value with primaryLight by design. */
    backgroundSelected: "#334638",
    backgroundOverlay: "rgba(0, 0, 0, 0.65)",

    // Primary
    primary: "#A8C4A9",
    primaryLight: "#334638",
    primaryDisabled: "#526B56",

    // Borders
    border: "#465047",

    // Accent (graphics only)
    accent: "#D99A79",

    // Status
    error: "#E99A91",
    errorLight: "#402725",
    errorBorder: "#78443D",
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
