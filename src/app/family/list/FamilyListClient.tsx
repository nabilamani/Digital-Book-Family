"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, BookCheck, X, RefreshCw, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FamilyTableRow } from "./FamilyTableRow";
import { updatePaperBookStatus } from "@/actions/family-actions";

interface FamilyListClientProps {
  initialFamilies: any[];
}

export function FamilyListClient({ initialFamilies }: FamilyListClientProps) {
  // 1. Paper Book Checklist State (localStorage + Supabase sync)
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    initialFamilies.forEach((f) => {
      if (f.head?.id) {
        initial[f.head.id] = Boolean(f.head.is_in_paper_book);
      }
    });
    return initial;
  });

  // Load from localStorage on mount for extra persistence
  useEffect(() => {
    try {
      const saved = localStorage.getItem("paper_book_checked_ids");
      if (saved) {
        const parsedIds: string[] = JSON.parse(saved);
        setCheckedMap((prev) => {
          const updated = { ...prev };
          parsedIds.forEach((id) => {
            updated[id] = true;
          });
          return updated;
        });
      }
    } catch (e) {
      console.warn("Could not read paper_book_checked_ids from localStorage", e);
    }
  }, []);

  const handleTogglePaperBook = async (personId: string, newValue: boolean) => {
    // Optimistic UI update
    setCheckedMap((prev) => {
      const updated = { ...prev, [personId]: newValue };
      
      // Sync to localStorage
      try {
        const checkedIds = Object.keys(updated).filter((id) => updated[id]);
        localStorage.setItem("paper_book_checked_ids", JSON.stringify(checkedIds));
      } catch (e) {
        console.warn("Could not save to localStorage", e);
      }

      return updated;
    });

    // Call server action
    await updatePaperBookStatus(personId, newValue);
  };

  // 2. Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "checked" | "unchecked">("all");
  const [sortBy, setSortBy] = useState<string>("name_asc");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // Mobile filter drawer state & touch gestures
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [filterTouchStartY, setFilterTouchStartY] = useState<number | null>(null);
  const [filterDragOffsetY, setFilterDragOffsetY] = useState(0);
  const [isFilterDragging, setIsFilterDragging] = useState(false);

  const handleFilterTouchStart = (e: React.TouchEvent) => {
    setFilterTouchStartY(e.touches[0].clientY);
    setIsFilterDragging(true);
  };

  const handleFilterTouchMove = (e: React.TouchEvent) => {
    if (filterTouchStartY === null) return;
    const deltaY = e.touches[0].clientY - filterTouchStartY;
    if (deltaY > 0) {
      setFilterDragOffsetY(deltaY);
    }
  };

  const handleFilterTouchEnd = () => {
    setIsFilterDragging(false);
    if (filterDragOffsetY > 100) {
      setIsMobileFilterOpen(false);
    }
    setFilterDragOffsetY(0);
    setFilterTouchStartY(null);
  };


  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, sortBy, pageSize]);

  // 3. Filter and Sort Logic
  const filteredAndSortedFamilies = useMemo(() => {
    let result = [...initialFamilies];

    // Search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((f) => {
        const headName = f.head?.full_name?.toLowerCase() || "";
        const wifeName = f.wife?.full_name?.toLowerCase() || "";
        const address = f.head?.address?.toLowerCase() || "";
        const childrenNames = (f.children || [])
          .map((c: any) => c.full_name?.toLowerCase() || "")
          .join(" ");

        return (
          headName.includes(query) ||
          wifeName.includes(query) ||
          address.includes(query) ||
          childrenNames.includes(query)
        );
      });
    }

    // Category filter (Checklist status)
    if (categoryFilter === "checked") {
      result = result.filter((f) => Boolean(checkedMap[f.head?.id]));
    } else if (categoryFilter === "unchecked") {
      result = result.filter((f) => !Boolean(checkedMap[f.head?.id]));
    }

    // Sorting
    result.sort((a, b) => {
      const headA = a.head?.full_name || "";
      const headB = b.head?.full_name || "";
      const isCheckedA = Boolean(checkedMap[a.head?.id]);
      const isCheckedB = Boolean(checkedMap[b.head?.id]);

      if (sortBy === "name_asc") {
        return headA.localeCompare(headB, "id-ID");
      }
      if (sortBy === "name_desc") {
        return headB.localeCompare(headA, "id-ID");
      }
      if (sortBy === "paper_checked_first") {
        if (isCheckedA === isCheckedB) return headA.localeCompare(headB, "id-ID");
        return isCheckedA ? -1 : 1;
      }
      if (sortBy === "paper_unchecked_first") {
        if (isCheckedA === isCheckedB) return headA.localeCompare(headB, "id-ID");
        return isCheckedA ? 1 : -1;
      }
      if (sortBy === "newest") {
        const dateA = new Date(a.head?.created_at || 0).getTime();
        const dateB = new Date(b.head?.created_at || 0).getTime();
        return dateB - dateA;
      }
      if (sortBy === "oldest") {
        const dateA = new Date(a.head?.created_at || 0).getTime();
        const dateB = new Date(b.head?.created_at || 0).getTime();
        return dateA - dateB;
      }
      return 0;
    });

    return result;
  }, [initialFamilies, searchQuery, categoryFilter, sortBy, checkedMap]);

  // 4. Pagination calculations
  const totalItems = filteredAndSortedFamilies.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);

  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const currentFamilies = useMemo(() => {
    return filteredAndSortedFamilies.slice(startIndex, endIndex);
  }, [filteredAndSortedFamilies, startIndex, endIndex]);

  // Total stats for badges
  const totalCheckedCount = useMemo(() => {
    return initialFamilies.filter((f) => Boolean(checkedMap[f.head?.id])).length;
  }, [initialFamilies, checkedMap]);

  const hasActiveFilters = searchQuery !== "" || categoryFilter !== "all" || sortBy !== "name_asc";
  const activeFilterCount = (categoryFilter !== "all" ? 1 : 0) + (sortBy !== "name_asc" ? 1 : 0);

  const handleResetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setSortBy("name_asc");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Controls Toolbar */}
      <div className="bg-card border border-border p-4 md:p-5 rounded-xl shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari Kepala Keluarga, Istri, Alamat, atau Anak..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-10 pr-9 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile Filter Toggle Button (< md) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex md:hidden items-center gap-1.5 text-xs h-9 px-3 shrink-0 border-border bg-background text-foreground hover:bg-muted"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-primary text-black font-bold text-[10px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {/* Desktop Filter Controls Group (md+) */}
          <div className="hidden md:flex flex-wrap items-center gap-2 md:gap-3 shrink-0">
            
            {/* Category Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground">
              <Filter className="w-3.5 h-3.5 text-primary shrink-0" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="bg-transparent font-medium focus:outline-none cursor-pointer pr-1 text-foreground"
              >
                <option value="all" className="bg-card text-foreground">Semua Data ({initialFamilies.length})</option>
                <option value="checked" className="bg-card text-foreground">Sudah di Buku Kertas ({totalCheckedCount})</option>
                <option value="unchecked" className="bg-card text-foreground">Belum di Buku Kertas ({initialFamilies.length - totalCheckedCount})</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground">
              <ArrowUpDown className="w-3.5 h-3.5 text-primary shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-medium focus:outline-none cursor-pointer pr-1 text-foreground"
              >
                <option value="name_asc" className="bg-card text-foreground">Nama (A - Z)</option>
                <option value="name_desc" className="bg-card text-foreground">Nama (Z - A)</option>
                <option value="paper_checked_first" className="bg-card text-foreground">Buku Kertas (Sudah dulu)</option>
                <option value="paper_unchecked_first" className="bg-card text-foreground">Buku Kertas (Belum dulu)</option>
                <option value="newest" className="bg-card text-foreground">Terbaru</option>
                <option value="oldest" className="bg-card text-foreground">Terlama</option>
              </select>
            </div>

            {/* Items Per Page Select */}
            <div className="flex items-center gap-1.5 bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground">
              <span className="text-muted-foreground">Show:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-transparent font-medium focus:outline-none cursor-pointer text-foreground"
              >
                <option value={5} className="bg-card text-foreground">5 / hal</option>
                <option value={10} className="bg-card text-foreground">10 / hal</option>
                <option value={20} className="bg-card text-foreground">20 / hal</option>
                <option value={50} className="bg-card text-foreground">50 / hal</option>
                <option value={100} className="bg-card text-foreground">100 / hal</option>
              </select>
            </div>

            {/* Reset Button if Filters Active */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground shrink-0 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </Button>
            )}

          </div>

        </div>

        {/* Stats Summary Bar */}
        <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/60 gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span>
              Total: <strong className="text-foreground font-semibold">{totalItems}</strong> keluarga
            </span>
            <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full font-medium text-[11px]">
              <BookCheck className="w-3 h-3" /> {totalCheckedCount} / {initialFamilies.length} di Buku Kertas
            </span>
          </div>

          <div>
            Menampilkan <strong className="text-foreground">{totalItems > 0 ? startIndex + 1 : 0}</strong> - <strong className="text-foreground">{endIndex}</strong> dari <strong className="text-foreground">{totalItems}</strong>
          </div>
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 md:hidden">
          <div className="absolute inset-0" onClick={() => setIsMobileFilterOpen(false)} aria-hidden="true" />
          
          <div
            style={{
              transform: filterDragOffsetY > 0 ? `translateY(${filterDragOffsetY}px)` : "none",
              transition: isFilterDragging ? "none" : "transform 0.2s ease-out",
            }}
            className="relative w-full bg-card border-t border-border rounded-t-2xl p-5 space-y-5 z-10 animate-in slide-in-from-bottom-5 duration-200"
          >
            {/* Grab Handle Header for Touch Drag Swipe Down */}
            <div
              onTouchStart={handleFilterTouchStart}
              onTouchMove={handleFilterTouchMove}
              onTouchEnd={handleFilterTouchEnd}
              className="py-2 text-center cursor-grab active:cursor-grabbing touch-none -mt-2 -mx-5 px-5"
            >
              <div className="w-12 h-1.5 bg-muted-foreground/50 rounded-full mx-auto" />
            </div>
            
            <div
              onTouchStart={handleFilterTouchStart}
              onTouchMove={handleFilterTouchMove}
              onTouchEnd={handleFilterTouchEnd}
              className="flex items-center justify-between border-b border-border pb-3 touch-none"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-foreground text-base">Filter & Shortir</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>


            <div className="space-y-4 text-sm">
              {/* Category Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Kategori Buku Kertas</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as any)}
                  className="w-full bg-background border border-border rounded-lg p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="all" className="bg-card text-foreground">Semua Data ({initialFamilies.length})</option>
                  <option value="checked" className="bg-card text-foreground">Sudah di Buku Kertas ({totalCheckedCount})</option>
                  <option value="unchecked" className="bg-card text-foreground">Belum di Buku Kertas ({initialFamilies.length - totalCheckedCount})</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Urutkan Data (Sortir)</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="name_asc" className="bg-card text-foreground">Nama (A - Z)</option>
                  <option value="name_desc" className="bg-card text-foreground">Nama (Z - A)</option>
                  <option value="paper_checked_first" className="bg-card text-foreground">Buku Kertas (Sudah dulu)</option>
                  <option value="paper_unchecked_first" className="bg-card text-foreground">Buku Kertas (Belum dulu)</option>
                  <option value="newest" className="bg-card text-foreground">Terbaru</option>
                  <option value="oldest" className="bg-card text-foreground">Terlama</option>
                </select>
              </div>

              {/* Items per Page */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Jumlah Data per Halaman</label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="w-full bg-background border border-border rounded-lg p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value={5} className="bg-card text-foreground">5 Data per Halaman</option>
                  <option value={10} className="bg-card text-foreground">10 Data per Halaman</option>
                  <option value={20} className="bg-card text-foreground">20 Data per Halaman</option>
                  <option value={50} className="bg-card text-foreground">50 Data per Halaman</option>
                  <option value={100} className="bg-card text-foreground">100 Data per Halaman</option>
                </select>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={() => {
                    handleResetFilters();
                    setIsMobileFilterOpen(false);
                  }}
                  className="flex-1 text-xs"
                >
                  Reset Filter
                </Button>
              )}
              <Button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 bg-primary text-black hover:bg-primary/90 text-xs font-semibold"
              >
                Terapkan Filter
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Card List (< md) */}
      <div className="block md:hidden space-y-3">
        {currentFamilies.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground bg-card rounded-lg border border-border text-sm space-y-2">
            <p>Tidak ada data keluarga yang sesuai dengan filter.</p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={handleResetFilters} className="text-xs">
                Reset Filter
              </Button>
            )}
          </div>
        ) : (
          currentFamilies.map((family) => (
            <FamilyTableRow
              key={family.head.id}
              family={family}
              isMobileCard
              isPaperBookChecked={Boolean(checkedMap[family.head.id])}
              onTogglePaperBook={handleTogglePaperBook}
            />
          ))
        )}
      </div>

      {/* Desktop Table (md+) */}
      <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b border-border">
              <tr>
                <th className="px-4 py-4 text-center font-semibold w-14" title="Checklist jika sudah dimasukkan ke Buku Kertas">
                  [✓]
                </th>
                <th className="px-6 py-4 font-semibold">Nama Kepala Keluarga</th>
                <th className="px-6 py-4 font-semibold">Status Keluarga</th>
                <th className="px-6 py-4 font-semibold">Nama Istri</th>
                <th className="px-6 py-4 font-semibold">Alamat</th>
                <th className="px-6 py-4 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {currentFamilies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground space-y-3">
                    <p>Tidak ada data keluarga yang sesuai dengan kriteria pencarian / filter.</p>
                    {hasActiveFilters && (
                      <Button variant="outline" size="sm" onClick={handleResetFilters} className="text-xs">
                        Reset Filter
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                currentFamilies.map((family) => (
                  <FamilyTableRow
                    key={family.head.id}
                    family={family}
                    isPaperBookChecked={Boolean(checkedMap[family.head.id])}
                    onTogglePaperBook={handleTogglePaperBook}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-muted-foreground">
            Halaman <strong className="text-foreground">{safePage}</strong> dari <strong className="text-foreground">{totalPages}</strong>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Prev Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={safePage === 1}
              className="h-8 px-3 text-xs flex items-center gap-1 rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1 max-w-[240px] overflow-x-auto py-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                const isSelected = pageNum === safePage;
                const isNearCurrent = Math.abs(pageNum - safePage) <= 2;
                const isFirst = pageNum === 1;
                const isLast = pageNum === totalPages;

                if (!isFirst && !isLast && !isNearCurrent) {
                  if (pageNum === safePage - 3 || pageNum === safePage + 3) {
                    return <span key={pageNum} className="text-xs text-muted-foreground px-1">...</span>;
                  }
                  return null;
                }

                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-primary text-black font-bold shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={safePage === totalPages}
              className="h-8 px-3 text-xs flex items-center gap-1 rounded-lg"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
