"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import SiswaTable from "@/components/siswa/SiswaTable";
import EditSiswaDialog from "@/components/siswa/EditSiswaDialog";
import type { Siswa, Kelas } from "@/types";
import { supabase } from "@/lib/supabase";

type SiswaFormData = Omit<Siswa, "id" | "kelas">;

const initialFormData: SiswaFormData = {
    full_name: "",        // ✅ berubah dari "nama"
    nis: "",
    class_id: 0,          // ✅ berubah dari "kelas_id"
    gender: "",           // ✅ berubah dari "jenis_kelamin"
    birth_date: "",       // ✅ berubah dari "tanggal_lahir"
    address: "",          // ✅ berubah dari "alamat"
};

export default function SiswaPage() {
    const [dataSiswa, setDataSiswa] = useState<Siswa[]>([]);
    const [dataKelas, setDataKelas] = useState<Kelas[]>([]);
    const [selectKelasId, setSelectKelasId] = useState<number | null>(null);

    const [addData, setAddData] = useState<SiswaFormData>(initialFormData);
    const [editData, setEditData] = useState<SiswaFormData>(initialFormData);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [addDialogOpen, setAddDialogOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
       const { data: kelasData, error: kelasError } = await supabase
       .from("kelas")
       .select("*")
       .order("id", {ascending: true });

       const { data: siswaData, error: siswaError } = await supabase
       .from("siswas")
       .select("*")
       .order("id", { ascending: true });

        if (kelasError) {
            console.error("Error fetching kelas:", kelasError);
        }
        if (siswaError) {
            console.error("Error fetching siswa:", siswaError);
        }

        console.log("📊 DATA KELAS:", kelasData);
        console.log("📊 DATA SISWA:", siswaData);

        setDataKelas(kelasData || []);
        setDataSiswa(siswaData || []);
    };

    // Handle change for Add form
    const handleAddChange = (key: string, value: string | number) => {
        setAddData((prev) => ({ ...prev,[key]: value }));
    };

    // Handle changes for Edit form
    const handleEditChange = (key: string, value: string | number) => {
        setEditData((prev) => ({ ...prev, [key]: value }));
    };

    const handleAdd = async () => {
        const { data: inserted, error: error } = await supabase
        .from("siswas")
        .insert([addData])
        .select("*")
        .single();

        if (error) {
            console.error("Error inserting siswas:", error);
            return;
        }

        setDataSiswa((prev) => [...prev, inserted]);
        setAddDialogOpen(false);
        setAddData(initialFormData);
    };

    const handleEdit = (siswa: Siswa) => {
        setEditData({
            full_name: siswa.full_name,      // ✅ berubah
            nis: siswa.nis,
            class_id: siswa.class_id,        // ✅ berubah
            gender: siswa.gender,            // ✅ berubah
            birth_date: siswa.birth_date,    // ✅ berubah
            address: siswa.address,          // ✅ berubah
        });
        setEditingId(siswa.id);
        setEditDialogOpen(true);
    };

const handleUpdate = async () => {
  if (!editingId) return;

        const { data: updated, error } = await supabase
            .from("siswas")
            .update(editData)
            .eq("id", editingId)
            .select("*")
            .single();
        if (error) {
            console.error("Error updating siswa:", error);
            return;
        }
            setDataSiswa((prev) =>
            prev.map((s) => (s.id === editingId ? updated : s))
        );

        setEditDialogOpen(false);
        setEditingId(null);
        setEditData(initialFormData);
     };


    const handleDelete = async (id: number) => {
        const  { error } = await supabase
        .from("siswas")
        .delete()
        .eq("id", id);
        
        setDataSiswa((prev) => prev.filter((s) => s.id !== id));
    };

    const handleAddDialogClose = (open: boolean) => {
        setAddDialogOpen(open);
        if (!open) {
            setAddData(initialFormData);
        }
    };
    
    const handleEditDialogClose = (open: boolean) => {
        setEditDialogOpen(open);
        if (!open) {
            setEditData(initialFormData);
            setEditingId(null);
        }
    };

  return (
    <div className="space-y-4">
        <h1 className="text-2xl font-bold">Siswa</h1>
        <Card className="p-4">
            <SiswaTable
                dataSiswa={dataSiswa}
                dataKelas={dataKelas}
                selectKelasId={selectKelasId}
                setSelectKelasId={setSelectKelasId}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                addDialogOpen={addDialogOpen}
                setAddDialogOpen={handleAddDialogClose}
                data={addData}
                handleChange={handleAddChange}
                handleAdd={handleAdd}
            />
        </Card>

        <EditSiswaDialog
            open={editDialogOpen}
            setOpen={handleEditDialogClose}
            data={editData}
            handleChange={handleEditChange}
            handleUpdate={handleUpdate}
            dataKelas={dataKelas}
        />
    </div>
  );
}