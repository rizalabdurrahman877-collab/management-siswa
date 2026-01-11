"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import KelasTable from "@/components/kelas/KelasTable";
import AddKelasDialog from "@/components/kelas/AddKelasDialog";
import EditKelasDialog from "@/components/kelas/EditKelasDialog";
import { Kelas } from "@/types";
import { supabase } from "@/lib/supabase";

type KelasFormData = {
    kelas: string;
};

const initialFormData: KelasFormData = {
    kelas: "",
};

export default function KelasPage() {
    const [kelas, setKelas] = useState<Kelas[]>([]);
    const [addForm, setAddForm] = useState<KelasFormData>(initialFormData);
    const [editForm, setEditForm] = useState<KelasFormData>(initialFormData);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchKelas();
    }, []);

    const fetchKelas = async () => {
        try {
            setLoading(true);

            const { data, error} = await supabase
                .from ("kelas")
                .select("*")
                .order("id", { ascending: true });
            setKelas(data || []);
        } catch (error) {
            console.error("Failed to fetch kelas:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleAddChange = (key: string, value: string) => {
        setAddForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleEditChange = (key: string, value: string) => {
        setEditForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleAdd = async () => {
        try {
            if (!addForm.kelas.trim()) {
                alert("Nama kelas tidak boleh kosong");
                return;
            }

          const { data, error } = await supabase
          .from("kelas")
          .insert([{ kelas: addForm.kelas }])
          .select("*")
          .single();

            setKelas((prev) => [...prev, data]);

            setAddDialogOpen(false);
            setAddForm(initialFormData);
            } catch (err) {
                console.error("Unexpected error:", err);
                alert("Terjadi kesalahan yang tidak teduga");
            }
        };

        const handleEditClick = (item: Kelas) => {
            setEditingId(item.id);
            setEditForm({ kelas: item.kelas });
            setEditDialogOpen(true);
        };

        const handleUpdate = async () => {
            try {
                if (editingId === null) return;

                if (!editForm.kelas.trim()) {
                    alert("Nama kelas tidak boleh kosong");
                    return;
                }

                const { data, error } = await supabase
                .from("kelas")
                .update({ kelas: editForm.kelas})
                .eq("id", editingId)
                .select("*")
                .single();

                setKelas((prev) => prev.map((k) =>
                    k.id === editingId
                    ? data
                    : k
                ));

                setEditDialogOpen(false);
                setEditingId(null);
                setEditForm(initialFormData);
            } catch (err) {
                console.error("Unexpected error:", err);
                alert("Terjadi kesalahan yang tidak terduga");
            }
        };

        const handleDelete = async (id: number) => {
            try {
                const { error } = await supabase
                .from("kelas")
                .delete()
                .eq("id", id);
                setKelas((prev) => prev.filter((k) => k.id !== id));
            } catch (err) {
                console.error("Unexpected error:", err);
                alert("Terjadi kesalahan yang tidak terduga");
            }
        };

        const handleAddDialogClose = (open: boolean) => {
            setAddDialogOpen(open);
            if (!open) {
                setAddForm(initialFormData);
            }
        };

         const handleEditDialogClose = (open: boolean) => {
            setEditDialogOpen(open);
            if (!open) {
                setEditForm(initialFormData);
                setEditingId(null);
            }
        };

        if (loading) {
            return
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        }

        return (
            <div className="space-y-4">
                <h1 className="text-2xl font-bold">Data Kelas</h1>

                <Card className="p-4 shadow text-center">
                    <KelasTable
                        data={kelas}
                        handleEditClick={handleEditClick}
                        handleDelete={handleDelete}
                        addDialog={
                        <AddKelasDialog
                            open={addDialogOpen}
                            setOpen={handleAddDialogClose}
                            form={addForm}
                            handleChange={handleAddChange}
                            handleAdd={handleAdd}
                    />
                    }
                />
                    <EditKelasDialog
                        open={editDialogOpen}
                        setOpen={handleEditDialogClose}
                        form={editForm}
                        handleChange={handleEditChange}
                        handleUpdate={handleUpdate}
                    />
                </Card>
            </div>
        )
    }
    


