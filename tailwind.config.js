/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        accent: ['Playfair Display', 'serif'],
      },
      colors: {
        pomodoro: {
          50:  '#fff1f0',
          100: '#ffe0de',
          200: '#ffc7c2',
          400: '#f4705f',
          600: '#c0392b',
          700: '#9b2e22',
          800: '#7a2219',
          900: '#5a1710',
        },
        cream: {
          50:  '#fefcf7',
          100: '#fdf8ee',
          200: '#f9f0da',
          300: '#f2e3b8',
          400: '#e8cf8a',
        },
        charcoal: {
          800: '#1a1a1a',
          900: '#0d0d0d',
        },
        olive: '#5a6b3a',
      },
      backgroundImage: {
        'paper-texture': "url('/paper-texture.svg')",
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'fade-up': 'fadeUp 0.8s ease forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(24px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
