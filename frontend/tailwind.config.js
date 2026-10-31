/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F7F9FC',
        card: '#FFFFFF',
        sidebar: '#FFFFFF',
        primaryNavy: '#142B4A',
        primaryDark: '#0D1E35',
        accentBlue: '#2878E5',
        accentBlueHover: '#1B65CD',
        accentBlueLight: '#EBF3FE',
        textPrimary: '#172B4D',
        textSecondary: '#718096',
        textMuted: '#A0AEC0',
        borderSubtle: '#E5EAF1',
        borderHover: '#CBD7E6',
        successGreen: '#10B981',
        successLight: '#ECFDF5',
        warningAmber: '#F59E0B',
        warningLight: '#FFFBEB',
        errorRed: '#EF4444',
        errorLight: '#FEF2F2',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(20, 43, 74, 0.04), 0 1px 2px -1px rgba(20, 43, 74, 0.04)',
        'card-hover': '0 4px 12px 0 rgba(20, 43, 74, 0.08), 0 2px 4px -2px rgba(20, 43, 74, 0.04)',
        'dropdown': '0 10px 25px -5px rgba(20, 43, 74, 0.1), 0 8px 10px -6px rgba(20, 43, 74, 0.06)',
      }
    },
  },
  plugins: [],
}
