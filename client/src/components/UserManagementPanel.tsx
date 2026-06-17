import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Phone, Mail, Calendar, Search, UserCheck, UserX, Clock, Download } from "lucide-react";

export function UserManagementPanel() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"clients" | "pending" | "all">("clients");

  const { data: allUsers, isLoading, refetch } = trpc.admin.getAllUsers.useQuery();
  const { data: stats } = trpc.admin.getUserStats.useQuery();

  const approveUserMutation = trpc.admin.approveUser.useMutation({ onSuccess: () => refetch() });
  const disableUserMutation = trpc.admin.disableUser.useMutation({ onSuccess: () => refetch() });

  const clients = allUsers?.filter((u: any) => u.role !== "admin") || [];
  const pending = allUsers?.filter((u: any) => !u.isApproved && u.role !== "admin") || [];
  const admins = allUsers?.filter((u: any) => u.role === "admin") || [];

  const filtered = (list: any[]) =>
    list.filter((u) =>
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search)
    );

  const exportCSV = () => {
    const rows = [
      ["Nom", "Email", "Téléphone", "Rôle", "Statut", "Date inscription"],
      ...clients.map((u: any) => [
        u.name || "",
        u.email || "",
        u.phone || "",
        u.userType || "client",
        u.isApproved ? "Approuvé" : "En attente",
        new Date(u.createdAt).toLocaleDateString("fr-FR"),
      ]),
    ];
    const csv = rows.map((r) => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clients-cavallylivres-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const tabs = [
    { key: "clients" as const, label: "Clients", count: clients.length },
    { key: "pending" as const, label: "En attente", count: pending.length },
    { key: "all" as const, label: "Tous", count: allUsers?.length || 0 },
  ];

  const currentList =
    activeTab === "clients" ? filtered(clients) :
    activeTab === "pending" ? filtered(pending) :
    filtered(allUsers || []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Total clients</p>
                <p className="text-3xl font-bold text-gray-900">{clients.length}</p>
              </div>
              <Users className="w-10 h-10 text-blue-400 opacity-30" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Approuvés</p>
                <p className="text-3xl font-bold text-green-600">{stats?.approved || 0}</p>
              </div>
              <UserCheck className="w-10 h-10 text-green-400 opacity-30" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">En attente</p>
                <p className="text-3xl font-bold text-orange-600">{pending.length}</p>
              </div>
              <Clock className="w-10 h-10 text-orange-400 opacity-30" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Admins</p>
                <p className="text-3xl font-bold text-purple-600">{admins.length}</p>
              </div>
              <UserX className="w-10 h-10 text-purple-400 opacity-30" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.key ? "bg-white text-[#005f8a] shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? "bg-[#005f8a] text-white" : "bg-gray-300 text-gray-600"
              }`}>{tab.count}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Nom, email, téléphone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 text-sm" />
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1 text-[#005f8a] border-[#005f8a] hover:bg-blue-50 whitespace-nowrap">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      <Card className="shadow-md">
        <CardHeader className="border-b bg-gray-50 py-3">
          <CardTitle className="text-base font-bold text-gray-800">
            {activeTab === "clients" ? "Liste des clients" : activeTab === "pending" ? "Demandes en attente" : "Tous les utilisateurs"}
            <span className="ml-2 text-sm font-normal text-gray-500">({currentList.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12 text-gray-400">Chargement...</div>
          ) : currentList.length === 0 ? (
            <div className="text-center py-12 text-gray-400">{search ? "Aucun résultat" : "Aucun utilisateur"}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Nom complet</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Téléphone</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Inscription</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentList.map((user: any) => (
                    <tr key={user.id} className="border-b hover:bg-blue-50/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#005f8a] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {(user.name || "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name || "—"}</p>
                            {user.role === "admin" && <span className="text-xs text-purple-600 font-medium">Admin</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate max-w-[180px]">{user.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          <span>{user.phone || <span className="text-gray-300 italic text-xs">Non renseigné</span>}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {user.role === "admin" ? (
                          <Badge className="bg-purple-100 text-purple-800">Admin</Badge>
                        ) : user.isApproved ? (
                          <Badge className="bg-green-100 text-green-800">✓ Actif</Badge>
                        ) : (
                          <Badge className="bg-orange-100 text-orange-800">⏳ En attente</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                          <Calendar className="w-3 h-3" />
                          {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {user.role !== "admin" && (
                          !user.isApproved ? (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs h-7"
                              onClick={() => approveUserMutation.mutate({ userId: user.id })}
                              disabled={approveUserMutation.isPending}>
                              Approuver
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 text-xs h-7"
                              onClick={() => disableUserMutation.mutate({ userId: user.id })}
                              disabled={disableUserMutation.isPending}>
                              Désactiver
                            </Button>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
