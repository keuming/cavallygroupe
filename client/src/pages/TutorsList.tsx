import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Phone, Mail, BookOpen, Award, Clock } from "lucide-react";

export function TutorsList() {
  const [, navigate] = useLocation();
  const { data: tutors, isLoading } = trpc.recruitment.getPublishedTutors.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <p className="text-gray-600">Chargement des répétiteurs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Nos Répétiteurs</h1>
          <p className="text-xl text-gray-600 mb-6">
            Trouvez un répétiteur qualifié pour vous aider dans vos études
          </p>
          <Button
            onClick={() => navigate("/petites-annonces/devenir-repetiteur")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            style={{ backgroundColor: "#005f8a" } as React.CSSProperties}
          >
            Devenir Répétiteur
          </Button>
        </div>

        {/* Tutors Grid */}
        {tutors && tutors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutors.map((tutor) => (
              <Card key={tutor.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {tutor.firstName} {tutor.lastName}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 text-blue-600" style={{ color: "#005f8a" }}>
                    <BookOpen className="w-4 h-4" />
                    <span className="font-semibold">{tutor.subject}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {/* Education Level */}
                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Niveau d'étude</p>
                      <p className="font-medium text-gray-900">{tutor.educationLevel}</p>
                    </div>
                  </div>

                  {/* Diploma */}
                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Diplôme</p>
                      <p className="font-medium text-gray-900">{tutor.diploma}</p>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Expérience</p>
                      <p className="font-medium text-gray-900">
                        {tutor.yearsOfExperience} {tutor.yearsOfExperience > 1 ? "ans" : "an"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="border-t pt-4 space-y-2">
                  <a
                    href={`tel:${tutor.phone}`}
                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{tutor.phone}</span>
                  </a>
                  <a
                    href={`mailto:${tutor.email}`}
                    className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="text-sm break-all">{tutor.email}</span>
                  </a>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-gray-600 mb-4">Aucun répétiteur disponible pour le moment</p>
            <Button
              onClick={() => navigate("/petites-annonces/devenir-repetiteur")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              style={{ backgroundColor: "#005f8a" } as React.CSSProperties}
            >
              Devenir Répétiteur
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
