"use client";

import { useState } from "react";
import Link from "next/link";
import { UniversityDTO } from "../../types/university.types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Edit, Eye, Filter, Plus } from "lucide-react";

interface UniversityDataTableProps {
  universities: UniversityDTO[];
  total: number;
  currentPage: number;
  // In a real app we'd trigger a server action or push router params to change page
}

export function UniversityDataTable({ universities, total, currentPage }: UniversityDataTableProps) {
  const [search, setSearch] = useState("");

  const filtered = universities.filter(u => 
    u.nameEn.toLowerCase().includes(search.toLowerCase()) || 
    u.nameAr.includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input 
            placeholder="Search universities..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-[300px]"
          />
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <Link href="/admin/universities/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add University
          </Button>
        </Link>
      </div>

      <div className="rounded-md border bg-white">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Type / Model</th>
              <th className="px-6 py-3">Location</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No universities found.
                </td>
              </tr>
            ) : filtered.map((uni) => (
              <tr key={uni.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{uni.emoji}</span>
                    <div>
                      <div className="font-semibold">{uni.nameEn}</div>
                      <div className="text-xs text-gray-500">{uni.nameAr}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <Badge variant="outline" className="w-fit">{uni.type}</Badge>
                    <span className="text-xs text-gray-500">{uni.educationModel}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {uni.city ? `${uni.city}, ` : ''}{uni.governorate}
                </td>
                <td className="px-6 py-4">
                  <Badge 
                    variant={uni.publishStatus === 'PUBLISHED' ? 'default' : 'secondary'}
                    className={uni.publishStatus === 'PUBLISHED' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                  >
                    {uni.publishStatus}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/universities/${uni.slug}`} target="_blank">
                      <Button variant="ghost" size="icon" title="View Public Page">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/universities/${uni.id}/edit`}>
                      <Button variant="ghost" size="icon" title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Basic Pagination UI */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {filtered.length} of {total} results
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={currentPage <= 1}>Previous</Button>
          <Button variant="outline" disabled={filtered.length < 10}>Next</Button>
        </div>
      </div>
    </div>
  );
}
