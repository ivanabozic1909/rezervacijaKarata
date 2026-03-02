"use client";
import { useState } from "react";
// Importujemo forme koje ćemo sad napraviti
import LokacijaForm from "@/components/admin/LokacijaForm";
import KoncertForm from "@/components/admin/KoncertForm";
import PodesavanjaForm from "@/components/admin/PodesavanjaForm";
import KategorijaForm from "@/components/admin/KategorijaForm";
import RezervacijeTable from "@/components/admin/RezervacijeTable";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("koncerti");

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-black mb-10 text-gray-900">Upravljanje Sistemom</h1>

      <div className="flex space-x-4 mb-8 border-b pb-4">
        <button onClick={() => setActiveTab("koncerti")} className={`px-4 py-2 rounded-lg ${activeTab === "koncerti" ? "bg-black text-white" : "bg-gray-200"}`}>Koncerti</button>
        <button onClick={() => setActiveTab("lokacije")} className={`px-4 py-2 rounded-lg ${activeTab === "lokacije" ? "bg-black text-white" : "bg-gray-200"}`}>Lokacije</button>
        <button onClick={() => setActiveTab("kategorije")} className={`px-4 py-2 rounded-lg whitespace-nowrap ${activeTab === "kategorije" ? "bg-black text-white" : "bg-gray-200"}`}>Kategorije</button>
        <button onClick={() => setActiveTab("podesavanja")} className={`px-4 py-2 rounded-lg ${activeTab === "podesavanja" ? "bg-black text-white" : "bg-gray-200"}`}>Valute & Popust</button>
        <button onClick={() => setActiveTab("rezervacije")} className={`px-4 py-2 rounded-lg ${activeTab === "rezervacije" ? "bg-black text-white" : "bg-gray-200"}`}>Rezervacije</button>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border">
        {/* Ovde se prikazuje ono što klikneš */}
        {activeTab === "rezervacije" && <RezervacijeTable />}
        {activeTab === "koncerti" && <KoncertForm />}
        {activeTab === "lokacije" && <LokacijaForm />}
        {activeTab === "kategorije" && <KategorijaForm />}
        {activeTab === "podesavanja" && <PodesavanjaForm />}
      </div>
    </div>
  );
}