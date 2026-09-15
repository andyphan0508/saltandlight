import { useEffect, useState } from "react";

interface PersistApi {
  persist: {
    hasHydrated(): boolean;
    onFinishHydration(cb: () => void): () => void;
  };
}

/** True once a zustand `persist` store has read its localStorage snapshot — guards against rendering the pre-hydration default state (e.g. an empty cart/wishlist) as if it were real. */
export const useStoreHydrated = (store: PersistApi): boolean => {
  const [isHydrated, setHydrated] = useState(() => store.persist.hasHydrated());

  useEffect(() => {
    if (store.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return store.persist.onFinishHydration(() => setHydrated(true));
  }, [store]);

  return isHydrated;
};
