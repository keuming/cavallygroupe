import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { products, categories } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";
// Note: db import not needed for this version

/**
 * AI Chat Router
 * Handles AI-powered customer support and assistance
 */
export const aiChatRouter = router({
  /**
   * Send a message to the AI chatbot
   * The AI will respond based on the conversation context
   */
  sendMessage: publicProcedure
    .input(
      z.object({
        conversationId: z.string().optional(),
        message: z.string().min(1).max(5000),
        context: z.object({
          userType: z.enum(["customer", "vendor", "admin"]).optional(),
          productId: z.number().optional(),
          orderId: z.number().optional(),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Charger le catalogue depuis la base
        const db2 = await getDb();
        let catalogueInfo = '';
        if (db2) {
          try {
            const produits = await db2.select().from(products).where(eq(products.isActive, true)).limit(20);
            const catsData = await db2.select().from(categories);
            const catMap: Record<number, string> = {};
            for (const cat of catsData) catMap[cat.id] = cat.name;
            catalogueInfo = produits.map((p: any) =>
              `- ${p.title} | Auteur: ${p.author || 'N/A'} | Prix: ${p.price} FCFA | Stock: ${p.stock} | Catégorie: ${catMap[p.categoryId] || 'N/A'}`
            ).join('\n');
          } catch(e) { catalogueInfo = 'Catalogue indisponible'; }
        }

        let systemPrompt = `Tu es l assistant IA de Cavally Livres, librairie en ligne a Abidjan, Cote d Ivoire.

BOUTIQUE:
- Site: www.cavallygroupe.com  
- Livraison rapide a Abidjan et partout en Cote d Ivoire
- Paiements: Wave, Orange Money, MTN MoMo, carte bancaire
- Categories: Manuels Scolaires, Litterature, Parascolaire, Fournitures Scolaires, Dictionnaires, Sciences, Arts

CATALOGUE DISPONIBLE:
${catalogueInfo}

REGLES:
- Reponds TOUJOURS en francais
- Sois chaleureux et precis
- Utilise le catalogue ci-dessus pour repondre aux questions sur les produits
- Ne fabrique pas de produits absents du catalogue
- Pour les commandes/livraisons, demande le numero de commande
- Propose des alternatives si un produit est indisponible

Utilisateur: ${input.context?.userType || 'client'}`;

        if (input.context?.productId) {
          systemPrompt += `\nProduit demande ID: ${input.context.productId}`;
        }
        if (input.context?.orderId) {
          systemPrompt += `\nCommande demandee ID: ${input.context.orderId}`;
        }

        // Get conversation history if provided
        const conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = [];
        
        if (input.conversationId) {
          // In a real app, you'd fetch previous messages from the database
          // For now, we'll just use the current message
        }

        // Add the current message
        conversationHistory.push({
          role: "user",
          content: input.message,
        });

        // Call the LLM
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            ...conversationHistory.map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
          ],
        });

        const aiResponse = response.choices[0]?.message?.content || "Je suis désolé, je n'ai pas pu traiter votre demande.";

        return {
          success: true,
          message: aiResponse,
          conversationId: input.conversationId || `conv_${Date.now()}`,
        };
      } catch (error: any) {
        console.error("AI Chat Error:", error?.message || error);
        return {
          success: false,
          message: error?.message || "Une erreur inconnue",
          conversationId: input.conversationId,
        };
      }
    }),

  /**
   * Get AI chat suggestions for common questions
   */
  getSuggestions: publicProcedure
    .input(
      z.object({
        userType: z.enum(["customer", "vendor", "admin"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const suggestions = {
        customer: [
          "Comment puis-je suivre ma commande?",
          "Quels sont les délais de livraison?",
          "Quels modes de paiement acceptez-vous?",
          "Comment puis-je retourner un produit?",
          "Avez-vous des livres sur un sujet spécifique?",
        ],
        vendor: [
          "Comment ajouter mes produits?",
          "Comment gérer mes commandes?",
          "Comment communiquer avec les clients?",
          "Quels sont les frais de commission?",
          "Comment retirer mes gains?",
        ],
        admin: [
          "Voir les statistiques de vente",
          "Gérer les utilisateurs",
          "Consulter les commandes",
          "Voir les rapports",
          "Gérer les catégories de produits",
        ],
      };

      return suggestions[input.userType || "customer"] || suggestions.customer;
    }),

  /**
   * Escalate to human support
   */
  escalateToHuman: publicProcedure
    .input(
      z.object({
        conversationId: z.string(),
        reason: z.string().min(1).max(500),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // In a real app, you would:
        // 1. Create a support ticket
        // 2. Notify the support team
        // 3. Assign to an available agent
        
        return {
          success: true,
          message: "Votre demande a été transmise à notre équipe de support. Un agent vous contactera bientôt.",
          ticketId: `TICKET_${Date.now()}`,
        };
      } catch (error) {
        console.error("Escalation Error:", error);
        return {
          success: false,
          message: "Une erreur s'est produite lors de l'escalade.",
        };
      }
    }),
});
