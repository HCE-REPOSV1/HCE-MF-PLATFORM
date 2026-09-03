// utils/createCachedFetcher.ts
//
// Cache keyeada por `locale`. El fetch en sí no recibe el idioma como
// parámetro -- viaja como header Accept-Language via apiFetch (ver
// mf-shell/services/api.service.ts) -- así que un solo valor cacheado a
// nivel de módulo quedaría pegado al primer idioma con el que se llamó,
// incluso después de que el usuario cambie el idioma activo (los catálogos
// de ms-bs-catalogs devuelven display/description/etc. ya resueltos por el
// backend según ese header, uno por locale). Cada locale tiene su propia
// entrada, para no perder el beneficio de cache dentro del mismo idioma.
export function createCachedFetcher<T>(fetchFn: () => Promise<T>) {
  const cache = new Map<string, T>();
  const pending = new Map<string, Promise<T>>();

  return {
    async fetch(locale: string): Promise<T> {
      const cached = cache.get(locale);
      if (cached !== undefined) return cached;

      const inFlight = pending.get(locale);
      if (inFlight) return inFlight;

      const promise = fetchFn()
        .then((result) => {
          cache.set(locale, result);
          pending.delete(locale);
          return result;
        })
        .catch((err) => {
          pending.delete(locale);
          throw err;
        });

      pending.set(locale, promise);
      return promise;
    },
  };
}