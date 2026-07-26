import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Download, Eye, FileText, Phone, Mail, User, CheckCircle, Clock, AlertCircle, Send, Calculator } from "lucide-react";

interface QuoteItem {
  designation: string;
  quantite: number;
  prixUnitaire: number;
  total: number;
}

export function SupplyListsPanel() {
  const [selectedList, setSelectedList] = useState<any>(null);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([
    { designation: "", quantite: 1, prixUnitaire: 0, total: 0 }
  ]);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const { data: supplyLists, isLoading, refetch } = trpc.supplyLists.getAll.useQuery();
  const updateStatusMutation = trpc.admin.updateSupplyListStatus.useMutation({ onSuccess: () => refetch() });

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    uploaded: { label: "Nouvelle", color: "bg-blue-100 text-blue-700", icon: Clock },
    processing: { label: "En cours", color: "bg-yellow-100 text-yellow-700", icon: AlertCircle },
    processed: { label: "Traité", color: "bg-green-100 text-green-700", icon: CheckCircle },
    quoted: { label: "Devis envoyé", color: "bg-purple-100 text-purple-700", icon: Send },
    error: { label: "Erreur", color: "bg-red-100 text-red-700", icon: AlertCircle },
  };

  const fileTypeIcon: Record<string, string> = {
    pdf: "📄", image: "🖼️", word: "📝", document: "📋", text: "📝",
  };

  const totalDevis = quoteItems.reduce((sum, item) => sum + (item.quantite * item.prixUnitaire), 0);

  const updateItem = (index: number, field: keyof QuoteItem, value: string | number) => {
    setQuoteItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      updated[index].total = updated[index].quantite * updated[index].prixUnitaire;
      return updated;
    });
  };

  const addItem = () => setQuoteItems(prev => [...prev, { designation: "", quantite: 1, prixUnitaire: 0, total: 0 }]);
  const removeItem = (i: number) => setQuoteItems(prev => prev.filter((_, idx) => idx !== i));

  const exportCSV = (list: any) => {
    const rows = [
      ["CAVALLY LIVRES - DEVIS CLIENT"],
      [""],
      ["Client:", list.customerName || "N/A"],
      ["Telephone:", list.customerPhone || "N/A"],
      ["Email:", list.customerEmail || "N/A"],
      ["Date:", new Date().toLocaleDateString("fr-FR")],
      [""],
      ["N", "Designation", "Quantite", "Prix Unitaire FCFA", "Total FCFA"],
      ...quoteItems.map((item, i) => [i+1, item.designation, item.quantite, item.prixUnitaire, item.quantite * item.prixUnitaire]),
      [""],
      ["", "", "", "TOTAL:", totalDevis],
    ];
    const csv = rows.map(r => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Devis_" + (list.customerName || "client") + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  };


  const openQuote = (list: any) => {
    setSelectedList(list);
    // Pré-remplir avec les items si déjà quotés
    if (list.quotedItems) {
      try { setQuoteItems(JSON.parse(list.quotedItems)); } catch { }
    } else {
      setQuoteItems([{ designation: "", quantite: 1, prixUnitaire: 0, total: 0 }]);
    }
    setShowQuoteModal(true);
  };

  const saveQuote = async () => {
    if (!selectedList) return;
    await updateStatusMutation.mutateAsync({
      id: selectedList.id,
      status: "quoted",
      totalAmount: totalDevis.toString(),
      quotedItems: JSON.stringify(quoteItems),
    });
    setShowQuoteModal(false);
  };

  const downloadFile = (list: any) => {
    if (list.fileData) {
      const link = document.createElement("a");
      link.href = list.fileData;
      link.download = list.fileName;
      link.click();
    }
  };

  if (isLoading) return <div className="text-center py-12 text-gray-500">Chargement...</div>;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Nouvelles", count: supplyLists?.filter((l: any) => l.status === "uploaded").length || 0, color: "bg-blue-50 text-blue-700" },
          { label: "En cours", count: supplyLists?.filter((l: any) => l.status === "processing").length || 0, color: "bg-yellow-50 text-yellow-700" },
          { label: "Devis envoyés", count: supplyLists?.filter((l: any) => l.status === "quoted").length || 0, color: "bg-purple-50 text-purple-700" },
          { label: "Total", count: supplyLists?.length || 0, color: "bg-gray-50 text-gray-700" },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-xl p-4 text-center`}>
            <p className="text-2xl font-bold">{s.count}</p>
            <p className="text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Liste */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Demandes de devis ({supplyLists?.length || 0})</h3>
          <button onClick={() => refetch()} className="text-sm text-[#005f8a] hover:underline">Actualiser</button>
        </div>

        {!supplyLists || supplyLists.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">Aucune demande reçue pour le moment</p>
            <p className="text-gray-400 text-sm mt-1">Les demandes des clients apparaîtront ici</p>
          </div>
        ) : (
          <div className="divide-y">
            {supplyLists.map((list: any) => {
              const StatusIcon = statusConfig[list.status]?.icon || Clock;
              return (
                <div key={list.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl flex-shrink-0">{fileTypeIcon[list.fileType] || "📎"}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 truncate">{list.fileName}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[list.status]?.color || "bg-gray-100 text-gray-600"}`}>
                          {statusConfig[list.status]?.label || list.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600">
                        {list.customerName && <span className="flex items-center gap-1"><User className="w-3 h-3" />{list.customerName}</span>}
                        {list.customerPhone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{list.customerPhone}</span>}
                        {list.customerEmail && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{list.customerEmail}</span>}
                      </div>
                      {list.notes && <p className="text-xs text-gray-500 mt-1 italic">"{list.notes}"</p>}
                      {list.totalAmount && <p className="text-sm font-bold text-[#005f8a] mt-1">Devis: {Number(list.totalAmount).toLocaleString()} FCFA</p>}
                      <p className="text-xs text-gray-400 mt-1">{new Date(list.createdAt).toLocaleString("fr-FR")}</p>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {list.fileData && (
                        <button
                          onClick={() => downloadFile(list)}
                          className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Download className="w-3 h-3" /> Fichier
                        </button>
                      )}
                      <button
                        onClick={() => openQuote(list)}
                        className="flex items-center gap-1 text-xs bg-[#005f8a] hover:bg-[#004a6b] text-white px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Calculator className="w-3 h-3" /> Devis
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Devis */}
      {showQuoteModal && selectedList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b bg-[#005f8a] text-white rounded-t-2xl">
              <h2 className="text-xl font-bold">Préparer le devis</h2>
              <p className="text-blue-100 text-sm mt-1">Client: {selectedList.customerName} • {selectedList.customerPhone}</p>
            </div>

            <div className="p-6">
              {/* Tableau devis */}
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-2 font-medium text-gray-700">Désignation</th>
                      <th className="text-center p-2 font-medium text-gray-700 w-16">Qté</th>
                      <th className="text-right p-2 font-medium text-gray-700 w-28">Prix unit.</th>
                      <th className="text-right p-2 font-medium text-gray-700 w-24">Total</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {quoteItems.map((item, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-1">
                          <input
                            value={item.designation}
                            onChange={e => updateItem(i, "designation", e.target.value)}
                            className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-[#005f8a] outline-none"
                            placeholder="Nom du livre..."
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="number" min="1"
                            value={item.quantite}
                            onChange={e => updateItem(i, "quantite", Number(e.target.value))}
                            className="w-full border border-gray-200 rounded px-2 py-1 text-sm text-center focus:ring-1 focus:ring-[#005f8a] outline-none"
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="number" min="0"
                            value={item.prixUnitaire}
                            onChange={e => updateItem(i, "prixUnitaire", Number(e.target.value))}
                            className="w-full border border-gray-200 rounded px-2 py-1 text-sm text-right focus:ring-1 focus:ring-[#005f8a] outline-none"
                          />
                        </td>
                        <td className="p-2 text-right font-medium text-[#005f8a]">
                          {(item.quantite * item.prixUnitaire).toLocaleString()}
                        </td>
                        <td className="p-1">
                          <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#005f8a] text-white">
                      <td colSpan={3} className="p-3 font-bold text-right">TOTAL GÉNÉRAL</td>
                      <td className="p-3 font-bold text-right text-lg">{totalDevis.toLocaleString()} FCFA</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <button onClick={addItem} className="text-sm text-[#005f8a] hover:underline mb-6">+ Ajouter une ligne</button>

              <div className="flex gap-3">
                <button onClick={() => setShowQuoteModal(false)} className="flex-1 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                  Annuler
                </button>
                <button
                  onClick={() => exportCSV(selectedList)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 text-sm"
                >
                  <Download className="w-4 h-4" /> Excel
                </button>
                <button
                  onClick={saveQuote}
                  disabled={updateStatusMutation.isPending}
                  className="flex-1 py-2 bg-[#005f8a] text-white rounded-xl font-bold hover:bg-[#004a6b] disabled:opacity-60"
                >
                  Valider le devis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
