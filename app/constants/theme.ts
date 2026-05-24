export const colors = {
  // ── Backgrounds ──────────────────────────
  background: "#111318",      // main app background
  surface: "#1C1F26",         // cards, bottom sheet
  surfaceBorder: "#2A2D35",   // card borders, dividers

  // ── Accent ───────────────────────────────
  accent: "#E8A045",          // amber — CTA, progress, highlights
  accentMuted: "#3D2E14",     // amber tint — chip backgrounds

  // ── Text ─────────────────────────────────
  textPrimary: "#FFFFFF",     // headings, large numbers
  textSecondary: "#8A8F9E",   // labels, metadata
  textMuted: "#444854",       // placeholders, disabled

  // ── Semantic ─────────────────────────────
  success: "#4CAF82",         // saved, completed
  successMuted: "#1A3D2E",    // success background
  danger: "#E05252",          // over budget, warning
  dangerMuted: "#3D1A1A",     // danger background

  // ── Tab Bar ──────────────────────────────
  tabBar: "#1C1F26",
  tabBarBorder: "#2A2D35",
  tabBarActive: "#E8A045",
  tabBarInactive: "#444854",
} as const

export const fontSize = {
  xs: 11,
  sm: 12,
  base: 13,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 28,
  display: 36,
} as const

export const fontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
} as const

export const fontFamily = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
} as const