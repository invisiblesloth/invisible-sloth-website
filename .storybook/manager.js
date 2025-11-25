import { addons } from 'storybook/manager-api';
import { themes } from 'storybook/theming';

// Theme for Storybook's manager UI (sidebar, toolbar, panels)
// Note: This is separate from the canvas/preview theme controlled by the toolbar toggle
addons.setConfig({
  theme: window.matchMedia('(prefers-color-scheme: dark)').matches
    ? themes.dark
    : themes.light,
});
