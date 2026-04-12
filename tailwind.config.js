const { hairlineWidth } = require('nativewind/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
    fontFamily: {
      poppins_regular: ['Poppins_400Regular', 'sans-serif'],
      poppins_medium: ['Poppins_500Medium', 'sans-serif'],
      poppins_semibold: ['Poppins_600SemiBold', 'sans-serif'],
      poppins_bold: ['Poppins_700Bold', 'sans-serif'],
      CactusClassicalSerif_400Regular: ['CactusClassicalSerif_400Regular', 'serif'],
      schluber: ['Schluber'],
      HanSerifRegular: ['HanSerifRegular', 'serif'],
      HanSerifSemiBold: ['HanSerifSemiBold', 'serif'],
      HanSerifMedium: ['HanSerifMedium', 'serif'],
      HanSerifBold: ['HanSerifBold', 'serif'],
      arabic: ['Arabic'],
      teko_light: ['Teko_300Light'],
      teko_regular: ['Teko_400Regular'],
      ArchitectursDaughter_400Regular: ['ArchitectsDaughter_400Regular', 'cursive'],
      teko_medium: ['Teko_500Medium'],
      source_serif_regular: ['SourceSerifPro_200ExtraLight', 'serif'],
      source_serif_medium: ['SourceSerifPro_300Light', 'serif'],
      source_serif_semibold: ['SourceSerifPro_600SemiBold', 'serif'],
      source_serif_bold: ['SourceSerifPro_700Bold', 'serif'],
      teko_semibold: ['Teko_600SemiBold'],
      teko_bold: ['Teko_700Bold'],
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [require('tailwindcss-animate')],
};
