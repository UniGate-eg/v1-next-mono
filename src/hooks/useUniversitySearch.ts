"use client";

import { useState, useEffect } from "react";
import { SlimSearchToken } from "../types/university.types";

export function useUniversitySearch() {
  const [index, setIndex] = useState<SlimSearchToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIndex() {
      try {
        const res = await fetch("/search-index.json");
        if (!res.ok) throw new Error("Failed to load search index");
        const data = await res.json();
        setIndex(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchIndex();
  }, []);

  const search = (query: string): SlimSearchToken[] => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    
    return index.filter((uni) => {
      return (
        uni.nameEn.toLowerCase().includes(lowerQuery) ||
        uni.nameAr.includes(lowerQuery) ||
        uni.slug.includes(lowerQuery)
      );
    });
  };

  return { search, index, loading, error };
}
