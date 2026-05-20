export type NavigationItem = {
  label: string;
  href: string;
  target?: string;
  rel?: string;
};

export type NavigationSection = {
  heading?: string;
  items: NavigationItem[];
};

export type NavigationCloseReason = 'button' | 'escape' | 'backdrop' | 'navigation';

export type NavigationCloseEvent = MouseEvent | KeyboardEvent | undefined;

export type NavigationCloseCallback = {
  bivarianceHack(event?: NavigationCloseEvent, reason?: NavigationCloseReason): void;
}['bivarianceHack'];
