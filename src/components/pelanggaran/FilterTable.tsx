"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface FilterOptions {
    types: string[];
    severities: string[];
    statuses: string[];
}

interface Filters {
    startDate: string;
    endDate: string;
    status: string;
    severity: string;
    violationType: string;
}

interface PelanggaranFiltersProps {
    showFilters: boolean;
    setShowFilters: (show: boolean) => void;
    search: string;
    setSearch: (search: string) => void;
    filters: Filters;
    onFilterChange: (key: string, value: string) => void;
    onClearFilters: () => void;
    filterOptions: FilterOptions;
    filteredCount: number;
    totalCount: number;
}

export default function PelangaranFilters({
    showFilters,
    setShowFilters,
    search,
    setSearch,
    filters,
    onFilterChange,
    onClearFilters,
    filterOptions,
    filteredCount,
    totalCount,
    }: PelanggaranFiltersProps) {
        return (
            <div className="space-y-4">
                {/* Header */}
                <div className="flex flex-wrap gap-2 justify-between items-center">
                    <div className="flex flex-1 items-center gap-2">
                        <div className="text-xs text-gray-600 ml-2">
                            <span className="font-medium text-blue-600">{filteredCount}</span> dari {totalCount} data
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
               {showFilters && (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
                <Label htmlFor="startDate">Tanggal Mulai</Label>
                <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => onFilterChange("startDate", e.target.value)}
                    className="h-9 text-sm bg-white"
                />
            </div>

            <div className="space-y-1">
                <Label htmlFor="endDate">Tanggal Selesai</Label>
                <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => onFilterChange("endDate", e.target.value)}
                    className="h-9 text-sm bg-white"
                />
            </div>

            <div className="space-y-1">
                <Label htmlFor="status">Status</Label>
                <Select
                    value={filters.status}
                    onValueChange={(value) =>
                        onFilterChange("status", value === "all" ? "" : value)
                    }
                >
                    <SelectTrigger className="h-9 text-sm bg-white">
                        <SelectValue placeholder="Semua Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                        <SelectItem value="all">Semua Status</SelectItem>
                        {filterOptions.statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                                {status}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1">
                <Label htmlFor="severity">Tingkat Pelanggaran</Label>
                <Select
                    value={filters.severity}
                    onValueChange={(value) =>
                        onFilterChange("severity", value === "all" ? "" : value)
                    }
                >
                    <SelectTrigger className="h-9 text-sm bg-white">
                        <SelectValue placeholder="Semua Tingkat" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                        <SelectItem value="all">Semua Tingkat</SelectItem>
                        {filterOptions.severities.map((severity) => (
                            <SelectItem key={severity} value={severity}>
                                {severity}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1">
                <Label htmlFor="violationType">Jenis Pelanggaran</Label>
                <Select
                    value={filters.violationType}
                    onValueChange={(value) =>
                        onFilterChange("violationType", value === "all" ? "" : value)
                    }
                >
                    <SelectTrigger className="h-9 text-sm bg-white">
                        <SelectValue placeholder="Semua Jenis" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                        <SelectItem value="all">Semua Jenis</SelectItem>
                        {filterOptions.types.map((type) => (
                            <SelectItem key={type} value={type}>
                                {type}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    </div>
)}
</div>
        );
    }

