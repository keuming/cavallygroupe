import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { 
  Upload, FileText, Image, File, CheckCircle, 
  ArrowLeft, Phone, Mail, User, MessageSquare,
  Loader2, X, BookOpen
} from "lucide-react";

const ACCEPTED_TYPES = {
  'application/pdf': { label: 'PDF', icon: '📄', color: '#dc2626' },
  'application/msword': { label: 'Word', icon: '📝', color: '#2563eb' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { label: 'Word', icon: '📝', color: '#2563eb' },
  'image/jpeg': { label: 'Image JPG', icon: '🖼️', color: '#059669' },
  'image/png': { label: 'Image PNG', icon: '🖼️', color: '#059669' },
  'image/webp': { label: 'Image', icon: '🖼️', color: '#059669' },
};

export default function SupplyListUpload() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"upload" | "info" | "success">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const createMutation = trpc.supplyLists.create.useMutation();

  const handleFile = (f: File) => {
    if (!ACCEPTED_TYPES[f.type as keyof typeof ACCEPTED_TYPES]) {
      setError("Format non supporté. Utilisez PDF, Word ou Image (JPG/PNG).");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("Fichier trop volumineux. Maximum 10MB.");
      return;
    }
    setError("");
    setFile(f);
    
    // Convertir en base64
    const reader = new FileReader();
    reader.onload = (e) => setFileData(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone) { setError("Nom et téléphone requis"); return; }
    setError("");
    try {
      await createMutation.mutateAsync({
        fileName: file?.name || "liste-manuelle.txt",
        fileType: file?.type?.includes("pdf") ? "pdf" : file?.type?.includes("image") ? "image" : file?.type?.includes("word") || file?.type?.includes("document") ? "word" : "document",
        fileData: fileData,
        customerName: form.name,
        customerEmail: form.email || undefined,
        customerPhone: form.phone,
        notes: form.notes || undefined,
      });
      setStep("success");
    } catch(e: any) {
      setError(e.message || "Erreur lors de l'envoi");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-[#005f8a] hover:text-[#004a6b]">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 bg-[#005f8a] rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-[#005f8a]">Commande sur liste</h1>
            <p className="text-xs text-gray-500">Envoyez votre liste, nous préparons votre devis</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-xl">

        {/* Étape 1: Upload */}
        {step === "upload" && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Uploadez votre liste</h2>
              <p className="text-gray-500">PDF, Word ou photo de votre liste de livres</p>
            </div>

            {/* Zone de drop */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                dragOver ? "border-[#005f8a] bg-blue-50 scale-[1.02]" : 
                file ? "border-green-400 bg-green-50" : 
                "border-gray-300 hover:border-[#005f8a] hover:bg-blue-50"
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
              />
              
              {file ? (
                <div>
                  <div className="text-5xl mb-3">
                    {ACCEPTED_TYPES[file.type as keyof typeof ACCEPTED_TYPES]?.icon || "📄"}
                  </div>
                  <p className="font-semibold text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{(file.size / 1024).toFixed(0)} KB</p>
                  <button
                    onClick={e => { e.stopPropagation(); setFile(null); setFileData(""); }}
                    className="mt-3 text-red-500 text-sm flex items-center gap-1 mx-auto"
                  >
                    <X className="w-4 h-4" /> Changer de fichier
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="font-semibold text-gray-700 mb-1">Glissez votre fichier ici</p>
                  <p className="text-sm text-gray-500 mb-4">ou cliquez pour sélectionner</p>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {["📄 PDF", "📝 Word", "🖼️ Image"].map(t => (
                      <span key={t} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}

            {/* Comment ça marche */}
            <div className="mt-8 bg-blue-50 rounded-2xl p-5">
              <h3 className="font-bold text-[#005f8a] mb-3">Comment ça marche ?</h3>
              <div className="space-y-3">
                {[
                  { n: "1", t: "Uploadez votre liste", d: "PDF, Word, photo ou liste manuscrite" },
                  { n: "2", t: "On traite votre demande", d: "Notre équipe prépare votre devis sous 24h" },
                  { n: "3", t: "Vous recevez votre devis", d: "Par SMS/Email avec le total à payer" },
                  { n: "4", t: "Livraison ou retrait", d: "Nous vous livrons ou vous venez retirer" },
                ].map(s => (
                  <div key={s.n} className="flex gap-3">
                    <div className="w-7 h-7 bg-[#005f8a] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{s.n}</div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{s.t}</p>
                      <p className="text-xs text-gray-500">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => { if (!file) { setError("Veuillez sélectionner un fichier"); return; } setError(""); setStep("info"); }}
              className="w-full mt-6 py-4 bg-[#005f8a] text-white rounded-xl font-bold text-base hover:bg-[#004a6b] transition-colors shadow-lg"
            >
              Continuer →
            </button>
          </div>
        )}

        {/* Étape 2: Coordonnées */}
        {step === "info" && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Vos coordonnées</h2>
              <p className="text-gray-500">Pour vous envoyer le devis et vous contacter</p>
            </div>

            {file && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-6 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">{file.name}</p>
                  <p className="text-xs text-green-600">{(file.size / 1024).toFixed(0)} KB — prêt à envoyer</p>
                </div>
              </div>
            )}

            {error && <div className="bg-red-50 text-red-700 p-3 rounded-xl mb-4 text-sm">{error}</div>}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Nom complet *</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    value={form.name}
                    onChange={e => setForm(p => ({...p, name: e.target.value}))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#005f8a] outline-none"
                    placeholder="Votre nom complet"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Téléphone * <span className="text-xs text-gray-400">(pour recevoir le devis par SMS)</span></label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    value={form.phone}
                    onChange={e => setForm(p => ({...p, phone: e.target.value}))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#005f8a] outline-none"
                    placeholder="07 00 00 00 00"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Email <span className="text-xs text-gray-400">(optionnel)</span></label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    value={form.email}
                    onChange={e => setForm(p => ({...p, email: e.target.value}))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#005f8a] outline-none"
                    placeholder="votre@email.com"
                    type="email"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Notes <span className="text-xs text-gray-400">(classe, école, précisions...)</span></label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <textarea
                    value={form.notes}
                    onChange={e => setForm(p => ({...p, notes: e.target.value}))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#005f8a] outline-none resize-none h-24"
                    placeholder="Ex: CE2 école primaire Saint-Jean, j'ai besoin des manuels pour la rentrée..."
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep("upload")} className="px-4 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleSubmit}
                disabled={createMutation.isPending}
                className="flex-1 py-3 bg-[#005f8a] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#004a6b] disabled:opacity-60"
              >
                {createMutation.isPending ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Envoi en cours...</>
                ) : (
                  <><Upload className="w-5 h-5" /> Envoyer ma liste</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Étape 3: Succès */}
        {step === "success" && (
          <div className="text-center py-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-14 h-14 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Demande envoyée !</h2>
            <p className="text-gray-500 mb-6">Votre liste a bien été reçue par notre équipe</p>

            <div className="bg-blue-50 rounded-2xl p-5 text-left mb-8">
              <h3 className="font-bold text-[#005f8a] mb-3">Prochaines étapes</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>📱 Vous recevrez un SMS de confirmation sur <strong>{form.phone}</strong></p>
                {form.email && <p>📧 Un email de suivi sera envoyé à <strong>{form.email}</strong></p>}
                <p>⏱️ Notre équipe traitera votre demande <strong>sous 24h</strong></p>
                <p>💰 Vous recevrez votre <strong>devis personnalisé</strong> avec les prix</p>
                <p>🚚 Une fois validé, nous organisons la <strong>livraison ou le retrait</strong></p>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
              <p className="text-sm font-semibold text-orange-800 mb-2">⚠️ Vous n'avez pas reçu votre devis dans les 24h ?</p>
              <p className="text-sm text-orange-700 mb-2">Veuillez joindre notre service client :</p>
              <div className="space-y-1">
                <a href="tel:+2250173924646" className="flex items-center gap-2 text-sm font-bold text-orange-800 hover:text-orange-600">
                  📞 +225 01 73 92 46 46
                </a>
                <a href="tel:+2250501956464" className="flex items-center gap-2 text-sm font-bold text-orange-800 hover:text-orange-600">
                  📞 +225 05 01 95 64 64
                </a>
                <a href="mailto:service.client@cavally-livres.com" className="flex items-center gap-2 text-sm text-orange-700 hover:text-orange-600">
                  📧 service.client@cavally-livres.com
                </a>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/")}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
              >
                Retour à l'accueil
              </button>
              <button
                onClick={() => { setStep("upload"); setFile(null); setFileData(""); setForm({name:"",phone:"",email:"",notes:""}); }}
                className="flex-1 py-3 bg-[#005f8a] text-white rounded-xl font-bold hover:bg-[#004a6b]"
              >
                Nouvelle liste
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
