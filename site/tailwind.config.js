  /** @type {import('tailwindcss').Config} */
  export default {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx}",
    ],
    theme: {
      extend: {
        colors: {
          navy: '#060D22',
          ink: '#F6F7FA',
          muted: '#A9B4D0',
          muted2: '#8A96B8',
          muted3: '#6F7C9E',
          gold: '#FFB612',
          goldLight: '#FFD37A',
          purple: '#B48CE8',
          teal: '#3FD9A8',
        },
        fontFamily: {
          mulish: ['Mulish', 'system-ui', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }