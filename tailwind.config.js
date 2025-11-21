/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Color (Toss Blue - Vibrant and Trustworthy)
        primary: {
          50: '#e8f3ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3182f6', // Toss Blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Secondary Color (Toss Gray Scale - Cool and Clean)
        gray: {
          50: '#f9fafb',
          100: '#f2f4f6', // Toss Background
          200: '#e5e8eb',
          300: '#d1d6db',
          400: '#b0b8c1',
          500: '#8b95a1',
          600: '#6b7684',
          700: '#4e5968', // Subtext
          800: '#333d4b', // Main Text
          900: '#191f28', // Heading
        },
        // Semantic Colors
        success: {
          50: '#e8f9ec',
          100: '#bcebd0',
          500: '#26c364', // Toss Green
          600: '#1da552',
          700: '#168541',
        },
        warning: {
          50: '#fff8e1',
          100: '#ffecb5',
          500: '#ffb700', // Toss Yellow
          600: '#e6a500',
          700: '#cc9200',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444', // Toss Red
          600: '#dc2626',
          700: '#b91c1c',
        },
        info: {
          50: '#e8f3ff',
          100: '#dbeafe',
          500: '#3182f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        DEFAULT: '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1.25rem', // 20px
        '3xl': '1.5rem',  // 24px
        '4xl': '2rem',    // 32px
        'full': '9999px',
      },
      fontFamily: {
        sans: ['Pretendard', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'toss': '0 2px 10px rgba(0, 0, 0, 0.03)',
        'toss-hover': '0 10px 25px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
