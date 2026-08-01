/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-raised': 'var(--surface-raised)',
        border: 'var(--border)',
        text: 'var(--text)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        alert: 'var(--alert)',
      },
      fontSize: {
        display: ['34px', { lineHeight: '40px', fontWeight: '700' }],
        title: ['28px', { lineHeight: '34px', fontWeight: '700' }],
        heading: ['20px', { lineHeight: '26px', fontWeight: '600' }],
        body: ['17px', { lineHeight: '24px', fontWeight: '400' }],
        numeric: ['24px', { lineHeight: '28px', fontWeight: '600' }],
        caption: ['13px', { lineHeight: '18px', fontWeight: '400' }],
        label: ['11px', { lineHeight: '14px', fontWeight: '600', letterSpacing: '0.06em' }],
      },
      borderRadius: {
        card: '12px',
        field: '10px',
        sheet: '20px',
      },
      maxWidth: {
        app: '480px',
      },
    },
  },
  plugins: [],
}
