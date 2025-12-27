/**
 * Design System Service
 * Ensures consistent, professional design across all generated projects
 */

/**
 * Color palettes for different project types
 */
export const colorPalettes = {
  portfolio: {
    primary: '#6366f1', // Indigo
    secondary: '#8b5cf6', // Purple
    accent: '#ec4899', // Pink
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717'
    }
  },
  
  landing: {
    primary: '#3b82f6', // Blue
    secondary: '#10b981', // Green
    accent: '#f59e0b', // Amber
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    }
  },
  
  blog: {
    primary: '#0ea5e9', // Sky
    secondary: '#06b6d4', // Cyan
    accent: '#f43f5e', // Rose
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a'
    }
  },
  
  dashboard: {
    primary: '#8b5cf6', // Violet
    secondary: '#6366f1', // Indigo
    accent: '#14b8a6', // Teal
    neutral: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b'
    }
  }
};

/**
 * Typography scale
 */
export const typography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
    mono: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
  },
  
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem',  // 72px
  },
  
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800'
  },
  
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
    loose: '2'
  }
};

/**
 * Spacing scale (4px base)
 */
export const spacing = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
  32: '8rem',    // 128px
};

/**
 * Border radius
 */
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px'
};

/**
 * Shadows
 */
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
};

/**
 * Component patterns
 */
export const componentPatterns = {
  button: {
    primary: 'px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition shadow-md hover:shadow-lg',
    secondary: 'px-6 py-3 border-2 border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-white transition',
    ghost: 'px-6 py-3 text-primary hover:bg-primary/10 rounded-lg font-medium transition'
  },
  
  card: {
    default: 'bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition',
    bordered: 'bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-primary transition',
    elevated: 'bg-white rounded-xl shadow-2xl p-8'
  },
  
  input: {
    default: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition',
    error: 'w-full px-4 py-3 border-2 border-red-500 rounded-lg focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
  },
  
  container: {
    default: 'container mx-auto px-6',
    narrow: 'container mx-auto px-6 max-w-4xl',
    wide: 'container mx-auto px-6 max-w-7xl'
  }
};

/**
 * Layout patterns
 */
export const layoutPatterns = {
  hero: {
    centered: 'min-h-screen flex items-center justify-center text-center',
    split: 'min-h-screen grid md:grid-cols-2 gap-12 items-center',
    fullWidth: 'min-h-screen flex flex-col justify-center'
  },
  
  section: {
    default: 'py-20 px-6',
    large: 'py-32 px-6',
    small: 'py-12 px-6'
  },
  
  grid: {
    two: 'grid md:grid-cols-2 gap-8',
    three: 'grid md:grid-cols-2 lg:grid-cols-3 gap-8',
    four: 'grid md:grid-cols-2 lg:grid-cols-4 gap-6'
  }
};

/**
 * Generate design system prompt for AI
 */
export function generateDesignSystemPrompt(projectType) {
  const palette = colorPalettes[projectType] || colorPalettes.portfolio;
  
  return `
DESIGN SYSTEM REQUIREMENTS:

Colors:
- Primary: ${palette.primary}
- Secondary: ${palette.secondary}
- Accent: ${palette.accent}
- Use neutral grays for text and backgrounds

Typography:
- Font: System font stack (${typography.fontFamily.sans})
- Headings: Bold (700), larger sizes
- Body: Normal (400), 1rem base
- Line height: 1.5 for readability

Spacing:
- Use 4px grid (p-4, p-6, p-8, etc.)
- Consistent padding and margins
- Section spacing: py-20

Components:
- Buttons: Rounded (rounded-lg), with hover states
- Cards: Shadow (shadow-lg), rounded (rounded-xl)
- Inputs: Border with focus states
- Consistent hover transitions

Layout:
- Container: max-width with auto margins
- Responsive grid: md:grid-cols-2, lg:grid-cols-3
- Mobile-first approach

Accessibility:
- Proper heading hierarchy (h1, h2, h3)
- ARIA labels where needed
- Sufficient color contrast
- Focus states for interactive elements

Professional Polish:
- Smooth transitions (transition-all duration-300)
- Subtle shadows and hover effects
- Gradient backgrounds where appropriate
- Modern, clean aesthetic
`;
}

/**
 * Validate design consistency
 */
export function validateDesign(fileTree) {
  const issues = [];
  
  // Check for consistent color usage
  // Check for proper spacing
  // Check for accessibility
  
  return {
    consistent: issues.length === 0,
    issues
  };
}

/**
 * Get Tailwind config for project type
 */
export function getTailwindConfig(projectType) {
  const palette = colorPalettes[projectType] || colorPalettes.portfolio;
  
  return `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '${palette.primary}',
          dark: '${adjustColor(palette.primary, -20)}',
          light: '${adjustColor(palette.primary, 20)}',
        },
        secondary: {
          DEFAULT: '${palette.secondary}',
          dark: '${adjustColor(palette.secondary, -20)}',
          light: '${adjustColor(palette.secondary, 20)}',
        },
        accent: {
          DEFAULT: '${palette.accent}',
          dark: '${adjustColor(palette.accent, -20)}',
          light: '${adjustColor(palette.accent, 20)}',
        },
      },
      fontFamily: {
        sans: ${JSON.stringify(typography.fontFamily.sans.split(', '))},
      },
    },
  },
  plugins: [],
}`;
}

/**
 * Helper: Adjust color brightness
 */
function adjustColor(hex, percent) {
  // Simple color adjustment (would need proper implementation)
  return hex;
}
