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
