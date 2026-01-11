"use client";

import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit, Filter, X } from "lucide-react";
import PelanggaranTable from "@/components/pelanggaran/PelanggaranTable";
import AddPelanggaranDialog from "@/components/pelanggaran/AddPelanggaranDialog";
import EditPelanggaranDialog from "@/components/pelanggaran/EditPelanggaranDialog";
import PelangaranFilters from "@/components/pelanggaran/FilterTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExportTable } from "@/components/pelanggaran/ExportTabel"
import { supabase } from "@/lib/supabase";
import type { Pelanggaran, Siswa, Kelas } from "@/types/";


export default function PelanggaranPage() {
  const [violations, setViolations] = useState<Pelanggaran[]>( []);
  const [dataSiswa, setDataSiswa] = useState<Siswa[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingViolation, setEditingViolation] = useState<Pelanggaran | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
    severity: "",
    violationType: "",
  });
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  const formatError = (e: any) => {
    try {
      if (!e) return "Unknown error";
      if (typeof e === "string") return e;
      // prefer message/details
      const msg = e.message || e.details || e.hint || null;
      if (msg) return msg;
      // try to serialize own properties (useful when error prints as {})
      try {
        return JSON.stringify(e, Object.getOwnPropertyNames(e), 2);
      }
      catch (serr) {
        return String(e);
      }
    }
    catch (err) {
      return String(err);
    }
  };

  const parseMissingColumnsFromError = (err: any): string[] => {
    const msg = formatError(err).toString();
    const regex = /Could not find the '([^']+)' column/gi;
    const cols: string[] = [];
    let m: RegExpExecArray | null;
    // eslint-disable-next-line no-cond-assign
    while ((m = regex.exec(msg)) !== null) {
      if (m[1]) cols.push(m[1]);
    }
    return cols;
  };

  // Helpers to validate/sanitize date and time fields so we don't send invalid strings to Postgres
  const isValidDateString = (d: any) => {
    if (!d || typeof d !== "string") return false;
    // accept YYYY-MM-DD
    return /^\d{4}-\d{2}-\d{2}$/.test(d);
  };

  const isValidTimeString = (t: any) => {
    if (!t || typeof t !== "string") return false;
    // accept HH:MM or HH:MM:SS
    return /^\d{2}:\d{2}(:\d{2})?$/.test(t);
  };

  const sanitizeDateTimeFields = (obj: Record<string, any>) => {
    // normalize empty strings to null and validate formats
    ["tanggal", "tanggal_tindak_lanjut"].forEach((key) => {
      if (key in obj) {
        if (!isValidDateString(obj[key])) {
          if (obj[key] === "" || obj[key] == null) obj[key] = null;
          else {
            console.warn(`Sanitizing invalid date field ${key}:`, obj[key]);
            obj[key] = null;
          }
        }
      }
    });

    if ("waktu" in obj) {
      if (!isValidTimeString(obj["waktu"])) {
        if (obj["waktu"] === "" || obj["waktu"] == null) obj["waktu"] = null;
        else {
          console.warn("Sanitizing invalid time field 'waktu':", obj["waktu"]);
          obj["waktu"] = null;
        }
      }
    }

    return obj;
  };

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);

    try {
      // fetch siswa and pelanggarans and users in parallel
      const [siswaRes, pelanggaranRes, usersRes] = await Promise.all([
        supabase.from("siswas").select("*, kelas(*)").order("id", { ascending: true }),
        supabase.from("pelanggarans").select("*, siswa:siswas(*, kelas(*))").order("id", { ascending: false }),
        supabase.from("users").select("id, name, email, created_at, updated_at").order("id", { ascending: true }),
      ]);

      if (siswaRes.error) throw new Error(`Error fetching siswas: ${formatError(siswaRes.error)}`);
      if (pelanggaranRes.error) throw new Error(`Error fetching pelanggarans: ${formatError(pelanggaranRes.error)}`);

      // users may fail if RBAC or table missing; handle gracefully
      if (usersRes.error) {
        console.warn("Warning: Could not fetch users:", formatError(usersRes.error));
      }

      const usersMap: Record<number, any> = (usersRes.data || []).reduce((acc: Record<number, any>, u: any) => {
        acc[u.id] = u;
        return acc;
      }, {});

      const mergedPelanggarans = (pelanggaranRes.data || []).map((p: any) => ({
        ...p,
        dilaporkan_oleh_user: usersMap[p.dilaporkan_oleh] || null,
      }));

      setDataSiswa(siswaRes.data || []);
      setViolations(mergedPelanggarans || []);
    }
    catch (err: any) {
      // log with more detail so we can see helpful info in console
      console.error("Error fetching data from Supabase:", formatError(err));
      // fallback to mock data to avoid breaking the UI

      alert(`Gagal memuat data dari server: ${formatError(err)}. Menggunakan data mock.`);
    }
    finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredViolations = useMemo(() => {
    return violations.filter((v) => {
      if (filters.startDate && new Date(v.tanggal) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(v.tanggal) > new Date(filters.endDate)) return false;

      if (filters.status && v.status !== filters.status) return false;
      if (filters.severity && v.tingkat !== filters.severity) return false;
      if (filters.violationType && v.jenis_pelanggaran !== filters.violationType) return false;

      if (search) {
        const q = search.toLowerCase();
        return (
          v.siswa?.full_name.toLowerCase().includes(q) ||
          v.siswa?.nis.toLowerCase().includes(q) ||
          v.siswa?.kelas?.kelas.toLowerCase().includes(q) ||
          v.jenis_pelanggaran.toLowerCase().includes(q) ||
          v.lokasi.toLowerCase().includes(q) ||
          v.deskripsi.toLowerCase().includes(q) ||
          v.tingkat.toLowerCase().includes(q)
        )
      }

      return true;
    });
  }, [violations, filters, search]);

  const handleAdd = async (newV: Omit<Pelanggaran, "id" | "created_at" | "updated_at" | "siswa" | "dilaporkan_oleh_user">) => {
    // normalize payload but do NOT send `url` to pelanggarans (evidence stored separately)
    const uploadedUrl = (newV as any).url || null;

    const payload: Record<string, any> = {
      siswa_id: newV.siswa_id,
      dilaporkan_oleh: (newV as any).dilaporkan_oleh ?? 1,
      jenis_pelanggaran: (newV.jenis_pelanggaran || "").trim(),
      tingkat: newV.tingkat,
      poin: newV.poin,
      tanggal: newV.tanggal,
      waktu: newV.waktu,
      lokasi: newV.lokasi,
      deskripsi: newV.deskripsi ?? null,
      status: newV.status,
      tindakan: newV.tindakan ?? null,
      tanggal_tindak_lanjut: newV.tanggal_tindak_lanjut ?? null,
      catatan: newV.catatan ?? null,
      // do not include url here
    };

    const attemptInsert = async (pl: Record<string, any>) => {
      pl = sanitizeDateTimeFields(pl);
      return await supabase.from("pelanggarans").insert([pl]).select("*, siswa:siswas(*, kelas(*))").single();
    };

    try {
      // sanitize before first attempt
      sanitizeDateTimeFields(payload);
      let { data: inserted, error } = await attemptInsert(payload);

      if (error) {
        // More detailed logging to help debug empty error objects
        try {
          console.error("Error inserting pelanggaran (raw):", error);
          console.error("Error keys:", Object.keys(error || {}));
          console.error("Error own props:", Object.getOwnPropertyNames(error || {}));
          console.error("Error stringified:", JSON.stringify(error, Object.getOwnPropertyNames(error || {}), 2));
        } catch (logErr) {
          console.error("Error serializing insert error:", logErr, error);
        }

        const missing = parseMissingColumnsFromError(error);
        if (missing.length > 0) {
          // remove unsupported columns and retry
          missing.forEach((c) => delete payload[c]);
          console.warn("Retrying insert without columns:", missing);
          const { data: inserted2, error: error2 } = await attemptInsert(payload);
          if (error2) {
            console.error("Insert retry also failed:", error2);
            const msg = formatError(error2);
            alert(`Gagal menambahkan pelanggaran: ${msg}. Periksa permission tabel 'pelanggarans' atau struktur tabel.`);
            return;
          }

          inserted = inserted2;
        } else {
          const msg = formatError(error);
          // If message is just "{}" or too generic, give extra guidance
          const extra = msg && msg.trim() && msg !== "{}" ? msg : "Unknown insert error - lihat console untuk detail (kunci/props error tercetak).";
          alert(`Gagal menambahkan pelanggaran: ${extra} Periksa permission tabel 'pelanggarans' (RLS) atau lihat konsol untuk detail.`);
          return;
        }
      }

      console.info("Pelanggaran inserted:", inserted);

      // If there's an uploaded file URL, save it to the evidence table (bukti_pelanggarans)
      if (uploadedUrl && inserted && (inserted as any).id) {
        try {
          const evidencePayload = {
            pelanggaran_id: (inserted as any).id,
            tipe: "image",
            url: uploadedUrl,
            deskripsi: "Foto Bukti Pelanggaran",
            nama: uploadedUrl.split("/").pop() || "bukti",
            diunggah_oleh: (newV as any).dilaporkan_oleh ?? 1,
          } as Record<string, any>;

          const { error: evidenceError } = await supabase.from("bukti_pelanggarans").insert([evidencePayload]);
          if (evidenceError) {
            console.warn("Could not insert evidence record:", formatError(evidenceError));
            alert("Pelanggaran ditambahkan, tetapi gagal menyimpan bukti (periksa tabel 'bukti_pelanggarans' atau permission)." );
          } else {
            console.info("Evidence saved for pelanggaran", (inserted as any).id);
          }
        }
        catch (err) {
          console.error("Error saving evidence:", err);
          alert("Pelanggaran ditambahkan, tetapi terjadi kesalahan saat menyimpan bukti. Lihat console untuk detail.");
        }
      }

      setAddDialogOpen(false);
      alert("Pelanggaran berhasil ditambahkan.");
      await fetchData(false);
    }
    catch (err: any) {
      console.error("Unhandled error adding pelanggaran:", err);
      const msg = err?.message || String(err);
      alert(`Gagal menambahkan pelanggaran: ${msg}. Lihat console untuk detail.`);
    }
  }; 

  const handleEdit = (violation: Pelanggaran) => {
    setEditingViolation(violation);
    setEditDialogOpen(true);
  };

  const handleUpdate = async (updatedV: Pelanggaran) => {
    // if url present, we'll not send it to pelanggarans; instead, save it to evidence table
    const uploadedUrl = (updatedV as any).url ?? null;

    const payload: Record<string, any> = {
      siswa_id: updatedV.siswa_id,
      jenis_pelanggaran: updatedV.jenis_pelanggaran,
      tingkat: updatedV.tingkat,
      poin: updatedV.poin,
      tanggal: updatedV.tanggal,
      waktu: updatedV.waktu,
      lokasi: updatedV.lokasi,
      deskripsi: updatedV.deskripsi,
      status: updatedV.status,
      tindakan: updatedV.tindakan ?? null,
      tanggal_tindak_lanjut: updatedV.tanggal_tindak_lanjut ?? null,
      catatan: updatedV.catatan ?? null,
      // do not send url here
    };

    const attemptUpdate = async (pl: Record<string, any>) => {
      pl = sanitizeDateTimeFields(pl);
      return await supabase.from("pelanggarans").update(pl).eq("id", updatedV.id).select("*, siswa:siswas(*, kelas(*))").single();
    };

    try {
      // sanitize before first attempt
      sanitizeDateTimeFields(payload);
      let { data: updated, error } = await attemptUpdate(payload);

      if (error) {
        console.error("Error updating pelanggaran:", error);
        const missing = parseMissingColumnsFromError(error);
        if (missing.length > 0) {
          missing.forEach((c) => delete payload[c]);
          console.warn("Retrying update without columns:", missing);
          const { data: updated2, error: error2 } = await attemptUpdate(payload);
          if (error2) {
            console.error("Update retry also failed:", error2);
            const msg = formatError(error2);
            alert(`Gagal memperbarui pelanggaran: ${msg}. Periksa struktur tabel 'pelanggarans' atau permission.`);
            return;
          }

          updated = updated2;
        } else {
          const msg = formatError(error);
          alert(`Gagal memperbarui pelanggaran: ${msg}. Lihat console untuk detail.`);
          return;
        }
      }

      // if uploadedUrl exists, insert into bukti_pelanggarans
      if (uploadedUrl && updated && (updated as any).id) {
        try {
          const evidencePayload = {
            pelanggaran_id: (updated as any).id,
            tipe: "image",
            url: uploadedUrl,
            deskripsi: "Foto Bukti Pelanggaran",
            nama: uploadedUrl.split("/").pop() || "bukti",
            diunggah_oleh: (updatedV as any).dilaporkan_oleh ?? 1,
          } as Record<string, any>;

          const { error: evidenceError } = await supabase.from("bukti_pelanggarans").insert([evidencePayload]);
          if (evidenceError) {
            console.warn("Could not insert evidence record:", formatError(evidenceError));
            alert("Pelanggaran diperbarui, tetapi gagal menyimpan bukti (periksa tabel 'bukti_pelanggarans' atau permission)." );
          } else {
            console.info("Evidence saved for pelanggaran", (updated as any).id);
          }
        } catch (err) {
          console.error("Error saving evidence:", err);
          alert("Pelanggaran diperbarui, tetapi terjadi kesalahan saat menyimpan bukti. Lihat console untuk detail.");
        }
      }

      setEditDialogOpen(false);
      setEditingViolation(null);
      alert("Pelanggaran berhasil diperbarui.");
      await fetchData(false);
    }
    catch (err: any) {
      console.error("Unhandled error updating pelanggaran:", err);
      const msg = err?.message || String(err);
      alert(`Gagal memperbarui pelanggaran: ${msg}. Lihat console untuk detail.`);
    }
  }; 

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from("pelanggarans")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting pelanggaran:", error);
        alert("Gagal menghapus pelanggaran.");
        return;
      }

      alert("Pelanggaran berhasil dihapus.");
      await fetchData(false);
    }
    catch (err) {
      console.error(err);
      alert("Gagal menghapus pelanggaran.");
    }
  }

  const clearFilters = () => {
    setFilters({
      startDate: "", endDate: "", status: "", severity: "", violationType: ""
    });
    setSearch("");
  }

  if (loading) {
    return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-lg">Memuat data...</div>
    </div>
    );
  }

  return (
   <div className="space-y-4">
    <h1 className="text-2xl font-bold">Data Pelanggaran</h1>
    <ExportTable data={filteredViolations} />

    <Card className="p-4 shadow bg-white">
      <div className="space-4-y">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex flex-1 items-center gap-2">
            <Input
              placeholder="Cari..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 text-sm w-full sm:w-[300px]"
            />
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h- w-4" /> Filter
            </Button>
            {showFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <X className="h-4 w-4" /> Reset
                </Button>
            )}
          </div>
            <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger className="w-20 h-9 text-sm">
                <SelectValue placeholder="Jumlah" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {[10, 25, 50, 100].map((n) => (
                  <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <AddPelanggaranDialog
              open={addDialogOpen}
              onOpenChange={setAddDialogOpen}
              onAdd={handleAdd}
              dataSiswa={dataSiswa}
            />
        </div>

        {showFilters && (
          <PelangaranFilters
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            search={search}
            setSearch={setSearch}
            filters={filters}
            onFilterChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
            onClearFilters={clearFilters}
            filterOptions={{
              types: [...new Set(violations.map(v => v.jenis_pelanggaran))],
              severities: ["Ringan", "Sedang", "Berat"],
              statuses: ["Aktif", "Selesai"],
            }}
            filteredCount={filteredViolations.length}
            totalCount={violations.length}
          />
        )}

        <PelanggaranTable
          violations={filteredViolations}
          onEdit={handleEdit}
          onDelete={handleDelete}
          pageSize={pageSize}
        />
      </div>
    </Card>

    <EditPelanggaranDialog
      open={editDialogOpen}
      onOpenChange={setEditDialogOpen}
      violation={editingViolation}
      onUpdate={handleUpdate}
    /> 
   </div>
  )
}