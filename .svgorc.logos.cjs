/**
 * SVGO Configuration for Logo Optimization
 *
 * Conservative optimization settings to preserve:
 * - Display P3 color space definitions and fallback chains
 * - Inline style attributes with color precision
 * - ViewBox for responsive scaling
 *
 * Only applies safe optimizations like ID cleanup and metadata removal.
 */

module.exports = {
  plugins: [
    // Remove XML processing instructions, comments, metadata
    {
      name: 'removeDoctype',
    },
    {
      name: 'removeXMLProcInst',
    },
    {
      name: 'removeComments',
    },
    {
      name: 'removeMetadata',
    },
    {
      name: 'removeEditorsNSData',
    },

    // Clean up IDs and unreferenced defs
    {
      name: 'cleanupIds',
    },
    {
      name: 'removeUnusedNS',
    },

    // Safe whitespace cleanup
    {
      name: 'collapseGroups',
    },

    // IMPORTANT: Preserve color precision and styles
    // These plugins are explicitly disabled to keep Display P3 colors intact

    // DO NOT convert style attributes to presentation attributes
    // (would lose Display P3 fallback chain)
    // 'convertStyleToAttrs' - DISABLED

    // DO NOT remove/optimize stroke and fill
    // (would alter color specifications)
    // 'removeUselessStrokeAndFill' - DISABLED

    // DO NOT minify styles
    // (would potentially alter color values)
    // 'minifyStyles' - DISABLED

    // DO NOT remove viewBox
    // (needed for responsive scaling)
    // 'removeViewBox' - DISABLED
  ],
};
