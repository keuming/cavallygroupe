import React, { useState } from "react";
import { Users, UserPlus, Star, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDarkMode } from "@/hooks/useDarkMode";

interface TutorProfile {
  id: string;
  name: string;
  subjects: string[];
  experience: number;
  rating: number;
  reviews: number;
  location: string;
  phone: string;
  email: string;
  bio: string;
  hourlyRate: number;
}

const MOCK_TUTORS: TutorProfile[] = [
  {
    id: "1",
    name: "Mme Koné Aminata",
    subjects: ["Mathématiques", "Français", "Sciences"],
    experience: 8,
    rating: 4.8,
    reviews: 24,
    location: "Abidjan, Plateau",
    phone: "+225 07 XX XX XX",
    email: "aminata.kone@email.com",
    bio: "Professeur expérimentée en mathématiques et français pour tous les niveaux",
    hourlyRate: 5000,
  },
  {
    id: "2",
    name: "M. Diallo Mamadou",
    subjects: ["Anglais", "Français"],
    experience: 5,
    rating: 4.6,
    reviews: 18,
    location: "Abidjan, Cocody",
    phone: "+225 07 XX XX XX",
    email: "mamadou.diallo@email.com",
    bio: "Spécialiste en langues étrangères pour collégiens et lycéens",
    hourlyRate: 4500,
  },
  {
    id: "3",
    name: "Mme Traoré Fatoumata",
    subjects: ["Sciences", "Mathématiques"],
    experience: 6,
    rating: 4.7,
    reviews: 21,
    location: "Abidjan, Yopougon",
    phone: "+225 07 XX XX XX",
    email: "fatoumata.traore@email.com",
    bio: "Professeur de sciences avec approche pédagogique innovante",
    hourlyRate: 5500,
  },
];

export function ScolarSupportPage() {
  const { isDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState<"tutors" | "register">("tutors");
  const [formData, setFormData] = useState({
    name: "",
    subjects: [] as string[],
    experience: 0,
    location: "",
    phone: "",
    email: "",
    bio: "",
    hourlyRate: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "experience" || name === "hourlyRate" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubjectToggle = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || formData.subjects.length === 0) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }
    alert("Inscription envoyée! Nous vous contacterons bientôt pour valider votre profil.");
    setFormData({
      name: "",
      subjects: [],
      experience: 0,
      location: "",
      phone: "",
      email: "",
      bio: "",
      hourlyRate: 0,
    });
  };

  const subjects = [
    "Mathématiques",
    "Français",
    "Anglais",
    "Sciences",
    "Physique",
    "Chimie",
    "Biologie",
    "Histoire",
    "Géographie",
    "Informatique",
  ];

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? "bg-gray-900" : "bg-yellow-50"}`}>
      <div className="max-w-6xl mx-auto">
        <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? "text-yellow-400" : "text-yellow-900"}`}>
          Soutien Scolaire
        </h1>
        <p className={`text-lg mb-8 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          Trouvez le professeur particulier idéal ou devenez agent de soutien scolaire
        </p>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => setActiveTab("tutors")}
            className={`flex items-center gap-2 ${
              activeTab === "tutors"
                ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                : isDarkMode
                ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            <Users className="w-4 h-4" />
            Voir les Agents ({MOCK_TUTORS.length})
          </Button>
          <Button
            onClick={() => setActiveTab("register")}
            className={`flex items-center gap-2 ${
              activeTab === "register"
                ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                : isDarkMode
                ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Devenir Agent
          </Button>
        </div>

        {/* Tab: Voir les agents */}
        {activeTab === "tutors" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_TUTORS.map((tutor) => (
              <Card
                key={tutor.id}
                className={`hover:shadow-lg transition-shadow ${
                  isDarkMode ? "bg-gray-800 border-gray-700" : "border-yellow-200"
                }`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className={isDarkMode ? "text-yellow-400" : "text-yellow-900"}>
                        {tutor.name}
                      </CardTitle>
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : ""}`}>
                          {tutor.rating} ({tutor.reviews} avis)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className={`text-sm font-medium mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Matières:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {tutor.subjects.map((subject) => (
                        <span
                          key={subject}
                          className={`px-3 py-1 rounded-full text-sm ${
                            isDarkMode
                              ? "bg-yellow-900/30 text-yellow-300"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {tutor.bio}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-yellow-600" />
                      <span className={isDarkMode ? "text-gray-300" : ""}>{tutor.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-yellow-600" />
                      <span className={isDarkMode ? "text-gray-300" : ""}>{tutor.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-yellow-600" />
                      <span className={isDarkMode ? "text-gray-300" : ""}>{tutor.email}</span>
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg ${isDarkMode ? "bg-yellow-900/20" : "bg-yellow-50"}`}>
                    <p className={`text-lg font-bold ${isDarkMode ? "text-yellow-400" : "text-yellow-700"}`}>
                      {tutor.hourlyRate.toLocaleString()} FCFA/h
                    </p>
                  </div>

                  <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
                    Contacter
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tab: Devenir agent */}
        {activeTab === "register" && (
          <Card className={`max-w-2xl mx-auto ${isDarkMode ? "bg-gray-800 border-gray-700" : ""}`}>
            <CardHeader>
              <CardTitle className={isDarkMode ? "text-yellow-400" : "text-yellow-900"}>
                Inscription - Devenir Agent de Soutien Scolaire
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : ""}`}>
                    Nom Complet *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Votre nom complet"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "border-yellow-200 bg-white"
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : ""}`}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="votre@email.com"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "border-yellow-200 bg-white"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : ""}`}>
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+225 07 XX XX XX"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "border-yellow-200 bg-white"
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : ""}`}>
                    Localisation
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Ville, Quartier"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "border-yellow-200 bg-white"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : ""}`}>
                    Années d'expérience
                  </label>
                  <input
                    type="number"
                    name="experience"
                    min="0"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="0"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "border-yellow-200 bg-white"
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : ""}`}>
                    Tarif horaire (FCFA)
                  </label>
                  <input
                    type="number"
                    name="hourlyRate"
                    min="0"
                    value={formData.hourlyRate}
                    onChange={handleInputChange}
                    placeholder="5000"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "border-yellow-200 bg-white"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-3 ${isDarkMode ? "text-gray-300" : ""}`}>
                  Matières *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {subjects.map((subject) => (
                    <label
                      key={subject}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${
                        formData.subjects.includes(subject)
                          ? isDarkMode
                            ? "bg-yellow-900/30 border border-yellow-600"
                            : "bg-yellow-100 border border-yellow-400"
                          : isDarkMode
                          ? "bg-gray-700 border border-gray-600"
                          : "bg-gray-100 border border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.subjects.includes(subject)}
                        onChange={() => handleSubjectToggle(subject)}
                        className="w-4 h-4"
                      />
                      <span className={`text-sm ${isDarkMode ? "text-gray-300" : ""}`}>{subject}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : ""}`}>
                  Présentation
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Décrivez votre expérience et votre approche pédagogique..."
                  rows={4}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "border-yellow-200 bg-white"
                  }`}
                />
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 text-lg"
              >
                S'inscrire comme Agent
              </Button>

              <p className={`text-sm text-center ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Votre profil sera validé par notre équipe avant d'être publié.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
