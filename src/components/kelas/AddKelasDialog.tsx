"use client";

import {
        DialogContent,
        DialogDescription,
        DialogHeader,
        DialogFooter,
        DialogTitle,
        DialogTrigger,
        Dialog,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label"; 

export default function AddKelasDialog({
    open,
    setOpen,
    form,
    handleChange,
    handleAdd,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    form: {kelas: string},
    handleChange: (key: string, value: string) => void;
    handleAdd: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-500 text-black hover:bg-blue-500" variant="outline" >Tambah Kelas</Button>
            </DialogTrigger>
                  <DialogContent
                        className="
                            max-h-[90vh] 
                            overflow-y-auto 
                            rounded-2xl 
                            shadow-2xl 
                            text-white 
                            border 
                            border-white/20
                            bg-linear-to-br from-blue-600 via-purple-600 to-pink-600
                            backdrop-blur-xl
                            w-full"
                            >
            <DialogHeader>
                <DialogTitle>Tambah Kelas</DialogTitle>
                <DialogDescription>
                   Silahkan masukan data kelas baru.
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
            <DialogFooter className="flex justify-end gap-3">
            <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="
                cursor-pointer
                text-white
                font-medium
                bg-white/20
                border border-white/30
                backdrop-blur-md
                px-4 py-2
                rounded-xl
                shadow-lg shadow-black/20
                transition-all duration-300
                hover:bg-red-500/60
                hover:shadow-xl hover:shadow-red-500/30
                hover:scale-105
                active:scale-95
                "
            >
                Batal
            </Button>

            <Button
                variant="outline"
                onClick={handleAdd}
                className="
                cursor-pointer
                text-white
                font-medium
                bg-white/20
                border border-white/30
                backdrop-blur-md
                px-4 py-2
                rounded-xl
                shadow-lg shadow-black/20
                transition-all duration-300
                hover:bg-green-500/60
                hover:shadow-xl hover:shadow-green-500/30
                hover:scale-105
                active:scale-95
                "
            >
                Tambah
            </Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
  
    )
}

