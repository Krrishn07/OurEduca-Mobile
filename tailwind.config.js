/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./contexts/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',
        'primary-5': 'rgba(79, 70, 229, 0.05)',
        'primary-10': 'rgba(79, 70, 229, 0.1)',
        'primary-20': 'rgba(79, 70, 229, 0.2)',
        success: '#10b981',
        'success-10': 'rgba(16, 185, 129, 0.1)',
        warning: '#f59e0b',
        error: '#ef4444',
        'error-10': 'rgba(239, 68, 68, 0.1)',
        'surface-subtle': '#f5f7ff',
      },
      borderRadius: {
        'huge': '32px',
        'massive': '40px',
      },
      fontFamily: {
        'inter': ['Inter_400Regular'],
        'inter-medium': ['Inter_500Medium'],
        'inter-bold': ['Inter_900Black'],
        'inter-black': ['Inter_900Black'],
      },
    },
  },
  plugins: [],
}
