/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // "Heritage Wealth" palette: emerald & sage greens, soft beige
        // backgrounds, deep brown typography, brass accents.
        heritage: {
          forest: '#1B3A2B', // deepest green; headings on light, dark panels
          emerald: '#2F6B4F', // primary action green
          emeraldDark: '#244F3B',
          sage: '#7E9B7A', // muted secondary green
          sageLight: '#B8CBA8',
          brass: '#B08D57', // antique gold accent
          brassDark: '#967440',
          brown: '#3B2A1E', // primary body text
          brownLight: '#6B5440', // secondary text
          cream: '#FBF7EE', // page background
          beige: '#F1E8D6', // card / panel background
          sand: '#E4D8BE', // borders, dividers
          ink: '#241910', // near-black for the invoice document
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(59, 42, 30, 0.04), 0 12px 32px -16px rgba(27, 58, 43, 0.25)',
        lift: '0 18px 48px -20px rgba(27, 58, 43, 0.35)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s ease-out both',
        shimmer: 'shimmer 1.4s infinite',
      },
    },
  },
  plugins: [],
}
