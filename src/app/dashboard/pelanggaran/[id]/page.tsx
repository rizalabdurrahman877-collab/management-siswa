'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import InfoSiswa from "@/components/pelanggaran/details/infoSiswa";
import BuktiPelanggaran from "@/components/pelanggaran/details/BuktiPelanggaran";
import TindakanDiambil from "@/components/pelanggaran/details/TindakanDiambil";
import { Button } from "@/components/ui/button";
import { Check, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/lib/supabase";
import type { Pelanggaran, EvidenceItem } from "@/types";


export default function DetailPelanggaranPage() {
  const params = useParams();
  const id = params?.id;

  const [violation, setViolation] = useState<Pelanggaran | null>(null);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({ action: "", note: "", followUp: ""});
  const [selectedImage, setSelectedImage] = useState<null | string>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchViolation = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("pelanggarans")
          .select("*, siswa:siswas(*, kelas(*))")
          .eq("id", Number(id))
          .single();

        if (error) {
          console.error("Error fetching pelanggaran:", error);
          // If the error object is empty (opaque {}), try a raw REST fetch to capture
          // the real HTTP status and response body for diagnostics.
          if (error && Object.keys(error).length === 0) {
            console.debug("Opaque Supabase error detected ({}). Performing raw REST fetch for diagnostics...");
            try {
              const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
              const anon = process.env.NEXT_PUBLIC_ANON_KEY;
              const url = `${base}/rest/v1/pelanggarans?select=*,siswa:siswas(*,kelas(*)),dilaporkan_oleh_user:users(*)&id=eq.${id}`;
              const res = await fetch(url, {
                headers: {
                  apikey: anon || "",
                  Authorization: `Bearer ${anon || ""}`,
                  Accept: "application/json"
                }
              });

              const text = await res.text();
              console.debug("Raw REST fetch status:", res.status, res.statusText);
              // Try parsing as JSON for extra details
              try {
                const json = JSON.parse(text);
                console.debug("Raw REST fetch body (parsed):", json);
                if (Array.isArray(json) && json.length === 1) {
                  setViolation(json[0] as Pelanggaran);
                } else {
                  // fallback behavior: use dev-only dummy if configured, otherwise null
                  // Dev-only mocks are disabled; set to null (not found) in non-dev.
                  setViolation(null);
                }
              } catch (parseErr) {
                console.debug("Raw REST fetch body (text):", text);
                // Dev-only mocks are disabled; set to null (not found) in non-dev.
                setViolation(null);
              }
            } catch (rawErr) {
              console.error("Raw REST fetch failed:", rawErr);
              // Dev-only mocks are disabled; set to null (not found) in non-dev.
              setViolation(null);
            }
          } else {
            // Non-empty error object: use configured fallback policy
            setViolation(null);
          }
        } else {
          setViolation(data as Pelanggaran);
        }

        // fetch evidence separately (not all schemas may embed this)
        const { data: buktiData, error: buktiErr } = await supabase
          .from("bukti_pelanggarans")
          .select("*")
          .eq("pelanggaran_id", Number(id))
          .order("id", { ascending: true });

        if (!buktiErr) setEvidence(buktiData || []);
      }
      catch (err) {
        console.error("Unhandled error fetching violation:", err);
        setViolation(null);
      }
      finally {
        setLoading(false);
      }
    };

    fetchViolation();
  }, [id]);

  const formatError = (e: any) => {
    try {
      if (!e) return "Unknown error";
      return e.message || e.details || JSON.stringify(e);
    }
    catch (err) {
      return String(err);
    }
  };

  const handleInputChange = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value}));

  const handleActionSubmit = async () => {
    if (!violation || !id) return;
    setSaving(true);
    try {
      const { data: updated, error } = await supabase
        .from("pelanggarans")
        .update({
          tindakan: formData.action || null,
          tanggal_tindak_lanjut: formData.followUp || null,
          catatan: formData.note || null,
        })
        .eq("id", Number(id))
        .select("*, siswa:siswas(*, kelas(*)), dilaporkan_oleh_user:users(*)")
        .single();

      if (error) {
        console.error("Error saving action:", error);
        alert(`Gagal menyimpan tindakan: ${formatError(error)}`);
        return;
      }

      setViolation(updated as Pelanggaran);
      setIsEditModalOpen(false);
      setFormData({ action: "", note: "", followUp: "" });
      alert("Tindakan berhasil disimpan");

      // refresh bukti if needed
      const { data: buktiData } = await supabase.from("bukti_pelanggarans").select("*").eq("pelanggaran_id", Number(id));
      setEvidence(buktiData || []);
    }
    catch (err) {
      console.error("Unhandled error saving action:", err);
      alert("Gagal menyimpan tindakan. Lihat console untuk detail.");
    }
    finally {
      setSaving(false);
    }
  };

  const handleMarkAsComplete = async () => {
    if (!violation || !id) return;
    setSaving(true);
    try {
      const { data: updated, error } = await supabase
        .from("pelanggarans")
        .update({ status: "Selesai" })
        .eq("id", Number(id))
        .select("*, siswa:siswas(*, kelas(*)), dilaporkan_oleh_user:users(*)")
        .single();

      if (error) {
        console.error("Error marking as complete:", error);
        alert(`Gagal menandai selesai: ${formatError(error)}`);
        return;
      }

      setViolation(updated as Pelanggaran);
      alert("Pelanggaran berhasil ditandai sebagai selesai");
    }
    catch (err) {
      console.error("Unhandled error marking as complete:", err);
      alert("Gagal menandai selesai. Lihat console untuk detail.");
    }
    finally {
      setSaving(false);
    }
  };

  const evidenceItems: EvidenceItem[] = [
    ...(violation?.url ? [{
      id: 0,
      pelanggaran_id: violation!.id,
      tipe: "image",
      url: violation!.url!,
      deskripsi: "Foto Bukti Pelanggaran",
      nama: violation!.url!.split("/").pop() || "bukti",
      diunggah_oleh: violation!.dilaporkan_oleh?.name || "",
      waktu_unggah: violation!.created_at,
      pelanggaran: violation!,
    }] : []),
    ...evidence,
  ];


  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "ringan": return "bg-green-100 text-green-800";
      case "sedang": return "bg-yellow-100 text-yellow-800";
      case "berat": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
        switch (status) {
            case "Aktif": return "bg-orange-100 text-orange-800";
            case "Selesai": return "bg-green-100 text-green-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };



    const handleDownloadReport = () => {
      if (!violation) {
        alert("Data pelanggaran belum dimuat.");
        return;
      }
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Laporan Pelanggaran Siswa", 14, 20);

      autoTable(doc, {
        startY: 30,
        head: [["Kolom", "Detail"]],
        body: [
          ["Nama Siswa", violation.siswa?.full_name ?? 'N/A'],
          ["NIS", violation.siswa?.nis ?? 'N/A'],
          ["Kelas", violation.siswa?.kelas?.kelas ?? 'N/A'],
          ["Jenis Pelanggaran", violation.jenis_pelanggaran],
          ["Tingkat", violation.tingkat],
          ["Poin", violation.poin.toString()],
          ["Tanggal & Waktu", `${violation.tanggal} | ${violation.waktu}`],
          ["Lokasi", violation.lokasi],
          ["Status", violation.status],
          ["Dilaporkan Oleh", violation.dilaporkan_oleh?.name ?? 'N/A'],
          ["Deskripsi Kejadian", violation.deskripsi]
        ],
        styles: { fontSize: 10 },
        columnStyles: { 0: { fontStyle: "bold" } }
      });

      let nextY = (doc as any).lastAutoTable?.finalY + 10 || 100;
      doc.setFontSize(12);
      doc.text("Bukti Pelanggaran", 14, nextY);
      nextY += 6;

      evidence.forEach(b => {
        doc.setFontSize(10);
        doc.text(
          `* [${b.tipe}] ${b.deskripsi || b.nama || "-"} | Oleh: ${b.diunggah_oleh} | ${b.waktu_unggah}`,
          14,
          nextY,
          { maxWidth: 180 }
        );
        nextY += 6;
      });

      nextY += 4;
      doc.setFontSize(12);
      doc.text("Tindakan yang Diambil:", 14, nextY);
      nextY += 6;

      doc.setFontSize(10);
      doc.text(`Sanksi / Tindakan: ${violation.tindakan || '-'}`, 14, nextY);
      nextY += 6;
      doc.text(`Tanggal Tindak Lanjut: ${violation.tanggal_tindak_lanjut || '-'}`, 14, nextY);
      nextY += 6;
      doc.text(`Catatan: ${violation.catatan || '-'}`, 14, nextY, { maxWidth: 180 });

      doc.save(`laporan_pelanggaran_${violation.siswa?.nis ?? 'unknown'}.pdf`);
    };
  if (loading) {
    return <div className="min-h-screen p-4">Memuat...</div>;
  }
  if (!violation) {
    return <div className="min-h-screen p-4">Data pelanggaran tidak ditemukan.</div>;
  }
  return (
    <div className="mih-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto space-y-6 ">
        <InfoSiswa data={violation} getSeverityColor={getSeverityColor} getStatusColor={getStatusColor} />
        <BuktiPelanggaran bukti={evidence} onLihat={(url) => setSelectedImage(url)} />
          <TindakanDiambil
            actionTaken={violation.tindakan}
            followUpDate={violation.tanggal_tindak_lanjut}
            notes={violation.catatan}
            isEditModalOpen={isEditModalOpen}
            setIsEditModalOpen={setIsEditModalOpen}
            formData={formData}
            handleInputChange={handleInputChange}
            handleActionSubmit={handleActionSubmit}
          />
          <Button onClick={handleDownloadReport} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white min-w-full">
            <Download className="w-4 mr-2" /> Download Laporan (PDF)
          </Button>
          {violation.status !== "Selesai" && (
            <Button onClick={handleMarkAsComplete} className="bg-green-600 hover:bg-green-700 text-white min-h-full">
              <Check className="w-4 mr-2" /> Tandai Pelanggaran Selesai
            </Button>
          )}
          {selectedImage && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedImage(null)}
            >
              <img src={selectedImage} alt="Bukti Pelanggaran" className="max-w-full max-h-full object-contain" />
            </div>
          )}
      </div>
    </div>
  )
}