import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonLoader, SkeletonTable } from "@/components/SkeletonLoader";
import { ErrorState, ErrorAlert, EmptyState } from "@/components/ErrorState";
import { LoadingOverlay, ProgressBar } from "@/components/LoadingOverlay";
import { AlertCircle, CheckCircle, RefreshCw, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface AnalysisData {
  id: string;
  fileName: string;
  status: "analyzing" | "completed" | "failed";
  progress: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    category: string;
  }>;
  error?: string;
  createdAt: Date;
}

export default function AnalysisPage() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [progress, setProgress] = useState(0);

  const analysisId = new URLSearchParams(window.location.search).get("id");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!analysisId) {
      setError("ID d'analyse manquant");
      setLoading(false);
      return;
    }

    fetchAnalysis();

    // Simuler la progression du chargement
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + Math.random() * 30;
      });
    }, 500);

    return () => clearInterval(progressInterval);
  }, [analysisId, isAuthenticated]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simuler un appel API
      const response = await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.1) {
            resolve({
              id: analysisId,
              fileName: "liste_fournitures.pdf",
              status: "completed",
              progress: 100,
              items: [
                {
                  id: "1",
                  name: "Cahier 96 pages",
                  quantity: 5,
                  price: 2500,
                  category: "Fournitures",
                },
                {
                  id: "2",
                  name: "Stylo bleu",
                  quantity: 10,
                  price: 500,
                  category: "Écriture",
                },
                {
                  id: "3",
                  name: "Livre de mathématiques",
                  quantity: 1,
                  price: 15000,
                  category: "Livres",
                },
              ],
              createdAt: new Date(),
            });
          } else {
            reject(new Error("Erreur lors de l'analyse du fichier"));
          }
        }, 2000);
      });

      setAnalysis(response as AnalysisData);
      setProgress(100);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Une erreur inconnue s'est produite";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    setRetrying(true);
    await fetchAnalysis();
    setRetrying(false);
  };

  const handleDownload = () => {
    // Implémenter le téléchargement
  };

  // État de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Analyse en cours</h1>
            <p className="text-muted-foreground">
              Veuillez patienter pendant que nous analysons votre fichier...
            </p>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <ProgressBar progress={progress} />

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full bg-primary animate-pulse" />
                  <p className="text-sm text-muted-foreground">
                    Extraction des données...
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full bg-muted" />
                  <p className="text-sm text-muted-foreground">
                    Validation des articles...
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full bg-muted" />
                  <p className="text-sm text-muted-foreground">
                    Génération du rapport...
                  </p>
                </div>
              </div>

              <SkeletonTable rows={3} />
            </CardContent>
          </Card>
        </div>

        <LoadingOverlay isLoading={retrying} message="Nouvelle tentative..." />
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <ErrorState
            title="Erreur lors de l'analyse"
            message={error}
            onRetry={handleRetry}
            onHome={() => navigate("/")}
            showDetails={true}
          />
        </div>
      </div>
    );
  }

  // État vide
  if (!analysis) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <EmptyState
            title="Analyse non trouvée"
            message="L'analyse demandée n'existe pas ou a expiré."
            action={{
              label: "Retour à l'accueil",
              onClick: () => navigate("/"),
            }}
          />
        </div>
      </div>
    );
  }

  // État de succès
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold">Analyse complétée</h1>
          </div>
          <p className="text-muted-foreground">
            {analysis.fileName} • {analysis.items.length} articles détectés
          </p>
        </div>

        {/* Résumé */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Articles</p>
              <p className="text-2xl font-bold">{analysis.items.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Montant total</p>
              <p className="text-2xl font-bold">
                {analysis.items
                  .reduce((sum, item) => sum + item.quantity * item.price, 0)
                  .toLocaleString("fr-FR")}
                 FCFA
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Catégories</p>
              <p className="text-2xl font-bold">
                {new Set(analysis.items.map((i) => i.category)).size}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tableau des articles */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Articles détectés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Article</th>
                    <th className="text-center py-3 px-4 font-semibold">Quantité</th>
                    <th className="text-right py-3 px-4 font-semibold">Prix unitaire</th>
                    <th className="text-right py-3 px-4 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.items.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.category}
                          </p>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">{item.quantity}</td>
                      <td className="text-right py-3 px-4">
                        {item.price.toLocaleString("fr-FR")} FCFA
                      </td>
                      <td className="text-right py-3 px-4 font-semibold">
                        {(item.quantity * item.price).toLocaleString("fr-FR")} FCFA
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={handleDownload} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Télécharger le rapport
          </Button>
          <Button onClick={() => navigate("/cart")} className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Ajouter au panier
          </Button>
        </div>
      </div>
    </div>
  );
}
