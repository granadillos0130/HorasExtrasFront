import { useEffect, useRef, useState } from "react";

type Fetchers = Record<string, () => Promise<unknown>>;
type ResultadoDe<T extends Fetchers> = { [K in keyof T]: Awaited<ReturnType<T[K]>> };

// Carga en paralelo un conjunto de catálogos (trabajadores, centros, cursos, etc.)
// una sola vez al montar, replicando el patrón Promise.all + loading + catch repetido
// en varios formularios. Los fetchers se capturan solo en el primer render.
export function useCargarCatalogos<T extends Fetchers>(fetchers: T) {
  const [data, setData] = useState<Partial<ResultadoDe<T>>>({});
  const [loading, setLoading] = useState(true);
  const fetchersRef = useRef(fetchers);

  useEffect(() => {
    let cancelado = false;

    const cargar = async () => {
      try {
        setLoading(true);
        const keys = Object.keys(fetchersRef.current) as (keyof T)[];
        const resultados = await Promise.all(keys.map((k) => fetchersRef.current[k]()));

        if (!cancelado) {
          const nuevaData = {} as ResultadoDe<T>;
          keys.forEach((k, i) => {
            nuevaData[k] = resultados[i] as ResultadoDe<T>[typeof k];
          });
          setData(nuevaData);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        if (!cancelado) {
          setLoading(false);
        }
      }
    };

    cargar();

    return () => {
      cancelado = true;
    };
  }, []);

  return { data, loading };
}
