/** Whether a nav link is the current page: "/" only on the homepage, any other link for its whole section. */
export const isNavItemActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
