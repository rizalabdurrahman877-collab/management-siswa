"use client";

import {
        DialogContent,
        DialogDescription,
        DialogHeader,
        DialogFooter,
        DialogTitle,
        DialogClose,
        Dialog,
} from "../ui/dialog";
import { Button } from "../ui/button";
import FormFields from "../layout/FormFields";

export default function EditSiswaDialog({
    open,
    setOpen,
    data,
    handleChange,
    handleUpdate,
    dataKelas,
}: any) {
    return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90hv] overflow-y-auto bg-white">
            <DialogHeader>
                <DialogTitle>Edit Siswa</DialogTitle>
                <DialogDescription>
                   Silahkan masukan data yang ingin diedit.
                </DialogDescription>
            </DialogHeader>
            <FormFields data={data} onChange={handleChange} kelas={dataKelas} />
            <DialogFooter className="flex justify-end gap-2">
                <Button variant="outline" className="cursor-pointer bg-red-500 hover:bg-red-500 text-white" onClick={() => setOpen(false)}>Batal</Button>
                <Button variant="outline" className="bg-yellow-500 hover:bg-yellow-500 text-white cursor-pointer" onClick={handleUpdate}>Simpan</Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
  
    )
}

