/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#0b2e59',
          'navy-dark': '#071f3d',
          'navy-light': '#14437a',
          blue: '#1a56db',
          saffron: '#FF9933',
          'saffron-dark': '#E06A00',
          green: '#138808',
          'green-dark': '#0E6306',
          bg: '#f4f6f9',
          card: '#ffffff',
          border: '#dbe2ea',
          muted: '#64748b',
          text: '#1e293b',
          gold: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
      borderRadius: {
        'gov': '4px',
        'gov-md': '6px',
        'gov-lg': '8px',
      },
      boxShadow: {
        'gov': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'gov-hover': '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        'gov-header': '0 2px 4px rgba(0,0,0,0.06)',
      }
    },
  },
  plugins: [],
}
