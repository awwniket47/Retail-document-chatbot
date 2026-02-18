/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        surface: {
          DEFAULT: '#0d0d0f',
          1: '#131316',
          2: '#1a1a1f',
          3: '#222228',
          4: '#2a2a32',
        },
        accent: {
          DEFAULT: '#7c6aff',
          light: '#a596ff',
          dim: '#7c6aff33',
        },
        border: '#ffffff0f',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease forwards',
        'slide-up': 'slideUp 0.3s ease forwards',
        'pulse-dot': 'pulseDot 1.4s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseDot: { '0%,80%,100%': { transform: 'scale(0)', opacity: 0.5 }, '40%': { transform: 'scale(1)', opacity: 1 } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
}