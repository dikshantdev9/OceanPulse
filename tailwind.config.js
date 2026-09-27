export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        abyss: {
          950: 'rgb(var(--abyss-950) / <alpha-value>)',
          900: 'rgb(var(--abyss-900) / <alpha-value>)',
          850: 'rgb(var(--abyss-850) / <alpha-value>)',
          800: 'rgb(var(--abyss-800) / <alpha-value>)',
          750: 'rgb(var(--abyss-750) / <alpha-value>)',
          700: 'rgb(var(--abyss-700) / <alpha-value>)',
          600: 'rgb(var(--abyss-600) / <alpha-value>)',
        },
        tide: {
          400: 'rgb(var(--tide-400) / <alpha-value>)',
          500: 'rgb(var(--tide-500) / <alpha-value>)',
          600: 'rgb(var(--tide-600) / <alpha-value>)',
          700: 'rgb(var(--tide-700) / <alpha-value>)',
        },
        signal: {
          high: '#fb4d6a',
          med: '#f59e0b',
          low: '#10b981',
          info: '#3b82f6',
          scan: '#8b5cf6',
        },
        ink: {
          100: 'rgb(var(--ink-100) / <alpha-value>)',
          200: 'rgb(var(--ink-200) / <alpha-value>)',
          300: 'rgb(var(--ink-300) / <alpha-value>)',
          400: 'rgb(var(--ink-400) / <alpha-value>)',
          500: 'rgb(var(--ink-500) / <alpha-value>)',
          600: 'rgb(var(--ink-600) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        panel: 'var(--panel-shadow, 0 1px 0 0 rgba(255,255,255,0.04) inset, 0 24px 60px -30px rgba(2,8,20,0.9))',
        glow: '0 0 0 1px rgba(34,211,238,0.25), 0 0 32px -8px rgba(34,211,238,0.35)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
      keyframes: {
        sweep: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        pulsering: {
          '0%': { transform: 'scale(0.6)', opacity: '0.7' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        dash: {
          to: { strokeDashoffset: '-24' },
        },
      },
      animation: {
        sweep: 'sweep 3.2s cubic-bezier(0.4,0,0.6,1) infinite',
        pulsering: 'pulsering 2.6s cubic-bezier(0.23,1,0.32,1) infinite',
        dash: 'dash 1s linear infinite',
      },
    },
  },
}
