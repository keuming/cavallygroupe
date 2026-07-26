import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { 
  FileText, Package, Users, BarChart3, Upload, 
  ChevronDown, LogOut, BookOpen, Bell, RefreshCw,
  Eye, Table, Send, Receipt, CreditCard, Check,
  Clock, AlertCircle, XCircle, Phone, Mail,
  Download, Plus, Trash2, Edit, Search
} from "lucide-react";
import { OrderManagementPanel } from "@/components/OrderManagementPanel";

// ---- Types ----
interface QuoteItem { designation: string; quantite: number; prixUnitaire: number; }

// ---- Composant principal ----
export default function AdminDashboard() {
  const [tab, setTab] = useState<"listes" | "commandes" | "produits" | "clients" | "stats">("listes");
  const [actionMenu, setActionMenu] = useState<number | null>(null);
  const [modal, setModal] = useState<{type: string; list: any} | null>(null);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([{designation:"",quantite:1,prixUnitaire:0}]);
  const [productForm, setProductForm] = useState({title:"",author:"",price:"",stock:"",categoryId:"1",description:"",coverImageUrl:""});
  const [search, setSearch] = useState("");

  const { data: supplyLists, refetch: refetchLists } = trpc.supplyLists.getAll.useQuery();
  const { data: stats } = trpc.admin.getStats.useQuery();
  const { data: products, refetch: refetchProducts } = trpc.admin.listProducts.useQuery({});
  const { data: users } = trpc.admin.listUsers.useQuery();
  const updateStatusMutation = trpc.admin.updateSupplyListStatus.useMutation({ onSuccess: () => refetchLists() });
  const addProductMutation = trpc.admin.createProduct.useMutation({ onSuccess: () => { refetchProducts(); setModal(null); setProductForm({title:"",author:"",price:"",stock:"",categoryId:"1",description:"",coverImageUrl:""}); }});
  const updateProductMutation = trpc.admin.updateProduct.useMutation({ onSuccess: () => { refetchProducts(); setModal(null); }});
  const deleteProductMutation = trpc.admin.deleteProduct.useMutation({ onSuccess: () => refetchProducts() });

  const statusCfg: Record<string, {label:string; color:string; icon:any}> = {
    uploaded:   { label:"Nouvelle",      color:"bg-blue-100 text-blue-700",   icon:Clock },
    processing: { label:"En traitement", color:"bg-yellow-100 text-yellow-700", icon:AlertCircle },
    quoted:     { label:"Devis envoyé",  color:"bg-purple-100 text-purple-700", icon:Send },
    invoiced:   { label:"Facturé",       color:"bg-green-100 text-green-700",  icon:Receipt },
    paid:       { label:"Payé",          color:"bg-emerald-100 text-emerald-700",icon:Check },
    cancelled:  { label:"Annulé",        color:"bg-red-100 text-red-700",      icon:XCircle },
  };

  const totalDevis = quoteItems.reduce((s,i) => s + i.quantite * i.prixUnitaire, 0);

  const exportCSV = (list: any) => {
    const rows = [
      ["CAVALLY LIVRES - DEVIS"],
      ["Client:", list.customerName || ""],
      ["Tel:", list.customerPhone || ""],
      ["Email:", list.customerEmail || ""],
      ["Date:", new Date().toLocaleDateString("fr-FR")],
      [""],
      ["N", "Designation", "Qte", "Prix unitaire FCFA", "Total FCFA"],
      ...quoteItems.map((item,i) => [i+1, item.designation, item.quantite, item.prixUnitaire, item.quantite*item.prixUnitaire]),
      [""],
      ["","","","TOTAL:", totalDevis],
      ["","","","Livraison:", "Gratuite Abidjan"],
    ];
    const csv = rows.map(r=>r.join(";")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\uFEFF"+csv], {type:"text/csv;charset=utf-8"}));
    a.download = "Devis_" + (list.customerName||"client") + ".csv";
    a.click();
  };

  const downloadFile = (list: any) => {
    if (!list.fileData) return alert("Fichier non disponible");
    const a = document.createElement("a");
    a.href = list.fileData;
    a.download = list.fileName;
    a.click();
  };

  const openModal = (type: string, list: any) => {
    setActionMenu(null);
    if (type === 'edit-product' && list) {
      setProductForm({title:list.title||'',author:list.author||'',price:list.price||'',stock:String(list.stock||0),categoryId:String(list.categoryId||1),description:list.description||'',coverImageUrl:list.coverImageUrl||''});
    }
    if (list.quotedItems) {
      try { setQuoteItems(JSON.parse(list.quotedItems)); } catch { setQuoteItems([{designation:"",quantite:1,prixUnitaire:0}]); }
    } else {
      setQuoteItems([{designation:"",quantite:1,prixUnitaire:0}]);
    }
    setModal({ type, list });
  };

  const saveAndUpdateStatus = async (status: string) => {
    if (!modal) return;
    await updateStatusMutation.mutateAsync({
      id: modal.list.id,
      status,
      totalAmount: totalDevis.toString(),
      quotedItems: JSON.stringify(quoteItems),
    });
    setModal(null);
  };

  const filteredLists = supplyLists?.filter((l: any) => 
    !search || l.customerName?.toLowerCase().includes(search.toLowerCase()) || l.customerPhone?.includes(search) || l.customerEmail?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const navTabs = [
    { id: "listes",    label: "Listes",     icon: Upload,   badge: supplyLists?.filter((l:any)=>l.status==="uploaded").length },
    { id: "commandes", label: "Commandes",  icon: Package,  badge: null },
    { id: "produits",  label: "Produits",   icon: BookOpen, badge: null },
    { id: "clients",   label: "Clients",    icon: Users,    badge: null },
    { id: "stats",     label: "Stats",      icon: BarChart3,badge: null },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#005f8a] rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-[#005f8a] text-sm">Cavally Livres</p>
              <p className="text-xs text-gray-400">Dashboard Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { refetchLists(); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Actualiser">
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={() => { localStorage.removeItem("cavally_token"); window.location.href = "/login"; }}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs navigation */}
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
            {navTabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium whitespace-nowrap transition-colors relative flex-shrink-0 ${
                  tab === t.id ? "bg-[#005f8a] text-white" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
                {t.badge ? (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {t.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl">

        {/* ===== ONGLET LISTES ===== */}
        {tab === "listes" && (
          <div>
            {/* Stats rapides */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label:"Nouvelles",    count: supplyLists?.filter((l:any)=>l.status==="uploaded").length||0,   color:"text-blue-600",   bg:"bg-blue-50" },
                { label:"En traitement",count: supplyLists?.filter((l:any)=>l.status==="processing").length||0, color:"text-yellow-600", bg:"bg-yellow-50" },
                { label:"Devis envoyés",count: supplyLists?.filter((l:any)=>l.status==="quoted").length||0,     color:"text-purple-600", bg:"bg-purple-50" },
                { label:"Total",        count: supplyLists?.length||0,                                           color:"text-gray-600",   bg:"bg-gray-100" },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Barre recherche */}
            <div className="bg-white rounded-xl border shadow-sm mb-4">
              <div className="p-4 border-b flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input value={search} onChange={e=>setSearch(e.target.value)}
                    placeholder="Rechercher par nom, téléphone, email..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#005f8a]"
                  />
                </div>
                <span className="text-sm text-gray-500">{filteredLists.length} liste{filteredLists.length!==1?"s":""}</span>
              </div>

              {/* Table des listes */}
              {filteredLists.length === 0 ? (
                <div className="text-center py-16">
                  <Upload className="w-16 h-16 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400">Aucune liste reçue</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                      <tr>
                        <th className="text-left p-3">Client</th>
                        <th className="text-left p-3 hidden sm:table-cell">Fichier</th>
                        <th className="text-left p-3 hidden md:table-cell">Date</th>
                        <th className="text-left p-3">Statut</th>
                        <th className="text-left p-3 hidden lg:table-cell">Montant</th>
                        <th className="text-right p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredLists.map((list: any) => {
                        const cfg = statusCfg[list.status] || statusCfg.uploaded;
                        const Icon = cfg.icon;
                        return (
                          <tr key={list.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-3">
                              <p className="font-semibold text-gray-900 text-sm">{list.customerName || "Anonyme"}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3" />{list.customerPhone || "N/A"}
                              </p>
                              {list.customerEmail && (
                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                  <Mail className="w-3 h-3" />{list.customerEmail}
                                </p>
                              )}
                            </td>
                            <td className="p-3 hidden sm:table-cell">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{list.fileType==="pdf"?"📄":list.fileType==="image"?"🖼️":"📝"}</span>
                                <span className="text-xs text-gray-500 truncate max-w-[120px]">{list.fileName}</span>
                              </div>
                              {list.notes && <p className="text-xs text-gray-400 italic mt-0.5 truncate max-w-[150px]">"{list.notes}"</p>}
                            </td>
                            <td className="p-3 hidden md:table-cell">
                              <p className="text-sm text-gray-600">{new Date(list.createdAt).toLocaleDateString("fr-FR")}</p>
                              <p className="text-xs text-gray-400">{new Date(list.createdAt).toLocaleTimeString("fr-FR", {hour:"2-digit",minute:"2-digit"})}</p>
                            </td>
                            <td className="p-3">
                              <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${cfg.color}`}>
                                <Icon className="w-3 h-3" />
                                {cfg.label}
                              </span>
                            </td>
                            <td className="p-3 hidden lg:table-cell">
                              {list.totalAmount ? (
                                <span className="font-bold text-[#005f8a] text-sm">{Number(list.totalAmount).toLocaleString()} FCFA</span>
                              ) : (
                                <span className="text-gray-400 text-xs">—</span>
                              )}
                            </td>
                            <td className="p-3 text-right relative">
                              <button
                                onClick={() => setActionMenu(actionMenu===list.id ? null : list.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#005f8a] text-white rounded-lg text-sm font-medium hover:bg-[#004a6b] transition-colors"
                              >
                                Actions <ChevronDown className="w-3 h-3" />
                              </button>

                              {actionMenu === list.id && (
                                <div className="absolute right-3 top-12 bg-white rounded-xl shadow-xl border border-gray-100 py-1 w-52 z-50">
                                  <button onClick={() => openModal("view", list)} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                                    <Eye className="w-4 h-4 text-blue-500" /> Afficher la liste
                                  </button>
                                  {list.fileData && (
                                    <button onClick={() => { downloadFile(list); setActionMenu(null); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                                      <Download className="w-4 h-4 text-gray-500" /> Télécharger fichier
                                    </button>
                                  )}
                                  <button onClick={() => openModal("quote", list)} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                                    <Table className="w-4 h-4 text-green-500" /> Convertir en Excel
                                  </button>
                                  <div className="border-t border-gray-100 my-1" />
                                  <button onClick={() => openModal("send-quote", list)} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                                    <Send className="w-4 h-4 text-purple-500" /> Envoyer devis
                                  </button>
                                  <button onClick={() => openModal("invoice", list)} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                                    <Receipt className="w-4 h-4 text-orange-500" /> Envoyer facture
                                  </button>
                                  <button onClick={() => openModal("payment-link", list)} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                                    <CreditCard className="w-4 h-4 text-[#005f8a]" /> Lien paiement Mobile
                                  </button>
                                  <div className="border-t border-gray-100 my-1" />
                                  <button
                                    onClick={() => { updateStatusMutation.mutate({id:list.id,status:"processing"}); setActionMenu(null); }}
                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-yellow-600 hover:bg-yellow-50"
                                  >
                                    <AlertCircle className="w-4 h-4" /> Marquer en traitement
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== ONGLET COMMANDES ===== */}
        {tab === "commandes" && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Commandes directes</h2>
            <OrderManagementPanel />
          </div>
        )}

        {/* ===== ONGLET PRODUITS ===== */}
        {tab === "produits" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Catalogue ({products?.length || 0} produits)</h2>
              <button
                onClick={() => setModal({type:"add-product", list: null})}
                className="flex items-center gap-2 px-4 py-2 bg-[#005f8a] text-white rounded-xl text-sm font-medium hover:bg-[#004a6b]"
              >
                <Plus className="w-4 h-4" /> Ajouter
              </button>
            </div>
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="text-left p-3">Produit</th>
                    <th className="text-left p-3 hidden sm:table-cell">Catégorie</th>
                    <th className="text-left p-3">Prix</th>
                    <th className="text-left p-3">Stock</th>
                    <th className="text-right p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products?.map((p: any) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {p.coverImageUrl ? (
                            <img src={p.coverImageUrl} alt={p.title} className="w-10 h-12 object-cover rounded-lg flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm text-gray-900 line-clamp-1">{p.title}</p>
                            <p className="text-xs text-gray-500">{p.author}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 hidden sm:table-cell">
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{p.categoryId}</span>
                      </td>
                      <td className="p-3 font-bold text-[#005f8a] text-sm">{Number(p.price).toLocaleString()} F</td>
                      <td className="p-3">
                        <span className={`text-xs font-medium ${p.stock > 5 ? "text-green-600" : p.stock > 0 ? "text-orange-500" : "text-red-500"}`}>
                          {p.stock > 0 ? p.stock : "Rupture"}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setModal({type:"edit-product", list: p})} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => { if(confirm("Supprimer ce produit ?")) deleteProductMutation.mutate({id:p.id}); }} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== ONGLET CLIENTS ===== */}
        {tab === "clients" && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Clients ({users?.length || 0})</h2>
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="text-left p-3">Client</th>
                    <th className="text-left p-3 hidden sm:table-cell">Email</th>
                    <th className="text-left p-3 hidden md:table-cell">Téléphone</th>
                    <th className="text-left p-3">Rôle</th>
                    <th className="text-left p-3 hidden lg:table-cell">Inscrit le</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users?.map((u: any) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#005f8a] rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {u.name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <span className="font-medium text-sm text-gray-900">{u.name}</span>
                        </div>
                      </td>
                      <td className="p-3 hidden sm:table-cell text-sm text-gray-600">{u.email}</td>
                      <td className="p-3 hidden md:table-cell text-sm text-gray-600">{u.phone || "—"}</td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role==="admin" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 hidden lg:table-cell text-xs text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== ONGLET STATS ===== */}
        {tab === "stats" && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Statistiques</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label:"Produits", value: stats?.totalProducts || 0, icon:"📚" },
                { label:"Commandes", value: stats?.totalOrders || 0, icon:"📦" },
                { label:"Clients", value: stats?.totalUsers || 0, icon:"👥" },
                { label:"Revenus", value: `${(stats?.totalRevenue||0).toLocaleString()} F`, icon:"💰" },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl border p-5 shadow-sm">
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border p-6 shadow-sm">
              <h3 className="font-bold text-gray-700 mb-3">Contact service client</h3>
              <div className="space-y-2 text-sm">
                <p>📞 <a href="tel:+2250173924646" className="text-[#005f8a]">+225 01 73 92 46 46</a></p>
                <p>📞 <a href="tel:+2250501956464" className="text-[#005f8a]">+225 05 01 95 64 64</a></p>
                <p>📧 <a href="mailto:service.client@cavally-livres.com" className="text-[#005f8a]">service.client@cavally-livres.com</a></p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fermer menu action au clic extérieur */}
      {actionMenu && <div className="fixed inset-0 z-40" onClick={() => setActionMenu(null)} />}

      {/* ===== MODALS ===== */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Modal: Voir la liste */}
            {modal.type === "view" && (
              <div>
                <div className="p-5 border-b bg-blue-50">
                  <h3 className="font-bold text-[#005f8a] text-lg">Détails de la liste</h3>
                  <p className="text-sm text-gray-500">#{modal.list.id} — {modal.list.fileName}</p>
                </div>
                <div className="p-5 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["Client", modal.list.customerName],
                      ["Téléphone", modal.list.customerPhone],
                      ["Email", modal.list.customerEmail],
                      ["Statut", statusCfg[modal.list.status]?.label],
                      ["Type fichier", modal.list.fileType],
                      ["Reçu le", new Date(modal.list.createdAt).toLocaleString("fr-FR")],
                    ].map(([k,v]) => v && (
                      <div key={k} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-400 uppercase">{k}</p>
                        <p className="font-medium text-gray-900 text-sm mt-0.5">{v}</p>
                      </div>
                    ))}
                  </div>
                  {modal.list.notes && (
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 uppercase mb-1">Notes du client</p>
                      <p className="text-sm text-gray-700 italic">"{modal.list.notes}"</p>
                    </div>
                  )}
                  {modal.list.totalAmount && (
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 uppercase mb-1">Montant devis</p>
                      <p className="text-xl font-bold text-green-600">{Number(modal.list.totalAmount).toLocaleString()} FCFA</p>
                    </div>
                  )}
                </div>
                <div className="p-5 border-t flex gap-3">
                  <button onClick={() => setModal(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">Fermer</button>
                  <button onClick={() => openModal("quote", modal.list)} className="flex-1 py-2 bg-[#005f8a] text-white rounded-xl font-medium hover:bg-[#004a6b]">
                    Préparer le devis
                  </button>
                </div>
              </div>
            )}

            {/* Modal: Devis / Excel */}
            {(modal.type === "quote" || modal.type === "send-quote") && (
              <div>
                <div className="p-5 border-b bg-green-50">
                  <h3 className="font-bold text-green-800 text-lg">Préparer le devis</h3>
                  <p className="text-sm text-green-600">{modal.list.customerName} — {modal.list.customerPhone}</p>
                </div>
                <div className="p-5">
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left p-2 font-medium">Désignation</th>
                          <th className="text-center p-2 font-medium w-16">Qté</th>
                          <th className="text-right p-2 font-medium w-32">Prix unit. FCFA</th>
                          <th className="text-right p-2 font-medium w-28">Total</th>
                          <th className="w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {quoteItems.map((item, i) => (
                          <tr key={i} className="border-b">
                            <td className="p-1">
                              <input value={item.designation} onChange={e => setQuoteItems(prev => { const u=[...prev]; u[i]={...u[i],designation:e.target.value}; return u; })}
                                className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-[#005f8a] outline-none" placeholder="Nom du livre..." />
                            </td>
                            <td className="p-1">
                              <input type="number" min="1" value={item.quantite} onChange={e => setQuoteItems(prev => { const u=[...prev]; u[i]={...u[i],quantite:Number(e.target.value)}; return u; })}
                                className="w-full border border-gray-200 rounded px-2 py-1 text-sm text-center outline-none" />
                            </td>
                            <td className="p-1">
                              <input type="number" min="0" value={item.prixUnitaire} onChange={e => setQuoteItems(prev => { const u=[...prev]; u[i]={...u[i],prixUnitaire:Number(e.target.value)}; return u; })}
                                className="w-full border border-gray-200 rounded px-2 py-1 text-sm text-right outline-none" />
                            </td>
                            <td className="p-2 text-right font-bold text-[#005f8a]">{(item.quantite*item.prixUnitaire).toLocaleString()}</td>
                            <td className="p-1">
                              <button onClick={() => setQuoteItems(prev => prev.filter((_,idx)=>idx!==i))} className="text-red-400 hover:text-red-600">✕</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-[#005f8a] text-white">
                          <td colSpan={3} className="p-3 font-bold text-right">TOTAL</td>
                          <td className="p-3 font-bold text-right text-lg">{totalDevis.toLocaleString()} FCFA</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <button onClick={() => setQuoteItems(prev=>[...prev,{designation:"",quantite:1,prixUnitaire:0}])} className="text-sm text-[#005f8a] hover:underline mb-4">+ Ajouter une ligne</button>
                </div>
                <div className="p-5 border-t flex flex-wrap gap-2">
                  <button onClick={() => setModal(null)} className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm">Annuler</button>
                  <button onClick={() => exportCSV(modal.list)} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-sm hover:bg-green-600">
                    <Download className="w-4 h-4" /> Télécharger CSV
                  </button>
                  <button onClick={() => saveAndUpdateStatus("quoted")} className="flex-1 py-2 bg-[#005f8a] text-white rounded-xl font-bold text-sm hover:bg-[#004a6b]">
                    <Send className="w-4 h-4 inline mr-1" /> Valider & marquer "Devis envoyé"
                  </button>
                </div>
              </div>
            )}

            {/* Modal: Facture */}
            {modal.type === "invoice" && (
              <div>
                <div className="p-5 border-b bg-orange-50">
                  <h3 className="font-bold text-orange-800 text-lg">Envoyer la facture</h3>
                  <p className="text-sm text-orange-600">{modal.list.customerName}</p>
                </div>
                <div className="p-5">
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <p className="font-bold text-gray-700 mb-2">Récapitulatif</p>
                    {modal.list.totalAmount ? (
                      <p className="text-2xl font-bold text-[#005f8a]">{Number(modal.list.totalAmount).toLocaleString()} FCFA</p>
                    ) : (
                      <p className="text-red-500 text-sm">⚠️ Aucun devis établi. Préparez d'abord le devis.</p>
                    )}
                  </div>
                  {modal.list.totalAmount && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">La facture sera envoyée à :</p>
                      <div className="bg-blue-50 rounded-lg p-3 text-sm">
                        {modal.list.customerPhone && <p>📱 SMS → {modal.list.customerPhone}</p>}
                        {modal.list.customerEmail && <p>📧 Email → {modal.list.customerEmail}</p>}
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-5 border-t flex gap-3">
                  <button onClick={() => setModal(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-gray-600">Annuler</button>
                  {modal.list.totalAmount && (
                    <button onClick={() => saveAndUpdateStatus("invoiced")} className="flex-1 py-2 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600">
                      Confirmer l'envoi facture
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Modal: Ajouter/Modifier produit */}
            {(modal.type === "add-product" || modal.type === "edit-product") && (
              <div>
                <div className="p-5 border-b bg-[#005f8a] text-white">
                  <h3 className="font-bold text-lg">{modal.type === "add-product" ? "Ajouter un produit" : "Modifier le produit"}</h3>
                </div>
                <div className="p-5 space-y-4">
                  {[
                    {label:"Titre *", field:"title", type:"text", placeholder:"Nom du livre"},
                    {label:"Auteur", field:"author", type:"text", placeholder:"Nom de l'auteur"},
                    {label:"Prix (FCFA) *", field:"price", type:"number", placeholder:"Ex: 5000"},
                    {label:"Stock *", field:"stock", type:"number", placeholder:"Ex: 10"},
                    {label:"URL Image (Cloudinary)", field:"coverImageUrl", type:"text", placeholder:"https://res.cloudinary.com/..."},
                    {label:"Description", field:"description", type:"text", placeholder:"Description courte"},
                  ].map(f => (
                    <div key={f.field}>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">{f.label}</label>
                      <input
                        type={f.type}
                        value={(productForm as any)[f.field]}
                        onChange={e => setProductForm(prev => ({...prev, [f.field]: e.target.value}))}
                        placeholder={f.placeholder}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#005f8a] outline-none"
                      />
                    </div>
                  ))}
                </div>
                <div className="p-5 border-t flex gap-3">
                  <button onClick={() => setModal(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">Annuler</button>
                  <button
                    onClick={() => {
                      if (!productForm.title || !productForm.price || !productForm.stock) return alert("Titre, prix et stock requis");
                      if (modal.type === "add-product") {
                        addProductMutation.mutate({
                          title: productForm.title,
                          author: productForm.author,
                          price: productForm.price,
                          stock: parseInt(productForm.stock),
                          categoryId: parseInt(productForm.categoryId),
                          description: productForm.description,
                          coverImageUrl: productForm.coverImageUrl,
                        });
                      } else {
                        updateProductMutation.mutate({
                          id: modal.list.id,
                          title: productForm.title,
                          author: productForm.author,
                          price: productForm.price,
                          stock: parseInt(productForm.stock),
                          description: productForm.description,
                          coverImageUrl: productForm.coverImageUrl,
                        });
                      }
                    }}
                    className="flex-1 py-2 bg-[#005f8a] text-white rounded-xl font-bold hover:bg-[#004a6b]"
                  >
                    {modal.type === "add-product" ? "Ajouter" : "Enregistrer"}
                  </button>
                </div>
              </div>
            )}

            {/* Modal: Lien paiement */}
            {modal.type === "payment-link" && (
              <div>
                <div className="p-5 border-b bg-[#005f8a] text-white">
                  <h3 className="font-bold text-lg">Lien de paiement Mobile</h3>
                  <p className="text-blue-100 text-sm">{modal.list.customerName}</p>
                </div>
                <div className="p-5">
                  {modal.list.totalAmount ? (
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <p className="text-sm text-gray-500">Montant à payer</p>
                        <p className="text-3xl font-bold text-[#005f8a] mt-1">{Number(modal.list.totalAmount).toLocaleString()} FCFA</p>
                      </div>
                      <div className="space-y-2">
                        {[
                          { name:"Wave", color:"bg-blue-500", link:`https://pay.wave.com/m/cavally-livres?amount=${modal.list.totalAmount}` },
                          { name:"Orange Money", color:"bg-orange-500", link:`tel:+2250173924646` },
                          { name:"MTN MoMo", color:"bg-yellow-500", link:`tel:+2250501956464` },
                        ].map(pm => (
                          <div key={pm.name} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                            <span className="font-medium text-sm">{pm.name}</span>
                            <button
                              onClick={() => { navigator.clipboard.writeText(pm.link); alert("Lien copié !"); }}
                              className={`${pm.color} text-white text-xs px-3 py-1.5 rounded-lg`}
                            >
                              Copier lien
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-red-500 text-center py-8">⚠️ Préparez d'abord le devis avant d'envoyer un lien de paiement.</p>
                  )}
                </div>
                <div className="p-5 border-t">
                  <button onClick={() => setModal(null)} className="w-full py-2 border border-gray-200 rounded-xl text-gray-600">Fermer</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
