"use client";

import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Calendar } from "lucide-react";

const COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#06b6d4"];

export default function BirthYearDistribution({ data }: { data: any[]}) {
    // ✅ Map data dari API format ke format yang component expect
    const mappedData = data.map(item => ({
        year: item.tahun || item.year,
        count: item.total || item.count
    }));
    
    const sortedData = [...mappedData].sort((a, b) => b.count - a.count);
    const total = sortedData.reduce((sum, item) => sum + item.count, 0);

    return (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-500"/>
                        Distribusi Tahun Kelahiran Siswa
                    </CardTitle>
                    <Badge variant="outline" className="hidden sm:inline-flex">
                        {sortedData.length} Tahun Kelahiran
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-6">
                    <div className="flex justify-center">
                        <ResponsiveContainer width="100%" height={320}>
                            <BarChart data={sortedData} margin={{top: 20, right: 30, left: 20, bottom:5}}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                                <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip 
                                    contentStyle={{
                                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                                        border: "none",
                                        borderRadius: "12px",
                                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
                                    }}
                                    formatter={(value: number, name: string, props: any) => [
                                        `${value} siswa`, `Tahun ${props.payload.year}`
                                    ]}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-medium text-sm text-muted-foreground mb-3">Detail Distribusi</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-x-4 gap-y-2 max-h-64 overflow-auto">
                            {sortedData.map((item, index) => {
                                const percentage = ((item.count / total) * 100).toFixed(1);
                                return (
                                    <div key={item.year} className="flex items-center gap-4 p-2 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                                <span className="font-medium text-sm">{item.year}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm text-muted-foreground">{item.count}</span>
                                                <Badge variant="secondary" className="text-sm">{percentage}%</Badge>
                                            </div>
                                        </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}