"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Pelanggaran, Siswa } from "@/types";
import {
  FormFieldsPelanggaran,
  type PelanggaranFormData,
} from "@/components/pelanggaran/FormFieldsPelanggaran";

interface AddPelanggaranDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (
    violation: Omit<
      Pelanggaran,
      "id" | "created_at" | "updated_at" | "siswa" | "dilaporkan_oleh_user"
    >
  ) => Promise<void>;
  dataSiswa: Siswa[];
}

const getInitialForm = (): PelanggaranFormData => {
  const today = new Date().toISOString().split("T")[0];
  const now = new Date().toTimeString().split(" ")[0].slice(0, 5);
  return {
    siswa_id: 0,
    jenis_pelanggaran: "",
    tingkat: "",
    poin: 0,
    tanggal: today,
    waktu: now,
    lokasi: "",
    deskripsi: "",
    status: "Aktif",
    tindakan: null,
    tanggal_tindak_lanjut: null,
    catatan: null,
    url: null,
  };
};

export default function AddPelanggaranDialog({
  open,
  onOpenChange,
  onAdd,
  dataSiswa,
}: AddPelanggaranDialogProps) {
  const [form, setForm] = useState<PelanggaranFormData>(getInitialForm());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleChange = <K extends keyof PelanggaranFormData>(
    key: K,
    value: PelanggaranFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setForm((prev) => ({ ...prev, url: null }));
  };

  const resetForm = () => {
    setForm(getInitialForm());
    setSelectedFile(null);
    setPreviewUrl("");
    setSearchQuery("");
  };

  const handleSubmit = async () => {
    if (!form.siswa_id || form.siswa_id === 0) {
      alert("Silahkan pilih siswa");
      return;
    }
    if (!form.jenis_pelanggaran.trim()) {
      alert("Jenis pelanggaran harus diisi");
      return;
    }
    if (!form.tingkat) {
      alert("Tingkat pelanggaran harus dipilih");
      return;
    }

    try {
      setUploading(true);
      let UploadedUrl = form.url;
      
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          // Debugging: Tampilkan status dan response text
          const responseText = await response.text();
          console.log("Upload response status:", response.status);
          console.log("Upload response text:", responseText);

          if (!response.ok) {
            try {
              const errorData = JSON.parse(responseText);
              console.error("Upload error details:", errorData);
              throw new Error(errorData.message || `Upload gagal dengan status ${response.status}`);
            } catch {
              throw new Error(`Upload gagal dengan status ${response.status}: ${responseText}`);
            }
          }

          // Parse response sebagai JSON
          let result;
          try {
            result = JSON.parse(responseText);
          } catch {
            console.error("Response bukan JSON valid:", responseText);
            throw new Error("Response dari server tidak valid");
          }

          if (result.success && result.url) {
            UploadedUrl = result.url;
          } else if (!result.success) {
            throw new Error(result.message || "Upload tidak berhasil");
          }
        } catch (uploadError) {
          console.error("Error uploading file:", uploadError);
          throw uploadError;
        }
      }

      // Clean data
      const cleanedData = {
        siswa_id: form.siswa_id,
        dilaporkan_oleh_id: 1,
        jenis_pelanggaran: form.jenis_pelanggaran.trim(),
        tingkat: form.tingkat,
        poin: String(form.poin),
        tanggal: form.tanggal,
        waktu: form.waktu,
        lokasi: form.lokasi,
        deskripsi: form.deskripsi,
        status: form.status,
        tindakan: form.tindakan?.trim() || "",
        tanggal_tindak_lanjut: form.tanggal_tindak_lanjut?.trim() || "",
        catatan: form.catatan?.trim() || "",
        url: UploadedUrl || "",
        dilaporkan_oleh: {
          id: 1,
          name: "User",
          email: "",
          password: "",
          created_at: "",
          updated_at: "",
        },
      };

      await onAdd(cleanedData);
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error submiting form:", error);
      const errorMessage = error instanceof Error ? error.message : "Gagal menyimpan data. Silahkan coba lagi";
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          + Tambah Pelanggaran
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Tambah Pelanggaran
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <FormFieldsPelanggaran
            form={form}
            onChange={handleChange}
            dataSiswa={dataSiswa}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            previewUrl={previewUrl}
            onFileChange={handleFileChange}
            onRemoveFile={removeFile}
            showSiswaField={true}
            showOptionalFields={false}
            showFileUpload={true}
          />
        </div>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline" onClick={resetForm} disabled={uploading}>
              Batal
            </Button>
          </DialogClose>

          <Button
            onClick={handleSubmit}
            disabled={uploading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}