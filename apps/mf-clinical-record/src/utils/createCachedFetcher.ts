// utils/createCachedFetcher.ts
export function createCachedFetcher<T>(fetchFn: () => Promise<T>) {
  let cache: T | null = null;
  let pending: Promise<T> | null = null;

  return {
    async fetch(): Promise<T> {
      if (cache !== null) return cache;
      if (pending) return pending;

      pending = fetchFn()
        .then((result) => {
          cache = result;
          pending = null;
          return result;
        })
        .catch((err) => {
          pending = null;
          throw err;
        });

      return pending;
    },
  };
}