import type { Preview } from '@storybook/svelte-vite';
import '../src/styles/global.css';
import { initLogoHoverTilt } from '../src/scripts/logoHoverTilt';

const isDev = import.meta.env.DEV;

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      viewports: {
        compact: {
          name: 'Compact (430px)',
          styles: {
            width: '430px',
            height: '932px',
          },
        },
        medium: {
          name: 'Medium (744px)',
          styles: {
            width: '744px',
            height: '1133px',
          },
        },
        extended: {
          name: 'Extended (1024px)',
          styles: {
            width: '1024px',
            height: '1366px',
          },
        },
        large: {
          name: 'Large (1512px)',
          styles: {
            width: '1512px',
            height: '982px',
          },
        },
      },
      defaultViewport: 'large',
    },
  },

  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light', icon: 'circlehollow' },
          { value: 'dark', title: 'Dark', icon: 'circle' },
        ],
        dynamicTitle: true,
      },
    },
  },

  decorators: [
    (Story, context) => {
      // Apply data-theme attribute to sync with design system
      if (typeof document !== 'undefined') {
        const theme = (context.globals.theme as 'light' | 'dark') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
      }

      const rendered = Story();

      if (typeof document !== 'undefined') {
        queueMicrotask(() => {
          requestAnimationFrame(() => {
            try {
              initLogoHoverTilt(document);
            } catch (error) {
              if (isDev) {
                console.warn('Logo hover tilt initialization failed in Storybook.', error);
              }
            }
          });
        });
      }

      return rendered;
    },
  ],
};

export default preview;
