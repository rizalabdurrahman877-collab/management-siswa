// Register
export interface RegisterData {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: string;
  updated_at: string;
}

export interface RegisterResponse {
  status: boolean;
  message: string;
  data: RegisterData;
}

// Login
export interface LoginData {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  password: string;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  status: boolean;
  message: string;
  data: LoginData;
  token: string;
}

// Dashboard
export interface DataPie {
  name: string;
  value: number;
  percent?: number;
}

export interface DataBar {
  nama_kelas: string;
  "Laki-Laki": number;
  Perempuan: number;
}

export interface DataTahunLahir {
  year: number;
  count: number;
}

export interface DataTrenPelanggaran {
  bulan: string;
  Aktif: number;
  Selesai: number;
}

export interface DataJenisPelanggaran {
  jenis_pelanggaran: string;
  total: number;
}

export interface DataTingkatPelanggaran {
  tingkat: string;
  total: number;
}

export interface DataTopPelanggar {
  kelas: string;
  total: number;
}


export interface ViolationStats {
  totalViolations: number;
  monthlyViolations: any[];
  violationTypes: any[];
  severityDistribution: any[];
  topViolators: any[];
}

export interface DataDashboard {
  totalSiswa: number;
  totalKelas: number;
  pie_data: DataPie[];
  bar_data: DataBar[];
  bar_data_birthyear: DataTahunLahir[];
  totalPelanggaran: number;
  pelanggaranTren: DataTrenPelanggaran[];
  pelanggaranPerJenis: DataJenisPelanggaran[];
  pelanggaranPerTingkat: DataTingkatPelanggaran[];
  pelanggaranPerKelas: DataTopPelanggar[];
}


// Kelas
export interface Kelas {
  id: number;
  kelas: string;
  [key: string]: any;
}

export interface KelasResponse {
  status: boolean;
  message: string;
  data: Kelas;
}

// Siswa
export interface Siswa {
  id: number;
  nis: string;
  full_name: string;        // ✅ berubah dari "nama"
  class_id: number;         // ✅ berubah dari "kelas_id"
  gender: string;           // ✅ berubah dari "jenis_kelamin"
  birth_date: string;       // ✅ berubah dari "tanggal_lahir"
  address: string;          // ✅ berubah dari "alamat"
  kelas?: Kelas;
}

export interface SiswaResponse {
  status: boolean;
  message: string;
  data: Siswa;
}


// Pelanggaran
export interface Pelanggaran {
  id: number;
  siswa_id: number;
  dilaporkan_oleh_id: number;
  jenis_pelanggaran: string;
  tingkat: string;
  poin: string;
  tanggal: string;
  waktu: string;
  lokasi: string;
  deskripsi: string;
  status: string;
  tindakan: string;
  tanggal_tindak_lanjut: string;
  catatan: string;
  created_at: string;
  updated_at: string;
  siswa: Siswa;
  dilaporkan_oleh: LoginData;
   url?: string;   
}

//Bukti Pelanggaran
export interface EvidenceItem {
  id: number;
  pelanggaran_id: number;
  tipe: string;
  url: string;
  deskripsi: string;
  nama: string;
  diunggah_oleh: string;
  waktu_unggah: string;
  pelanggaran: Pelanggaran;
}

export interface PelanggaranResponse {
  status: boolean;
  message: string;
  data: Pelanggaran;
}

// Generic
export interface GenericResponse<T> {
  status: boolean;
  message: string;
  data: T;
}