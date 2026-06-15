import React from "react";
import { CheckCircle2, Clock, Truck, Package } from "lucide-react";

type OrderStatus = "pending" | "confirmed" | "in_transit" | "delivered" | "cancelled";

interface OrderProgressBarProps {
  status: OrderStatus;
  createdAt: Date;
  confirmedAt?: Date;
  inTransitAt?: Date;
  deliveredAt?: Date;
  estimatedDeliveryDate?: Date;
}

const STATUS_STEPS = [
  {
    key: "pending",
    label: "En attente",
    description: "Commande créée et paiement effectué",
    icon: Clock,
    color: "bg-yellow-500",
  },
  {
    key: "confirmed",
    label: "Validée",
    description: "Commande confirmée par l'administrateur",
    icon: CheckCircle2,
    color: "bg-blue-500",
  },
  {
    key: "in_transit",
    label: "En transit",
    description: "Votre commande est en cours de livraison",
    icon: Truck,
    color: "bg-orange-500",
  },
  {
    key: "delivered",
    label: "Livrée",
    description: "Commande livrée avec succès",
    icon: Package,
    color: "bg-green-500",
  },
];

export function OrderProgressBar({
  status,
  createdAt,
  confirmedAt,
  inTransitAt,
  deliveredAt,
  estimatedDeliveryDate,
}: OrderProgressBarProps) {
  const currentStepIndex = STATUS_STEPS.findIndex((step) => step.key === status);
  const progressPercentage = ((currentStepIndex + 1) / STATUS_STEPS.length) * 100;

  const getStepDate = (stepKey: string): Date | undefined => {
    switch (stepKey) {
      case "pending":
        return createdAt;
      case "confirmed":
        return confirmedAt;
      case "in_transit":
        return inTransitAt;
      case "delivered":
        return deliveredAt;
      default:
        return undefined;
    }
  };

  const formatDate = (date: Date | undefined): string => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Titre */}
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Suivi de votre commande
      </h3>

      {/* Barre de progression */}
      <div className="mb-8">
        <div className="relative">
          {/* Ligne de progression */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 via-blue-500 to-green-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Étapes */}
          <div className="relative flex justify-between">
            {STATUS_STEPS.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const StepIcon = step.icon;

              return (
                <div key={step.key} className="flex flex-col items-center">
                  {/* Cercle de l'étape */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
                      isCompleted
                        ? `${step.color} text-white shadow-lg`
                        : "bg-gray-200 text-gray-400"
                    } ${isCurrent ? "ring-4 ring-offset-2 ring-blue-300" : ""}`}
                  >
                    <StepIcon size={20} />
                  </div>

                  {/* Étiquette */}
                  <div className="text-center">
                    <p
                      className={`text-sm font-semibold ${
                        isCompleted ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(getStepDate(step.key))}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Détails du statut actuel */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {STATUS_STEPS[currentStepIndex]?.icon &&
              React.createElement(STATUS_STEPS[currentStepIndex].icon, {
                size: 24,
                className: "text-blue-600",
              })}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">
              {STATUS_STEPS[currentStepIndex]?.label}
            </h4>
            <p className="text-sm text-gray-700 mt-1">
              {STATUS_STEPS[currentStepIndex]?.description}
            </p>

            {/* Date de livraison estimée */}
            {status === "in_transit" && estimatedDeliveryDate && (
              <p className="text-sm text-blue-600 font-medium mt-2">
                📅 Livraison estimée :{" "}
                {formatDate(estimatedDeliveryDate)}
              </p>
            )}

            {/* Message de succès */}
            {status === "delivered" && (
              <p className="text-sm text-green-600 font-medium mt-2">
                ✅ Votre commande a été livrée avec succès !
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Statut annulé */}
      {status === "cancelled" && (
        <div className="bg-red-50 rounded-lg p-4 border border-red-200 mt-4">
          <p className="text-sm text-red-700 font-medium">
            ⚠️ Cette commande a été annulée
          </p>
        </div>
      )}
    </div>
  );
}
