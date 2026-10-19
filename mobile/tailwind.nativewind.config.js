// Separate, narrower `content` glob used ONLY by the `nativewind/babel` plugin
// (see babel.config.js). NativeWind's babel transform rewrites ANY JSX element
// with a `className` — including plain DOM tags like <div>/<svg> — into a
// React-Native-style component expecting an array `style` prop. That's correct
// for our React Native screens, but it corrupts plain web/DOM library code
// (e.g. the @oeconnection/pcb-grid Grid library under src/lib/Grid, and any
// `*.web.tsx` file), crashing react-dom with "Failed to set an indexed property [0] on
// CSSStyleDeclaration" when it tries to apply that array as a real CSS style.
//
// This config excludes src/lib/** and *.web.tsx from NativeWind's babel
// transform so those files render as plain, unmodified DOM/React output. The
// main tailwind.config.js (used by postcss.config.js) is untouched, so Tailwind
// still generates real CSS classes for utility classNames used inside those
// excluded files.
const base = require('./tailwind.config.js');

module.exports = {
  ...base,
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/@(api|assets|components|hooks|navigation|screens|store|types|utils)/**/!(*.web).{js,jsx,ts,tsx}',
    './src/*.{js,jsx,ts,tsx}',
  ],
};
