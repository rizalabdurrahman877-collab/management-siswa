import {
        DialogContent,
        DialogDescription,
        DialogHeader,
        DialogFooter,
        DialogTitle,
        DialogClose,
} from "../ui/dialog";
import { Button } from "../ui/button";

interface ConfirmDeleteDialogProps {
    onConfirm: () => void;
}

export default function ConfirmDeleteDialog({ onConfirm }: ConfirmDeleteDialogProps) {
    return (
        <DialogContent className="w-full max-w-[min(90vw, 300px)] bg-white">
            <DialogHeader>
                <DialogTitle>Konfirmasi Hapus</DialogTitle>
                <DialogDescription>
                    Apakah Anda yakin ingin menghapus data ini? Tindakan ini dapat dibatalkan.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-2">
                <DialogClose asChild>
                    <Button variant="outline" className="text-black bg-white hover:bg-green-500">Batal</Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button variant="outline" onClick={onConfirm} className="text-black bg-white hover:bg-red-600">Hapus</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}

