"use client";

import {
        DialogContent,
        DialogDescription,
        DialogHeader,
        DialogFooter,
        DialogTitle,
        Dialog,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label"; 

export default function EditKelasDialog({
    open,
    setOpen,
    form,
    handleChange,
    handleUpdate,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    form: {kelas: string},
    handleChange: (key: string, value: string) => void;
    handleUpdate: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
                  <DialogContent
                        className="
                            max-w-[min(90vh,300px)]
                            overflow-y-auto 
                            max-h-[calc(100vh-10rem)]
                            w-full
                            bg-white"
                            >
            <DialogHeader>
                <DialogTitle>Edit Kelas</DialogTitle>
                <DialogDescription>
                   Silahkan masukan data kelas yang ingin diedit.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py-2">
                <Label htmlFor="kelas">Nama Kelas</Label>
                <Input 
                id="kelas"
                value={form.kelas}
                onChange={(e) => handleChange("kelas", e.target.value)}
                placeholder="Masukan Nama Kelas"
                />
            </div>
            <DialogFooter className="flex justify-end gap-2">
            <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="
                cursor-pointer
                text-white
                font-medium
                bg-red-500/60
                border border-black/30
                backdrop-blur-md
                px-4 py-2
                rounded-xl
                shadow-lg shadow-black/20
                transition-all duration-300
                hover:bg-red-500
                hover:shadow-xl hover:shadow-red-500/30
                hover:scale-105
                active:scale-95
                "
            >
                Batal
            </Button>

            <Button
                variant="outline"
                onClick={handleUpdate}
                className="
                cursor-pointer
                text-white
                font-medium
                bg-green-500/60
                border border-black/30
                backdrop-blur-md
                px-4 py-2
                rounded-xl
                shadow-lg shadow-black/20
                transition-all duration-300
                hover:bg-green-500
                hover:shadow-xl hover:shadow-green-500/30
                hover:scale-105
                active:scale-95
                "
            >
                Simpan
            </Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
  
    )
}

