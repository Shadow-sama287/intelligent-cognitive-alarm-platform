/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: 'var(--color-surface)',
        'surface-dim': 'var(--color-surface-dim)',
        'surface-bright': 'var(--color-surface-bright)',
        'surface-container-lowest': 'var(--color-surface-container-lowest)',
        'surface-container-low': 'var(--color-surface-container-low)',
        'surface-container': 'var(--color-surface-container)',
        'surface-container-high': 'var(--color-surface-container-high)',
        'surface-container-highest': 'var(--color-surface-container-highest)',
        'surface-variant': 'var(--color-surface-variant)',

        'on-surface': 'var(--color-on-surface)',
        'on-surface-variant': 'var(--color-on-surface-variant)',
        'inverse-surface': 'var(--color-inverse-surface)',
        'inverse-on-surface': 'var(--color-inverse-on-surface)',

        outline: 'var(--color-outline)',
        'outline-variant': 'var(--color-outline-variant)',

        primary: 'var(--color-primary)',
        'on-primary': 'var(--color-on-primary)',
        'primary-container': 'var(--color-primary-container)',
        'on-primary-container': 'var(--color-on-primary-container)',
        'inverse-primary': 'var(--color-inverse-primary)',

        secondary: 'var(--color-secondary)',
        'on-secondary': 'var(--color-on-secondary)',
        'secondary-container': 'var(--color-secondary-container)',
        'on-secondary-container': 'var(--color-on-secondary-container)',

        tertiary: 'var(--color-tertiary)',
        'on-tertiary': 'var(--color-on-tertiary)',
        'tertiary-container': 'var(--color-tertiary-container)',
        'on-tertiary-container': 'var(--color-on-tertiary-container)',

        error: 'var(--color-error)',
        'on-error': 'var(--color-on-error)',
        'error-container': 'var(--color-error-container)',
        'on-error-container': 'var(--color-on-error-container)',

        background: 'var(--color-background)',
        'on-background': 'var(--color-on-background)',

        'chart-slate': 'var(--color-chart-slate, transparent)',
        'chart-teal': 'var(--color-chart-teal, transparent)',
        'amber-accent': 'var(--color-amber-accent, transparent)',
        'sage-success': 'var(--color-sage-success, transparent)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius-default)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      spacing: {
        gutter: 'var(--spacing-gutter)',
        'stack-sm': 'var(--spacing-stack-sm)',
        'stack-md': 'var(--spacing-stack-md)',
        'stack-lg': 'var(--spacing-stack-lg)',
        'sidebar-width': 'var(--spacing-sidebar-width, 0px)',
        'container-padding': 'var(--spacing-container-padding-mobile, var(--spacing-margin-page))',
      },
      maxWidth: {
        'container-max': 'var(--spacing-container-max-width, 100%)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      boxShadow: {
        hover: 'var(--shadow-hover, none)',
        active: 'var(--shadow-active, none)',
      },
    },
  },
  plugins: [],
};
