"use client";

import { createContext, useContext, useMemo, useState } from "react";

interface SelectedColorValue {
  color: string | null;
  setColor: (color: string | null) => void;
}

const SelectedColorContext = createContext<SelectedColorValue | null>(null);

/**
 * The colour picked in the buy box, shared with the gallery beside it so it can jump to that
 * colour's photos. The two sit in separate columns of a server-rendered page, hence a context.
 */
export const SelectedColorProvider = ({ children }: { children: React.ReactNode }) => {
  const [color, setColor] = useState<string | null>(null);
  const value = useMemo(() => ({ color, setColor }), [color]);
  return <SelectedColorContext.Provider value={value}>{children}</SelectedColorContext.Provider>;
};

/** Null outside the provider, so either side still works on its own. */
export const useSelectedColor = () => useContext(SelectedColorContext);
