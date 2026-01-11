"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Save } from "lucide-react";

type Props = {
    actionTaken: string | null | undefined;
    followUpDate: string | null | undefined;
    notes: string | null | undefined;
    isEditModalOpen: boolean;
    setIsEditModalOpen: (b: boolean) => void;
    formData: { action: string; note: string; followUp: string };
    handleInputChange: (field: string, value: string) => void;
    handleActionSubmit: () => void;
};

export default function TindakanDiambil(props: Props) {
    return (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="text-lg text-blue-600">Tindakan yang diambil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Info label="Sanksi/Tindakan" value={props.actionTaken} />
                <Info label="Tanggal Tindak Lanjut" value={props.followUpDate} />
                <Info label="Catatan" value={props.notes} />

                <div className="pt-4 border-t bg-white">
                    <Dialog open={props.isEditModalOpen} onOpenChange={props.setIsEditModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                                <Edit className="w-4 h-4 mr-2" /> Update Tindakan
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto bg-white">
                            <DialogHeader>
                                <DialogTitle>Update Tindakan</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="action">Tindakan Baru</Label>
                                    <Textarea id="action" value={props.formData.action} onChange={(e) => props.handleInputChange("action", e.target.value)} placeholder="Masukan tindakan yang diambil" className="mih-h-[80px]" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="note">Catatan Tambahan</Label>
                                    <Textarea id="note" value={props.formData.note} onChange={(e) => props.handleInputChange("note", e.target.value)} placeholder="Masukan Catatan tambahan" className="min-h-screen" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="followUp">Tanggal Tindak Lanjut</Label>
                                    <Input id="followUp" type="date" value={props.formData.followUp} onChange={(e) => props.handleInputChange("followUp", e.target.value)} className="h-11" />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <Button onClick={props.handleActionSubmit} className="bg-blue-600 hover:bg-blue-700 text-white h-11 flex-1">
                                        <Save className="w-4 h-4 mr-2" /> Simpan
                                    </Button>
                                    <Button onClick={() => props.setIsEditModalOpen(false)} className="bg-blue-600 hover:bg-blue-700 text-white h-11 flex-1">Batal</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardContent>
        </Card>
    )
}

function Info({ label, value }: { label: string; value: string | null | undefined}) {
    return (
        <div>
            <p className="text-sm text-gray-600 mb-2">{label}</p>
            <p className="font-medium text-gray-800">{value}</p>
        </div>
    )
}