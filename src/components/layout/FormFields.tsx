"use client";

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../ui/select"
import { Kelas } from "@/types";

interface FromFieldsProps {
    data: any;
    onChange: (key: string, value: string | number) => void;
    kelas: Kelas[];
}

export default function FormFields({ data, onChange, kelas }: FromFieldsProps) {
   const formFields = [
    {
        id: "full_name",  // ✅ Ubah dari "nama" → "full_name"
        label: "Nama",
        type: "text",
        value: data.full_name,  // ✅ Ubah
        placeholder: "Masukan Nama Lengkap",
    },
    {
        id: "nis",
        label: "NIS",
        type: "text",
        value: data.nis,
        placeholder: "Masukan NIS",
    },
    {
        id: "birth_date",  // ✅ Ubah dari "tanggal_lahir" → "birth_date"
        label: "Tanggal lahir",
        type: "date",
        value: data.birth_date,  // ✅ Ubah
    },
    {
        id: "address",  // ✅ Ubah dari "alamat" → "address"
        label: "Alamat",
        type: "text",
        value: data.address,  // ✅ Ubah
        placeholder: "Masukan Alamat Lengkap"
    },
];

    return (
        <div className="space-y-4 py-4">
            {formFields.map((field) => (
                    <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.id} className="text-sm font-medium">
                            {field.label}
                        </Label>
                        <Input
                            id={field.id}
                            type={field.type}
                            value={field.value}
                            placeholder={field.placeholder}
                            onChange={(e) => onChange(field.id, e.target.value)}
                            className="w-full"
                        />
                    </div>
                ))}
                <div className="space-y-2">
                    <Label htmlFor="kelas" className="text-sm font-medium">
                        Kelas
                    </Label>
                    <Select
                    value={String(data.kelas_id || "")}
                    onValueChange={(val) =>onChange("class_id", Number(val))}
                    >
                        <SelectTrigger 
                        id="kelas" className="w-full" >
                            <SelectValue placeholder="Pilih Kelas" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            {kelas.map((k) => (
                                <SelectItem key={k.id} value={String(k.id)}>
                                    {k.kelas}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                 <div className="space-y-2">
                    <Label htmlFor="jenis_kelamin" className="text-sm font-medium">
                        Jenis Kelamin
                    </Label>
                    <Select
                    value={String(data.jenis_kelamin || "")}
                    onValueChange={(val) => onChange("gender", val) }
                    >
                        <SelectTrigger id="jenis_kelamin" className="w-full ">
                            <SelectValue placeholder="Pilih Jenis Kelamin" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="L">Laki-laki</SelectItem>
                          <SelectItem value="P">Perempuan</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
    )
}