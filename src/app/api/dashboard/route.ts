import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Validasi environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
    try {
        // Data fetching Siswa, Kelas, Pelanggaran
        const [siswasResult, kelasResult, pelanggaranResult] = await Promise.all([
            supabase.from('siswas').select('*'),
            supabase.from('kelas').select('*'),
            supabase.from('pelanggarans').select('*, siswa:siswas(*, kelas(*))'),
        ]);

        // Error handling
        if (siswasResult.error) {
            console.error('Error fetching siswas:', siswasResult.error);
            return NextResponse.json(
                { 
                    success: false,
                    error: 'Gagal mengambil data siswa', 
                    details: siswasResult.error.message,
                },
                { status: 500 }
            );
        }
        
        if (kelasResult.error) {
            console.error('Error fetching kelas:', kelasResult.error);
            return NextResponse.json(
                { 
                    success: false,
                    error: 'Gagal mengambil data kelas', 
                    details: kelasResult.error.message,
                },
                { status: 500 }
            );
        }
        
        if (pelanggaranResult.error) {
            console.error('Error fetching pelanggarans:', pelanggaranResult.error);
            return NextResponse.json(
                { 
                    success: false,
                    error: 'Gagal mengambil data pelanggaran', 
                    details: pelanggaranResult.error.message,
                },
                { status: 500 }
            );
        }

        const siswas = siswasResult.data || [];
        const kelas = kelasResult.data || [];
        const pelanggaran = pelanggaranResult.data || [];

        console.log('=== DATA FETCHED ===');
        console.log('Total siswa:', siswas.length);
        console.log('Total kelas:', kelas.length);
        console.log('Total pelanggaran:', pelanggaran.length);
        
        // DEBUG: Sample data
        if (siswas.length > 0) {
            console.log('\n=== SAMPLE SISWA (First 3) ===');
            siswas.slice(0, 3).forEach((s, i) => {
                console.log(`${i+1}. NIS: ${s.nis}`);
                console.log(`   Nama: ${s.full_name || s.nama}`);
                console.log(`   Gender: "${s.gender}" (type: ${typeof s.gender})`);
                console.log(`   kelas_id: ${s.kelas_id}`);
            });
        }

        const totalSiswa = siswas.length;
        const totalKelas = kelas.length;

        // Pie Data - Gender distribution - SIMPLIFIED
        const lakiLakiCount = siswas.filter(s => {
            const g = s.gender || s.jenis_kelamin || s.jk;
            return g === 'L' || g === 'l';
        }).length;
        
        const perempuanCount = siswas.filter(s => {
            const g = s.gender || s.jenis_kelamin || s.jk;
            return g === 'P' || g === 'p';
        }).length;
        
        const pie_data = [
            { name: 'Laki-laki', value: lakiLakiCount },
            { name: 'Perempuan', value: perempuanCount },
        ];
        
        console.log(`Pie data: Laki-laki=${lakiLakiCount}, Perempuan=${perempuanCount}`);

        // Bar Data - Students per class by gender
        // Buat Map kelas untuk lookup cepat
        const kelasMap = new Map();
        kelas.forEach(k => {
            const namaKelas = k.kelas || k.nama_kelas || k.kode_kelas || `Kelas ${k.id}`;
            kelasMap.set(k.id, namaKelas);
        });

        console.log('\n=== KELAS MAP ===');
        console.log('Available kelas:', Array.from(kelasMap.entries()));

        // Group siswa by kelas
        const kelasGrouped = {} as Record<string, { 'L': number; 'P': number }>;
        
        console.log('\n=== MAPPING SISWA TO KELAS ===');
        siswas.forEach((siswa, index) => {
            // Ambil nama kelas - TAMBAH FALLBACK LANGSUNG DARI SISWA
            let namaKelas = 'Tidak Diketahui';
            
            // Prioritas 1: Pakai field langsung di siswa
            if (siswa.nama_kelas || siswa.kelas) {
                namaKelas = siswa.nama_kelas || siswa.kelas;
            }
            // Prioritas 2: Lookup via kelas_id
            else if (siswa.kelas_id && kelasMap.has(siswa.kelas_id)) {
                namaKelas = kelasMap.get(siswa.kelas_id);
            }
            
            // Log setiap 10 siswa untuk tidak spam console
            if (index < 10 || index % 10 === 0) {
                console.log(`${index+1}. ${siswa.nama || siswa.id} -> kelas_id: ${siswa.kelas_id} -> nama_kelas field: ${siswa.nama_kelas || siswa.kelas} -> Final: ${namaKelas}`);
            }
            
            // Initialize jika belum ada
            if (!kelasGrouped[namaKelas]) {
                kelasGrouped[namaKelas] = { 'L': 0, 'P': 0 };
            }
            
            // Count by gender - SIMPLIFIED VERSION
            const gender = siswa.gender || siswa.jenis_kelamin || siswa.jk || '';
            
            if (gender === 'L' || gender === 'l') {
                kelasGrouped[namaKelas]['L']++;
            } else if (gender === 'P' || gender === 'p') {
                kelasGrouped[namaKelas]['P']++;
            } else if (index < 5) {
                // Log gender yang tidak dikenali untuk debugging
                console.warn(`Unknown gender for ${siswa.nama || siswa.full_name}: "${gender}" (type: ${typeof gender})`);
            }
        });

        console.log('\n=== KELAS GROUPED (After Reduce) ===');
        console.log(JSON.stringify(kelasGrouped, null, 2));

        // Convert to array (SEMENTARA JANGAN FILTER untuk debugging)
        const bar_data = Object.entries(kelasGrouped)
            // .filter(([nama_kelas]) => nama_kelas !== 'Tidak Diketahui')  // DISABLED
            .map(([nama_kelas, counts]) => {
                const countData = counts as { 'L': number; 'P': number };
                return {
                    nama_kelas,
                    'Laki-Laki': countData['L'],
                    'Perempuan': countData['P'],
                };
            })
            .sort((a, b) => {
                return a.nama_kelas.localeCompare(b.nama_kelas, 'id', { numeric: true });
            });

        console.log('\n=== BAR DATA (FINAL) ===');
        console.log(JSON.stringify(bar_data, null, 2));
        console.log(`Total kelas in bar_data: ${bar_data.length}`);

        // Birth year data
        const birthYearGrouped = siswas.reduce((acc, siswa) => {
    if (siswa.birth_date) {  // ✅ Nama kolom yang benar
        try {
            const year = new Date(siswa.birth_date).getFullYear().toString();  // ✅
            if (!isNaN(parseInt(year))) {
                acc[year] = (acc[year] || 0) + 1;
            }
        } catch (e) {
            console.warn('Invalid date format:', siswa.birth_date);  // ✅
        }
    }
    return acc;
}, {} as Record<string, number>);

       const bar_data_birthyear = Object.entries(birthYearGrouped)
    .map(([year, count]) => ({ year, count: count as number }))  // ✅ Ubah 'tahun' → 'year', 'total' → 'count'
    .sort((a, b) => parseInt(a.year) - parseInt(b.year));  // ✅ Ubah a.tahun → a.year

        // Total Pelanggaran & Violation Stats
        const totalPelanggaran = pelanggaran.length;

        // Monthly Violations (last 6 months)
        const now = new Date();
        const months = Array.from({ length: 6 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        }).reverse();

        const pelanggaranTren = months.map(month => {
            const filtered = pelanggaran.filter(p => {
                if (!p.tanggal) return false;
                try {
                    const pMonth = p.tanggal.substring(0, 7);
                    return pMonth === month;
                } catch (e) {
                    return false;
                }
            });

            return {
                bulan: month,
                Aktif: filtered.filter(p => p.status === 'Aktif').length,
                Selesai: filtered.filter(p => p.status === 'Selesai').length,
            };
        });

        // Pelanggaran Types
        const jenisGrouped = pelanggaran.reduce((acc, p) => {
            if (p.jenis_pelanggaran) {
                acc[p.jenis_pelanggaran] = (acc[p.jenis_pelanggaran] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const pelanggaranPerJenis = Object.entries(jenisGrouped).map(([jenis_pelanggaran, total]) => ({
            jenis_pelanggaran,
            total: total as number,
        }));

        // Severity Distribution
        const tingkatGrouped = pelanggaran.reduce((acc, p) => {
            if (p.tingkat) {
                acc[p.tingkat] = (acc[p.tingkat] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const pelanggaranPerTingkat = Object.entries(tingkatGrouped).map(([tingkat, total]) => ({
            tingkat,
            total: total as number,
        }));

        // Top violators by class
        const kelasGroupedPelanggaran = pelanggaran.reduce((acc, p) => {
            const namaKelas = p.siswa?.kelas?.kelas || 'Tidak Diketahui';
            acc[namaKelas] = (acc[namaKelas] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const pelanggaranPerKelas = Object.entries(kelasGroupedPelanggaran)
            .map(([kelas, total]) => ({ kelas, total: total as number }))
            .sort((a, b) => b.total - a.total);

        // Response Json
        return NextResponse.json({
            success: true,
            totalSiswa,
            totalKelas,
            totalPelanggaran,
            pie_data,
            bar_data,
            bar_data_birthyear,
            pelanggaranTren,
            pelanggaranPerJenis,
            pelanggaranPerTingkat,
            pelanggaranPerKelas,
        });
        
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { 
                success: false,
                error: 'Terjadi kesalahan server', 
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

export async function OPTIONS() {
    return NextResponse.json({}, { status: 200 });
}