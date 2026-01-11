"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Search, Upload, X } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import type { Siswa } from "@/types";

const TINGKAT_OPTIONS = ["Ringan", "Sedang", "Berat"] as const;
const STATUS_OPTIONS = ["Aktif", "Selesai"] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface PelanggaranFormData {
  siswa_id: number;
  jenis_pelanggaran: string;
  tingkat: string;
  poin: number;
  tanggal: string;
  waktu: string;
  lokasi: string;
  deskripsi: string;
  status: string;
  tindakan: string | null;
  tanggal_tindak_lanjut: string | null;
  catatan: string | null;
  url: string | null;
}

interface FormFieldsPelanggaranProps {
  form: PelanggaranFormData;
  onChange: <K extends keyof PelanggaranFormData>(
    key: K,
    value: PelanggaranFormData[K]
  ) => void;
  dataSiswa?: Siswa[];
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  previewUrl?: string;
  onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile?: () => void;
  showSiswaField?: boolean;
  showOptionalFields?: boolean;
  showFileUpload?: boolean;
}

export function FormFieldsPelanggaran({
  form,
  onChange,
  dataSiswa = [],
  searchQuery = "",
  onSearchChange,
  previewUrl,
  onFileChange,
  onRemoveFile,
  showSiswaField = true,
  showOptionalFields = false,
  showFileUpload = true,
}: FormFieldsPelanggaranProps) {
  const filteredSiswa = useMemo(() => {
    if (!searchQuery.trim() || dataSiswa.length) return dataSiswa;
    const query = searchQuery.toLocaleLowerCase();
    return dataSiswa.filter(
      (siswa) =>
        siswa.full_name.toLocaleLowerCase().includes(query) ||
        siswa.nis.toLowerCase().includes(query)
    );
  }, [dataSiswa, searchQuery]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert("Ukuran file terlalu besar, Maksimal 5MB.");
      e.target.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar.");
      e.target.value = "";
      return;
    }

    onFileChange?.(e);
  };

  return (
    <div className="space-y-4 bg-white">
      {showSiswaField && (
        <div className="space-y-2">
          <Label htmlFor="siswa" className="text-sm font-medium">
            Siswa <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="siswa"
              placeholder="Ketik nama atau NIS siswa"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange?.(e.target.value);
                onChange("siswa_id", 0);
              }}
              className="pl-9 w-full"
            />
          </div>
          {searchQuery && !form.siswa_id && (
            <div className="max-h-48 overflow-y-auto border rounded-md bg-white shadow-lg">
              {filteredSiswa.length > 0 ? (
                filteredSiswa.map((siswa) => (
                  <button
                    key={siswa.id}
                    type="button"
                    onClick={() => {
                      onChange("siswa_id", siswa.id);
                      onSearchChange?.(`${siswa.full_name} - ${siswa.nis}`);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition border-b last:border-b-0 ${
                      form.siswa_id === siswa.id ? "bg-blue-100" : ""
                    }`}
                  >
                    <div className="font-medium text-sm">{siswa.full_name}</div>
                    <div className="text-xs text-gray-500">{siswa.nis}</div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500">
                  Tidak ada siswa ditemukan.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-xl">
        <div className="space-y-2 ">
          <Label htmlFor="jenis" className="text-sm font-medium">
            Jenis Pelanggaran <span className="text-red-500">*</span>
          </Label>
          <Input
            id="jenis"
            value={form.jenis_pelanggaran}
            onChange={(e) => onChange("jenis_pelanggaran", e.target.value)}
            placeholder="Contoh : Terlambat, Tidak berseragam"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tingkat" className="text-sm font-medium">
            Tingkat Pelanggaran <span className="text-red-500">*</span>
          </Label>
          <Select
            value={form.tingkat}
            onValueChange={(v) => onChange("tingkat", v)}
          >
            <SelectTrigger id="tingkat" className="w-full">
              <SelectValue placeholder="Pilih Tingkat" />
            </SelectTrigger>
            <SelectContent>
              {TINGKAT_OPTIONS.map((tingkat) => (
                <SelectItem key={tingkat} value={tingkat}>
                  {tingkat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="poin" className="text-sm font-medium">
            Poin Pelanggaran <span className="text-red-500">*</span>
          </Label>
          <Input
            id="jenis"
            type="number"
            min="0"
            value={form.poin}
            onChange={(e) => onChange("poin", parseInt(e.target.value) || 0)}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tanggal" className="text-sm font-medium">
            Tanggal Pelanggaran <span className="text-red-500">*</span>
          </Label>
          <Input
            id="tanggal"
            type="date"
            value={form.tanggal}
            onChange={(e) => onChange("tanggal", e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="waktu" className="text-sm font-medium">
            Waktu Pelanggaran <span className="text-red-500">*</span>
          </Label>
          <Input
            id="waktu"
            type="time"
            value={form.waktu}
            onChange={(e) => onChange("waktu", e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lokasi" className="text-sm font-medium">
            Lokasi Pelanggaran <span className="text-red-500">*</span>
          </Label>
          <Input
            id="lokasi"
            value={form.lokasi}
            onChange={(e) => onChange("lokasi", e.target.value)}
            placeholder="Contoh: Kelas 10A"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="deskripsi" className="text-sm font-medium">
            Deskripsi
          </Label>
          <Input
            id="deskripsi"
            value={form.deskripsi}
            onChange={(e) => onChange("deskripsi", e.target.value)}
            placeholder="Deskripsi detail pelanggaran"
            className="w-full"
          />
        </div>

        {showOptionalFields && (
          <>
            <div className="space-y-2">
              <Label htmlFor="tindakan" className="text-sm font-medium">
                Tindakan
              </Label>
              <Input
                id="tindakan"
                value={form.tindakan || ""}
                onChange={(e) => onChange("tindakan", e.target.value || null)}
                placeholder="Tindakan yang di ambil"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="tanggal_tindak_lanjut"
                className="text-sm font-medium"
              >
                Tanggal Tindak Lanjut
              </Label>
              <Input
                id="tanggal_tindak_lanjut"
                value={form.tanggal_tindak_lanjut || ""}
                onChange={(e) =>
                  onChange("tanggal_tindak_lanjut", e.target.value || null)
                }
                placeholder="Tindakan yang diambil"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="catatan" className="text-sm font-medium">
                Catatan
              </Label>
              <Input
                id="catatan"
                value={form.catatan || ""}
                onChange={(e) => onChange("catatan", e.target.value || null)}
                placeholder="catatan tambahan"
                className="w-full"
              />
            </div>
          </>
        )}

        {showFileUpload && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Foto Bukti{" "}
              <span className="text-gray-500 text-xs">(Opsional)</span>
            </Label>
            {previewUrl ? (
              <div className="relative w-full h-64 border-2 border-gray-200 rounded-lg overflow-hidden">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-contain"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={onRemoveFile}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <Input
                  type="file"
                  id="file-upload"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Klik untuk upload foto bukti
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF, WEBP (max 5MB)
                  </p>
                </label>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export { TINGKAT_OPTIONS, STATUS_OPTIONS, MAX_FILE_SIZE };
