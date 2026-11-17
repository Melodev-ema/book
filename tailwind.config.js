/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./components/**/*.{js,vue,ts}",
        "./src/**/*.{astro,vue,ts}",
    ],
    theme: {
        extend: {
            backgroundImage: {
                'pattern-gradient': 'url(/images/background-img.png)',
            },
            fontSize: {
                xs: ['0.75rem', {lineHeight: '1rem'}],
                sm: ['0.875rem', {lineHeight: '1.5rem'}],
                base: ['1rem', {lineHeight: '2rem'}],
                lg: ['1.125rem', {lineHeight: '2rem'}],
                xl: ['1.25rem', {lineHeight: '2rem'}],
                '2xl': ['1.375rem', {lineHeight: '2rem'}],
                '3xl': ['1.5rem', {lineHeight: '2rem'}],
                '4xl': ['2rem', {lineHeight: '2.5rem'}],
                '5xl': ['3.5rem', {lineHeight: '1'}],
                '6xl': ['4rem', {lineHeight: '1'}],
                '7xl': ['4.5rem', {lineHeight: '1'}],
                '8xl': ['6rem', {lineHeight: '1'}],
                '9xl': ['8rem', {lineHeight: '1'}],
            },
            borderRadius: {
                '4xl': '2rem',
                '5xl': '3rem',
                '6xl': '5rem',
            },
        },
        screens: {
            'sm': '640px',
            'md': '768px',
            'lg': '1024px',
            'xl': '1280px',
            'page': '450mm',
        },
    },
    plugins: [],
};
