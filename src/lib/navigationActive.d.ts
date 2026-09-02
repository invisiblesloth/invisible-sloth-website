type NavigationItemLike = {
  href: string;
};

type NavigationSectionLike = {
  items: NavigationItemLike[];
};

export function hasExactActiveNavigationItem(
  activeValue: string | undefined,
  menuSections: NavigationSectionLike[],
): boolean;

export function isActiveNavigationItem(
  activeValue: string | undefined,
  itemHref: string,
  exactActiveMatchExists: boolean,
): boolean;

export function getNavigationAriaCurrent(
  activeValue: string | undefined,
  itemHref: string,
  exactActiveMatchExists: boolean,
): 'page' | undefined;
