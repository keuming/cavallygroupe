import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, FileText } from "lucide-react";

export function SupplyListsPanel() {
  const [selectedList, setSelectedList] = useState<any>(null);

  const { data: supplyLists, isLoading } = trpc.supplyLists.getAll.useQuery();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "uploaded":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "processed":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf":
        return "📄";
      case "image":
        return "🖼️";
      case "document":
        return "📋";
      case "text":
        return "📝";
      default:
        return "📎";
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Chargement des demandes de devis...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Demandes de Devis Client</CardTitle>
          <CardDescription>Gérez les listes de fournitures téléchargées par les clients</CardDescription>
        </CardHeader>
        <CardContent>
          {supplyLists && supplyLists.length > 0 ? (
            <div className="space-y-3">
              {supplyLists.map((list: any) => (
                <div key={list.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-2xl">{getFileTypeIcon(list.fileType)}</span>
                    <div className="flex-1">
                      <div className="font-medium">{list.fileName}</div>
                      <div className="text-sm text-gray-600">
                        {list.customerName || "Client anonyme"} • {list.customerEmail || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(list.createdAt).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(list.status)}>
                      {list.status === "uploaded" && "Téléchargé"}
                      {list.status === "processing" && "Traitement..."}
                      {list.status === "processed" && "Traité"}
                      {list.status === "error" && "Erreur"}
                    </Badge>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedList(list)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Voir
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Détails de la demande</DialogTitle>
                          <DialogDescription>
                            {selectedList?.fileName}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-semibold mb-2">Informations du client</h3>
                            <div className="bg-gray-50 p-4 rounded space-y-2">
                              <div>
                                <span className="font-medium">Nom:</span> {selectedList?.customerName || "N/A"}
                              </div>
                              <div>
                                <span className="font-medium">Email:</span> {selectedList?.customerEmail || "N/A"}
                              </div>
                              <div>
                                <span className="font-medium">Téléphone:</span> {selectedList?.customerPhone || "N/A"}
                              </div>
                              <div>
                                <span className="font-medium">Date:</span>{" "}
                                {selectedList && new Date(selectedList.createdAt).toLocaleDateString("fr-FR")}
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">Fichier</h3>
                            <div className="bg-gray-50 p-4 rounded space-y-2">
                              <div>
                                <span className="font-medium">Type:</span> {selectedList?.fileType}
                              </div>
                              <div>
                                <span className="font-medium">Statut:</span>{" "}
                                <Badge className={getStatusColor(selectedList?.status || "")}>
                                  {selectedList?.status}
                                </Badge>
                              </div>
                              {selectedList?.errorMessage && (
                                <div className="text-red-600 text-sm">
                                  <span className="font-medium">Erreur:</span> {selectedList.errorMessage}
                                </div>
                              )}
                            </div>
                          </div>

                          {selectedList?.extractedText && (
                            <div>
                              <h3 className="font-semibold mb-2">Texte extrait</h3>
                              <div className="bg-gray-50 p-4 rounded max-h-48 overflow-y-auto text-sm whitespace-pre-wrap">
                                {selectedList.extractedText}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <a
                              href={selectedList?.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1"
                            >
                              <Button className="w-full" variant="default">
                                <Download className="w-4 h-4 mr-2" />
                                Télécharger le fichier
                              </Button>
                            </a>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucune demande de devis pour le moment</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
