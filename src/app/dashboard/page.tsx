'use client';

import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, TrendingUp, AlertTriangle } from 'lucide-react';

import StatCard from '@/components/dashboard/StatCard';
import SiswaChart from '@/components/dashboard/SiswaChart';
import GenderRasioChart from '@/components/dashboard/GenderRatioChart';
import TrenPelanggaran from '@/components/dashboard/TrenPelanggaran';
import TipePelanggaran from '@/components/dashboard/TipePelanggaran';
import SeverityDistributionList from '@/components/dashboard/TingkatPelanggaran';
import TopViolatorsList from '@/components/dashboard/TopPelanggaran';
import BirthYearDistribution from '@/components/dashboard/BirthYearDistribution';

import { DataTahunLahir, DataBar, DataPie, ViolationStats } from '@/types';

export default function DashboardPage() {
  const [totalSiswa, setTotalSiswa] = useState(0);
  const [totalKelas, setTotalKelas] = useState(0);
  const [barData, setBarData] = useState<DataBar[]>([]);
  const [pieData, setPieData] = useState<DataPie[]>([]);
  const [violationStats, setViolationStats] = useState<ViolationStats>({
    totalViolations: 0,
    monthlyViolations: [],
    violationTypes: [],
    severityDistribution: [],
    topViolators: []
  });
  const [birthYearDistribution, setBirthYearDistribution] = useState<DataTahunLahir[]>([]);

  useEffect(() => {
  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      console.log('📊 RESPONSE FROM API:', data);
      console.log('📊 bar_data received:', data.bar_data);

      if (data.error) throw new Error(data.error);

      setTotalSiswa(data.totalSiswa || 0);
      setTotalKelas(data.totalKelas || 0);

      // INI KUNCINYA
      setBarData(data.bar_data || []);
      setPieData(data.pie_data || []);
      setBirthYearDistribution(data.bar_data_birthyear || []);

      setViolationStats({
        totalViolations: data.totalPelanggaran || 0,
        monthlyViolations: (data.pelanggaranTren || []).map((item: any) => ({
          month: item.bulan,
          violations: item.Aktif,
          resolved: item.Selesai,
        })),
        violationTypes: (data.pelanggaranPerJenis || []).map((item: any) => ({
          type: item.jenis_pelanggaran,
          count: item.total,
          percentage: 0,
        })),
        severityDistribution: (data.pelanggaranPerTingkat || []).map((item: any) => ({
          severity: item.tingkat,
          count: item.total,
          color:
            item.tingkat === "Ringan"
              ? "#22c55e"
              : item.tingkat === "Sedang"
              ? "#3b82f6"
              : "#ef4444",
        })),
        topViolators: (data.pelanggaranPerKelas || []).map((item: any) => ({
          name: item.kelas,
          violations: item.total,
        })),
      });        

    } catch (error) {
      console.error('Gagal fetch dashboard:', error);
    }
  };

  fetchDashboard();
}, []);


  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">

        <h1 data-aos="zoom-in" className="text-2xl font-bold bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Dashboard Siswa
        </h1>

        {/* Statistik Card */}
        <div data-aos="zoom-in" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Siswa" value={totalSiswa} icon={Users} color="shadow-md shadow-blue-500 bg-blue-500" subtitle="Total Siswa Aktif" badge="Aktif" />
          <StatCard title="Kelas" value={totalKelas} icon={GraduationCap} color="shadow-md shadow-green-500 bg-green-500" subtitle="Total Kelas" badge="Aktif" />
          <StatCard title="Rata-Rata per Kelas" value={totalKelas ? Math.round(totalSiswa / totalKelas) : 0} icon={TrendingUp} color="shadow-md shadow-orange-500 bg-orange-500" subtitle="Siswa per Kelas" badge="Aktif" />
          <StatCard title="Pelanggaran" value={violationStats.totalViolations} icon={AlertTriangle} color="shadow-md shadow-red-500 bg-red-500" subtitle="Total Pelanggaran" badge="Aktif" />
        </div>

        {/* Charts */}
        <div className="space-y-10">
          <div data-aos="fade-up"> <SiswaChart data={barData} /></div>
          <div data-aos="fade-up"><GenderRasioChart data={pieData} /></div>
          <div data-aos="fade-up"><TrenPelanggaran data={violationStats.monthlyViolations} /></div>
          <div data-aos="fade-up"> <TipePelanggaran data={violationStats.violationTypes} total={violationStats.totalViolations} /></div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-5 '>
          <div data-aos="fade-right"><SeverityDistributionList data={violationStats.severityDistribution} /></div>
          <div data-aos="fade-left"><TopViolatorsList data={violationStats.topViolators} /></div>
        </div>

        <div>
          <BirthYearDistribution data={birthYearDistribution} />
        </div>
      </div>
    </div>
  );
}