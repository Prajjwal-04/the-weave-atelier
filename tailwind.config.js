/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        atelier: {
          ivory: '#FAF8F5',
          cream: '#F4EFEA',
          parchment: '#EDE6DD',
          beige: '#DFD7CC',
          sand: '#D2C6B6',
          taupe: '#9C8E82',
          clay: '#8A7B6E',
          brown: '#5C4D43',
          darkbrown: '#453932',
          charcoal: '#2D2B2A',
          softblack: '#1A1918',
          deepblack: '#121211',
          gold: '#C5A880',
          agedgold: '#B39066',
          olive: '#636551',
          terracotta: '#9E5B40',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['monospace'],
      },
      letterSpacing: {
        widest: '.2em',
        atelier: '.28em',
      },
      boxShadow: {
        'subtle': '0 2px 20px -2px rgba(26, 25, 24, 0.04)',
        'luxury': '0 10px 40px -10px rgba(26, 25, 24, 0.08)',
        'drawer': '-10px 0 40px rgba(0, 0, 0, 0.12)',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
