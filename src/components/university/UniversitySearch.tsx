"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface UniversitySearchProps {
  initialSearch?: string;
  placeholder?: string;
}

export function UniversitySearch({
  initialSearch = "",
  placeholder = "Search university by name in English or Arabic (e.g. Cairo, جامعة عين شمس)...",
}: UniversitySearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search.trim()) {
      params.set("search", search.trim());
    } else {
      params.delete("search");
    }
    params.set("page", "1");

    startTransition(() => {
      router.push(`/universities?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setSearch("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.set("page", "1");
    startTransition(() => {
      router.push(`/universities?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSearch} className="relative flex w-full items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          className="h-11 pl-10 pr-10 text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs"
        />
        {search && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button type="submit" disabled={isPending} className="h-11 px-5">
        {isPending ? "Searching..." : "Search"}
      </Button>
    </form>
  );
}
