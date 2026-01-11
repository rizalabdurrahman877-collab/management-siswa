"use client";

import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Pelanggaran, Kelas } from "@/types";

interface ExportButtonsProps {
  data: Pelanggaran[];
  kelas?: Kelas[];
}
export default function ExportTable({ data, kelas }: ExportButtonsProps) {
  const exportViolationsToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((v) => ({
        ID: v.id,
        "Nama Siswa": v.siswa?.full_name ?? "",
        NIS: v.siswa?.nis ?? "",
        Kelas: v.siswa?.kelas?.kelas ?? "",
        "Jenis Pelanggaran": v.jenis_pelanggaran ?? "",
        Tingkat: v.tingkat ?? "",
        Poin: v.poin ?? "",
        Tanggal: v.tanggal ?? "",
        Waktu: v.waktu ?? "",
        Lokasi: v.lokasi ?? "",
        Deskripsi: v.deskripsi ?? "",
        Status: v.status ?? "",
        "Dilaporkan Oleh": v.dilaporkan_oleh ?? "",
        "Tanggal Tindak Lanjut": v.tanggal_tindak_lanjut ?? "",
        Catatan: v.catatan ?? "",
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pelanggaran");
    XLSX.writeFile(
      workbook,
      `pelanggaran_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  const exportViolationsToPDF = () => {
    const doc = new jsPDF();
    doc.text("Laporan Data Pelanggaran", 14, 16);

    autoTable(doc, {
      startY: 20,
      head: [
        [
          "ID",
          "Nama Siswa",
          "NIS",
          "Kelas",
          "Jenis Pelanggaran",
          "Tingkat",
          "Poin",
          "Tanggal",
          "Waktu",
          "Lokasi",
          "Deskripsi",
          "Status",
          "Dilaporkan Oleh",
          "Tanggal Tindak Lanjut",
          "Catatan",
        ],
      ],
      body: data.map((v) => [
        String(v.id ?? ""),
        String(v.siswa?.full_name ?? ""),
        String(v.siswa?.nis ?? ""),
        String(v.siswa?.kelas?.kelas ?? ""),
        String(v.jenis_pelanggaran ?? ""),
        String(v.tingkat ?? ""),
        String(v.poin ?? ""),
        String(v.tanggal ?? ""),
        String(v.waktu ?? ""),
        String(v.lokasi ?? ""),
        String(v.deskripsi ?? ""),
        String(v.status ?? ""),
        String(v.dilaporkan_oleh ?? ""),
        String(v.tanggal_tindak_lanjut ?? ""),
        String(v.catatan ?? ""),
      ]),
      styles: { fontSize: 7 },
    });

    doc.save(`pelanggaran_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={exportViolationsToExcel}
        className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-200 border-green-200"
      >
        Export as Excel
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportViolationsToPDF}
        className="flex items-center gap-1 bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200"
      >
        Download PDF
      </Button>
    </div>
  );
}
