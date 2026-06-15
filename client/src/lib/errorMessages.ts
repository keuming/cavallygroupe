/**
 * Utilitaire pour gérer les messages d'erreur détaillés et contextualisés
 */

export type ErrorType =
  | "NETWORK_ERROR"
  | "TIMEOUT_ERROR"
  | "VALIDATION_ERROR"
  | "AUTHENTICATION_ERROR"
  | "AUTHORIZATION_ERROR"
  | "NOT_FOUND_ERROR"
  | "SERVER_ERROR"
  | "FILE_ERROR"
  | "ANALYSIS_ERROR"
  | "UNKNOWN_ERROR";

interface ErrorInfo {
  title: string;
  message: string;
  suggestion: string;
  retryable: boolean;
}

const errorMessages: Record<ErrorType, ErrorInfo> = {
  NETWORK_ERROR: {
    title: "Erreur de connexion",
    message: "Impossible de se connecter au serveur. Vérifiez votre connexion Internet.",
    suggestion: "Vérifiez votre connexion et réessayez.",
    retryable: true,
  },
  TIMEOUT_ERROR: {
    title: "Délai d'attente dépassé",
    message: "La requête a pris trop de temps. Veuillez réessayer.",
    suggestion: "Vérifiez votre connexion Internet et réessayez.",
    retryable: true,
  },
  VALIDATION_ERROR: {
    title: "Données invalides",
    message: "Les données fournies ne sont pas valides.",
    suggestion: "Vérifiez les informations et réessayez.",
    retryable: false,
  },
  AUTHENTICATION_ERROR: {
    title: "Authentification requise",
    message: "Vous devez être connecté pour effectuer cette action.",
    suggestion: "Veuillez vous connecter et réessayer.",
    retryable: false,
  },
  AUTHORIZATION_ERROR: {
    title: "Accès refusé",
    message: "Vous n'avez pas les permissions nécessaires pour accéder à cette ressource.",
    suggestion: "Contactez un administrateur si vous pensez qu'il s'agit d'une erreur.",
    retryable: false,
  },
  NOT_FOUND_ERROR: {
    title: "Ressource non trouvée",
    message: "La ressource demandée n'existe pas ou a été supprimée.",
    suggestion: "Vérifiez l'URL et réessayez.",
    retryable: false,
  },
  SERVER_ERROR: {
    title: "Erreur du serveur",
    message: "Une erreur s'est produite sur le serveur. Veuillez réessayer plus tard.",
    suggestion: "Réessayez dans quelques minutes.",
    retryable: true,
  },
  FILE_ERROR: {
    title: "Erreur lors du traitement du fichier",
    message: "Le fichier n'a pas pu être traité. Assurez-vous que le format est correct.",
    suggestion: "Vérifiez le format du fichier et réessayez.",
    retryable: true,
  },
  ANALYSIS_ERROR: {
    title: "Erreur lors de l'analyse",
    message: "L'analyse du fichier a échoué. Veuillez réessayer.",
    suggestion: "Vérifiez que le fichier n'est pas corrompu et réessayez.",
    retryable: true,
  },
  UNKNOWN_ERROR: {
    title: "Une erreur inconnue s'est produite",
    message: "Une erreur inattendue s'est produite. Veuillez réessayer.",
    suggestion: "Si le problème persiste, contactez le support.",
    retryable: true,
  },
};

/**
 * Déterminer le type d'erreur basé sur l'objet Error
 */
export function getErrorType(error: Error | string): ErrorType {
  if (typeof error === "string") {
    if (error.includes("network")) return "NETWORK_ERROR";
    if (error.includes("timeout")) return "TIMEOUT_ERROR";
    if (error.includes("validation")) return "VALIDATION_ERROR";
    if (error.includes("authentication")) return "AUTHENTICATION_ERROR";
    if (error.includes("authorization")) return "AUTHORIZATION_ERROR";
    if (error.includes("not found")) return "NOT_FOUND_ERROR";
    if (error.includes("file")) return "FILE_ERROR";
    if (error.includes("analysis")) return "ANALYSIS_ERROR";
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("network")) return "NETWORK_ERROR";
    if (message.includes("timeout")) return "TIMEOUT_ERROR";
    if (message.includes("validation")) return "VALIDATION_ERROR";
    if (message.includes("401") || message.includes("authentication"))
      return "AUTHENTICATION_ERROR";
    if (message.includes("403") || message.includes("authorization"))
      return "AUTHORIZATION_ERROR";
    if (message.includes("404") || message.includes("not found"))
      return "NOT_FOUND_ERROR";
    if (message.includes("5")) return "SERVER_ERROR";
    if (message.includes("file")) return "FILE_ERROR";
    if (message.includes("analysis")) return "ANALYSIS_ERROR";
  }

  return "UNKNOWN_ERROR";
}

/**
 * Obtenir les informations d'erreur complètes
 */
export function getErrorInfo(error: Error | string): ErrorInfo {
  const errorType = getErrorType(error);
  return errorMessages[errorType];
}

/**
 * Formater un message d'erreur avec contexte
 */
export function formatErrorMessage(
  error: Error | string,
  context?: string
): string {
  const errorInfo = getErrorInfo(error);
  const details = typeof error === "string" ? error : error.message;

  let message = errorInfo.message;
  if (context) {
    message += ` (${context})`;
  }
  if (details && details !== errorInfo.message) {
    message += ` - ${details}`;
  }

  return message;
}

/**
 * Vérifier si une erreur est réessayable
 */
export function isErrorRetryable(error: Error | string): boolean {
  return getErrorInfo(error).retryable;
}

/**
 * Classe d'erreur personnalisée avec type
 */
export class AppError extends Error {
  constructor(
    public type: ErrorType,
    message: string,
    public context?: string
  ) {
    super(message);
    this.name = "AppError";
  }

  getInfo(): ErrorInfo {
    return errorMessages[this.type];
  }

  isRetryable(): boolean {
    return this.getInfo().retryable;
  }
}
