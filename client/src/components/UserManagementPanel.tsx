import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function UserManagementPanel() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [action, setAction] = useState<"approve" | "reject" | "enable" | "disable" | null>(null);

  // Queries
  const { data: allUsers, isLoading: loadingAll, refetch: refetchAll } = trpc.admin.getAllUsers.useQuery();
  const { data: pendingUsers, isLoading: loadingPending, refetch: refetchPending } = trpc.admin.getPendingUsers.useQuery();
  const { data: stats } = trpc.admin.getUserStats.useQuery();

  // Mutations
  const approveUserMutation = trpc.admin.approveUser.useMutation({
    onSuccess: () => {
      toast.success("Utilisateur approuvé");
      refetchAll();
      refetchPending();
      setShowDialog(false);
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const rejectUserMutation = trpc.admin.rejectUser.useMutation({
    onSuccess: () => {
      toast.success("Utilisateur rejeté");
      refetchAll();
      refetchPending();
      setShowDialog(false);
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const enableUserMutation = trpc.admin.enableUser.useMutation({
    onSuccess: () => {
      toast.success("Utilisateur activé");
      refetchAll();
      setShowDialog(false);
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const disableUserMutation = trpc.admin.disableUser.useMutation({
    onSuccess: () => {
      toast.success("Utilisateur désactivé");
      refetchAll();
      setShowDialog(false);
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const handleAction = () => {
    if (!selectedUser || !action) return;

    if (action === "approve") {
      approveUserMutation.mutate({ userId: selectedUser.id });
    } else if (action === "reject") {
      rejectUserMutation.mutate({ userId: selectedUser.id });
    } else if (action === "enable") {
      enableUserMutation.mutate({ userId: selectedUser.id });
    } else if (action === "disable") {
      disableUserMutation.mutate({ userId: selectedUser.id });
    }
  };

  const openDialog = (user: any, actionType: "approve" | "reject" | "enable" | "disable") => {
    setSelectedUser(user);
    setAction(actionType);
    setShowDialog(true);
  };

  const getActionLabel = () => {
    switch (action) {
      case "approve":
        return "Approuver";
      case "reject":
        return "Rejeter";
      case "enable":
        return "Activer";
      case "disable":
        return "Désactiver";
      default:
        return "";
    }
  };

  const getActionDescription = () => {
    switch (action) {
      case "approve":
        return `Êtes-vous sûr de vouloir approuver ${selectedUser?.name}? Il pourra accéder au dashboard.`;
      case "reject":
        return `Êtes-vous sûr de vouloir rejeter ${selectedUser?.name}? Son compte sera désactivé.`;
      case "enable":
        return `Êtes-vous sûr de vouloir activer ${selectedUser?.name}? Il pourra accéder au dashboard.`;
      case "disable":
        return `Êtes-vous sûr de vouloir désactiver ${selectedUser?.name}? Il ne pourra plus accéder au dashboard.`;
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Utilisateurs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approuvés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.approved || 0}</div>
            <p className="text-xs text-muted-foreground">Actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.pending || 0}</div>
            <p className="text-xs text-muted-foreground">À valider</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">En Attente ({pendingUsers?.length || 0})</TabsTrigger>
          <TabsTrigger value="all">Tous ({allUsers?.length || 0})</TabsTrigger>
        </TabsList>

        {/* Pending Users Tab */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Demandes d'Inscription</CardTitle>
              <CardDescription>Utilisateurs en attente d'approbation</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPending ? (
                <div className="text-center py-8">Chargement...</div>
              ) : pendingUsers?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Aucune demande en attente</div>
              ) : (
                <div className="space-y-4">
                  {pendingUsers?.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Inscrit le {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => openDialog(user, "approve")}
                          disabled={approveUserMutation.isPending}
                        >
                          Approuver
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openDialog(user, "reject")}
                          disabled={rejectUserMutation.isPending}
                        >
                          Rejeter
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Users Tab */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Tous les Utilisateurs</CardTitle>
              <CardDescription>Gestion complète des comptes utilisateurs</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAll ? (
                <div className="text-center py-8">Chargement...</div>
              ) : allUsers?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Aucun utilisateur</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Nom</th>
                        <th className="text-left py-2 px-4">Email</th>
                        <th className="text-left py-2 px-4">Type</th>
                        <th className="text-left py-2 px-4">Statut</th>
                        <th className="text-left py-2 px-4">Dernière Connexion</th>
                        <th className="text-left py-2 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers?.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-4 font-medium">{user.name}</td>
                          <td className="py-2 px-4 text-muted-foreground">{user.email}</td>
                          <td className="py-2 px-4">
                            <Badge variant="outline">
                              {user.userType === "client" ? "Client" : "Vendeur"}
                            </Badge>
                          </td>
                          <td className="py-2 px-4">
                            {user.isApproved ? (
                              <Badge className="bg-green-100 text-green-800">Approuvé</Badge>
                            ) : (
                              <Badge className="bg-orange-100 text-orange-800">En Attente</Badge>
                            )}
                          </td>
                          <td className="py-2 px-4 text-muted-foreground">
                            {new Date(user.lastSignedIn).toLocaleDateString("fr-FR")}
                          </td>
                          <td className="py-2 px-4">
                            <div className="flex gap-1">
                              {!user.isApproved ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => openDialog(user, "approve")}
                                    disabled={approveUserMutation.isPending}
                                  >
                                    Approuver
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openDialog(user, "disable")}
                                  disabled={disableUserMutation.isPending}
                                >
                                  Désactiver
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{getActionLabel()} l'utilisateur</AlertDialogTitle>
            <AlertDialogDescription>{getActionDescription()}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction}>
              {getActionLabel()}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
