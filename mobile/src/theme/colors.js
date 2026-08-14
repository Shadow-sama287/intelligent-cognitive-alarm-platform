// ============================================================
// ICAP "Lumina Mind" — Mobile Design Token Contract
// Mirrors .theme-mobile CSS custom properties from:
//   docs/temporary-theme-rework/theme.css
//
// Usage: import { colors, spacing, radius, cardActiveGlow, glassNavStyle } from '../theme';
// Never hardcode hex values in component StyleSheets — always go through a token.
// ============================================================

// ── Color Tokens ─────────────────────────────────────────────
export const colors = {
  // Surfaces (deep dawn warm dark)
  background:               '#1b1111',  // --color-background
  surfaceDim:               '#160d0d',  // --color-surface-dim
  surfaceBright:            '#3e2020',  // --color-surface-bright
  surfaceContainerLowest:   '#150b0b',  // --color-surface-container-lowest
  surfaceContainerLow:      '#241919',  // --color-surface-container-low
  surfaceContainer:         '#281d1d',  // --color-surface-container
  surfaceContainerHigh:     '#332828',  // --color-surface-container-high
  surfaceContainerHighest:  '#3e3232',  // --color-surface-container-highest

  // On-surface text
  onSurface:                '#f1dada',  // --color-on-surface
  onSurfaceVariant:         '#d8c2c2',  // --color-on-surface-variant
  inverseSurface:           '#f1dada',  // --color-inverse-surface
  inverseOnSurface:         '#3e2020',  // --color-inverse-on-surface

  // Outline
  outline:                  '#a08888',  // --color-outline
  outlineVariant:           '#534343',  // --color-outline-variant

  // Primary — Coral / Dawn (#ffb2b9 primary, #fb7185 container)
  primary:                  '#ffb2b9',  // --color-primary
  onPrimary:                '#67001f',  // --color-on-primary
  primaryContainer:         '#fb7185',  // --color-primary-container
  onPrimaryContainer:       '#ffd9db',  // --color-on-primary-container
  inversePrimary:           '#904a56',  // --color-inverse-primary

  // Secondary — Navy / Indigo
  secondary:                '#c3c6d7',  // --color-secondary
  onSecondary:              '#2c2f42',  // --color-on-secondary
  secondaryContainer:       '#434659',  // --color-secondary-container
  onSecondaryContainer:     '#dfe2f3',  // --color-on-secondary-container

  // Tertiary — Indigo Accent
  tertiary:                 '#bcc7de',  // --color-tertiary
  onTertiary:               '#253146',  // --color-on-tertiary
  tertiaryContainer:        '#3c4860',  // --color-tertiary-container
  onTertiaryContainer:      '#d9e3fb',  // --color-on-tertiary-container

  // Semantic / Wellness
  error:                    '#ffb4ab',  // --color-error
  onError:                  '#690005',  // --color-on-error
  errorContainer:           '#93000a',  // --color-error-container
  onErrorContainer:         '#ffdad6',  // --color-on-error-container
  amberAccent:              '#f59e0b',  // --color-amber-accent (Amber Attention)
  sageSuccess:              '#87a878',  // --color-sage-success

  // Challenge type colors
  challengeMath:            '#ffb2b9',  // coral — primary
  challengeMemory:          '#c3c6d7',  // navy  — secondary
  challengeLogic:           '#f59e0b',  // amber accent
};

// ── Spacing Scale ─────────────────────────────────────────────
export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

// ── Border Radius Scale ───────────────────────────────────────
export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 9999,
};

// ── Component Recipes ─────────────────────────────────────────

/**
 * Coral glow shadow — apply to active alarm cards.
 * Spec: .card-active-glow { box-shadow: 0 8px 30px rgba(251,113,133,0.15) }
 */
export const cardActiveGlow = {
  shadowColor:   '#fb7185',
  shadowOffset:  { width: 0, height: 8 },
  shadowOpacity: 0.15,
  shadowRadius:  15,
  elevation:     10,
};

/**
 * Glassmorphism bottom navigation style.
 * Note: true backdropFilter blur is not supported in React Native StyleSheet.
 * Uses semi-transparent background as approximation.
 * For real blur, add @react-native-community/blur.
 */
export const glassNavStyle = {
  backgroundColor: 'rgba(27, 17, 17, 0.85)',
  borderTopWidth:  1,
  borderTopColor:  'rgba(163, 136, 136, 0.25)',
};
