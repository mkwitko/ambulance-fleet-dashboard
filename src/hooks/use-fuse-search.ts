import { useMemo } from "react"
import Fuse from "fuse.js"

interface FuseSearchOptions<T> {
  data: T[]
  searchTerm: string
  keys: string[]
  threshold?: number
}

export function useFuseSearch<T>({ data, searchTerm, keys, threshold = 0.3 }: FuseSearchOptions<T>) {
  const fuse = useMemo(() => {
    return new Fuse(data, {
      keys,
      threshold,
      ignoreLocation: true,
      includeScore: true,
    })
  }, [data, keys, threshold])

  const results = useMemo(() => {
    if (!searchTerm.trim()) {
      return data
    }

    const fuseResults = fuse.search(searchTerm)
    return fuseResults.map((result) => result.item)
  }, [data, fuse, searchTerm])

  return results
}
