import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function SupplyListUpload() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [manualText, setManualText] = useState("");
  const [uploadMode, setUploadMode] = useState<"file" | "manual">("file");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-[#005f8a]">Connexion requise</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Vous devez etre connecte pour uploader une liste de fournitures.
            </p>
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="w-full bg-[#005f8a] hover:bg-[#005f8a]"
            >
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (uploadMode === "file" && !file) {
      setMessage({ type: "error", text: "Veuillez selectionner un fichier" });
      return;
    }

    if (uploadMode === "manual" && !manualText.trim()) {
      setMessage({ type: "error", text: "Veuillez entrer la liste de fournitures" });
      return;
    }

    setUploading(true);

    try {
      if (uploadMode === "file" && file) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");

        const data = await response.json();
        setMessage({
          type: "success",
          text: `Fichier ${file.name} uploade avec succes! Redirection...`,
        });

        setTimeout(() => {
          navigate(`/supply-list/${data.supplyListId}`);
        }, 2000);
      } else {
        setMessage({
          type: "success",
          text: "Liste traitee! Redirection...",
        });

        setTimeout(() => {
          navigate("/supply-list/new?text=" + encodeURIComponent(manualText));
        }, 2000);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Erreur lors du traitement de la liste",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Telecharger votre liste de fournitures
          </h1>
          <p className="text-gray-600 mb-8">
            Uploadez votre liste de fournitures scolaires et recevez une facture
            automatique avec tous les articles disponibles dans notre catalogue.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <Button
              variant={uploadMode === "file" ? "default" : "outline"}
              onClick={() => setUploadMode("file")}
              className={uploadMode === "file" ? "bg-[#005f8a] hover:bg-[#005f8a]" : ""}
            >
              <Upload className="w-4 h-4 mr-2" />
              Fichier
            </Button>
            <Button
              variant={uploadMode === "manual" ? "default" : "outline"}
              onClick={() => setUploadMode("manual")}
              className={uploadMode === "manual" ? "bg-[#005f8a] hover:bg-[#005f8a]" : ""}
            >
              <FileText className="w-4 h-4 mr-2" />
              Texte manuel
            </Button>
          </div>

          <Card className="mb-8 border-2 border-dashed border-blue-300">
            <CardContent className="p-8">
              {uploadMode === "file" ? (
                <div className="text-center">
                  <Upload className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Glissez-deposez votre fichier ici
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Formats acceptes: PDF, Images (JPG, PNG), Documents (Word, Excel)
                  </p>
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                    className="hidden"
                    id="file-input"
                  />
                  <Button
                    onClick={() => document.getElementById("file-input")?.click()}
                    variant="outline"
                    className="border-blue-500 text-[#005f8a] hover:bg-[#f0f7fb]"
                  >
                    Selectionner un fichier
                  </Button>
                  {file && (
                    <p className="mt-4 text-sm text-green-600 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {file.name}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Entrez votre liste de fournitures
                  </h3>
                  <Textarea
                    placeholder="Exemple:
- Mathematiques 3eme (1)
- Francais 4eme (1)
- Sciences Naturelles (1)
- Cahiers (5)
..."
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    className="min-h-64 mb-4"
                  />
                  <p className="text-sm text-gray-500">
                    Listez les articles un par ligne. Vous pouvez ajouter la quantite entre parentheses.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {message && (
            <Card
              className={`mb-8 ${
                message.type === "success"
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <CardContent className="p-4 flex items-start gap-3">
                {message.type === "success" ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <p
                  className={
                    message.type === "success" ? "text-green-800" : "text-red-800"
                  }
                >
                  {message.text}
                </p>
              </CardContent>
            </Card>
          )}

          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-[#005f8a] hover:bg-[#005f8a] text-white py-6 text-lg"
          >
            {uploading ? "Traitement en cours..." : "Telecharger et generer la facture"}
          </Button>

          <Card className="mt-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-[#005f8a]">Comment ca fonctionne?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700">
              <p>
                1. <strong>Uploadez votre liste</strong> - Fichier ou texte manuel
              </p>
              <p>
                2. <strong>Nous traitons la liste</strong> - Extraction automatique avec OCR
              </p>
              <p>
                3. <strong>Matching avec le catalogue</strong> - Nous trouvons les articles disponibles
              </p>
              <p>
                4. <strong>Facture generee</strong> - Revoyez et payez votre facture
              </p>
              <p>
                5. <strong>Livraison rapide</strong> - Nous livrons a votre adresse
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
