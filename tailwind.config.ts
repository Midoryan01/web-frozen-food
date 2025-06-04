import type { Config } from 'tailwindcss' with { 'resolution-mode': 'import' };

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}', // Jika Anda masih menggunakan Pages Router
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',    // PENTING untuk App Router
  ],
  theme: {
    extend: {
      // Tambahkan ekstensi tema Anda di sini jika ada
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
export default config;