// SVGO configuration for optimizing raw SVG exports from Figma
// - Preserves viewBox for responsive scaling
// - Removes width/height so components can size with 1em
// - Sorts attributes for consistent diffs
// Learn more: https://github.com/svg/svgo

/** @type {import('svgo').Config} */
module.exports = {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // Keep viewBox for responsive icons
          removeViewBox: false,
        },
      },
    },
    // Remove width/height attributes so icons can scale via CSS (1em)
    { name: 'removeDimensions' },
    // Stable attribute ordering helps with code review diffs
    { name: 'sortAttrs' },
  ],
};

