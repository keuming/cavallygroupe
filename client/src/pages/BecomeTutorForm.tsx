import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export function BecomeTutorForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    subject: "",
    educationLevel: "",
    diploma: "",
    yearsOfExperience: 0,
    diplomaCopyUrl: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState("");

  const submitMutation = trpc.recruitment.submitTutorApplication.useMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "yearsOfExperience" ? parseInt(value) || 0 : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFormData((prev) => ({
        ...prev,
        diplomaCopyUrl: file.name,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email || !formData.subject || !formData.educationLevel || !formData.diploma) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitMutation.mutateAsync(formData);
      
      alert("Votre candidature de répétiteur a été soumise avec succès. Nous vous contacterons bientôt.");

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        subject: "",
        educationLevel: "",
        diploma: "",
        yearsOfExperience: 0,
        diplomaCopyUrl: "",
      });
      setFileName("");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Une erreur s'est produite");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Devenir Répétiteur</h1>
            <p className="text-gray-600">Rejoignez notre réseau de répétiteurs et aidez les élèves à réussir</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom et Prénoms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Votre prénom"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Votre nom"
                  required
                />
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+225 XX XX XX XX"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="votre.email@exemple.com"
                  required
                />
              </div>
            </div>

            {/* Matière et Niveau */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject">Matière Enseignée *</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Ex: Mathématiques, Français..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="educationLevel">Niveau d'Étude *</Label>
                <select
                  id="educationLevel"
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionnez un niveau</option>
                  <option value="Primaire">Primaire</option>
                  <option value="Collège">Collège</option>
                  <option value="Lycée">Lycée</option>
                  <option value="Université">Université</option>
                  <option value="Master">Master</option>
                  <option value="Doctorat">Doctorat</option>
                </select>
              </div>
            </div>

            {/* Diplôme et Expérience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="diploma">Dernier Diplôme *</Label>
                <Input
                  id="diploma"
                  name="diploma"
                  value={formData.diploma}
                  onChange={handleInputChange}
                  placeholder="Ex: Licence en Mathématiques"
                  required
                />
              </div>
              <div>
                <Label htmlFor="yearsOfExperience">Années d'Expérience *</Label>
                <Input
                  id="yearsOfExperience"
                  name="yearsOfExperience"
                  type="number"
                  min="0"
                  value={formData.yearsOfExperience}
                  onChange={handleInputChange}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            {/* Copie du Diplôme */}
            <div>
              <Label htmlFor="diplomaCopy">Télécharger Copie du Diplôme</Label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  id="diplomaCopy"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choisir un fichier
                </Button>
                {fileName && <span className="text-sm text-gray-600">{fileName}</span>}
              </div>
              <p className="text-xs text-gray-500 mt-1">Formats acceptés: PDF, JPG, PNG, DOC, DOCX</p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                style={{ backgroundColor: "#005f8a" } as React.CSSProperties}
              >
                {isSubmitting ? "Envoi en cours..." : "Soumettre la Candidature"}
              </Button>
            </div>
          </form>

          <p className="text-xs text-gray-500 text-center mt-6">
            * Champs obligatoires
          </p>
        </Card>
      </div>
    </div>
  );
}
