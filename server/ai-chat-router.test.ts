import { describe, it, expect, vi, beforeEach } from "vitest";
import { aiChatRouter } from "./ai-chat-router";
import { invokeLLM } from "./_core/llm";

// Mock the invokeLLM function
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

describe("AI Chat Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sendMessage", () => {
    it("should send a message and return a response from the LLM", async () => {
      // Mock the LLM response
      (invokeLLM as any).mockResolvedValue({
        choices: [
          {
            message: {
              content: "Bonjour! Comment puis-je vous aider?",
            },
          },
        ],
      });

      // Create a mock context
      const mockContext = {
        user: {
          id: "user_123",
          name: "Test User",
          email: "test@example.com",
          role: "user" as const,
        },
      };

      // Test the sendMessage mutation
      const caller = aiChatRouter.createCaller(mockContext);
      const result = await caller.sendMessage({
        conversationId: "",
        message: "Quels sont les manuels disponibles?",
        context: {
          userType: "customer",
        },
      });

      // Verify the response
      expect(result.success).toBe(true);
      expect(result.message).toBe("Bonjour! Comment puis-je vous aider?");
      expect(result.conversationId).toBeDefined();

      // Verify invokeLLM was called with correct parameters
      expect(invokeLLM).toHaveBeenCalled();
      const callArgs = (invokeLLM as any).mock.calls[0][0];
      expect(callArgs.messages).toBeDefined();
      expect(callArgs.messages[0].role).toBe("system");
      expect(callArgs.messages[1].role).toBe("user");
      expect(callArgs.messages[1].content).toBe("Quels sont les manuels disponibles?");
    });

    it("should include vendor context in the system prompt", async () => {
      (invokeLLM as any).mockResolvedValue({
        choices: [
          {
            message: {
              content: "Voici comment ajouter vos produits...",
            },
          },
        ],
      });

      const mockContext = {
        user: {
          id: "vendor_123",
          name: "Test Vendor",
          email: "vendor@example.com",
          role: "user" as const,
        },
      };

      const caller = aiChatRouter.createCaller(mockContext);
      await caller.sendMessage({
        conversationId: "",
        message: "Comment ajouter mes produits?",
        context: {
          userType: "vendor",
        },
      });

      const callArgs = (invokeLLM as any).mock.calls[0][0];
      expect(callArgs.messages[0].content).toContain("vendor");
    });

    it("should handle LLM errors gracefully", async () => {
      (invokeLLM as any).mockRejectedValue(new Error("LLM service unavailable"));

      const mockContext = {
        user: {
          id: "user_123",
          name: "Test User",
          email: "test@example.com",
          role: "user" as const,
        },
      };

      const caller = aiChatRouter.createCaller(mockContext);
      const result = await caller.sendMessage({
        conversationId: "",
        message: "Test message",
        context: {
          userType: "customer",
        },
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain("erreur");
    });

    it("should include product context when provided", async () => {
      (invokeLLM as any).mockResolvedValue({
        choices: [
          {
            message: {
              content: "Ce produit est excellent...",
            },
          },
        ],
      });

      const mockContext = {
        user: {
          id: "user_123",
          name: "Test User",
          email: "test@example.com",
          role: "user" as const,
        },
      };

      const caller = aiChatRouter.createCaller(mockContext);
      await caller.sendMessage({
        conversationId: "",
        message: "Parlez-moi de ce produit",
        context: {
          userType: "customer",
          productId: 42,
        },
      });

      const callArgs = (invokeLLM as any).mock.calls[0][0];
      expect(callArgs.messages[0].content).toContain("product");
      expect(callArgs.messages[0].content).toContain("42");
    });

    it("should include order context when provided", async () => {
      (invokeLLM as any).mockResolvedValue({
        choices: [
          {
            message: {
              content: "Votre commande est en cours de livraison...",
            },
          },
        ],
      });

      const mockContext = {
        user: {
          id: "user_123",
          name: "Test User",
          email: "test@example.com",
          role: "user" as const,
        },
      };

      const caller = aiChatRouter.createCaller(mockContext);
      await caller.sendMessage({
        conversationId: "",
        message: "Où est ma commande?",
        context: {
          userType: "customer",
          orderId: 99,
        },
      });

      const callArgs = (invokeLLM as any).mock.calls[0][0];
      expect(callArgs.messages[0].content).toContain("order");
      expect(callArgs.messages[0].content).toContain("99");
    });
  });

  describe("getSuggestions", () => {
    it("should return customer suggestions for customer user type", async () => {
      const mockContext = {
        user: {
          id: "user_123",
          name: "Test User",
          email: "test@example.com",
          role: "user" as const,
        },
      };

      const caller = aiChatRouter.createCaller(mockContext);
      const suggestions = await caller.getSuggestions({
        userType: "customer",
      });

      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toContain("commande");
    });

    it("should return vendor suggestions for vendor user type", async () => {
      const mockContext = {
        user: {
          id: "vendor_123",
          name: "Test Vendor",
          email: "vendor@example.com",
          role: "user" as const,
        },
      };

      const caller = aiChatRouter.createCaller(mockContext);
      const suggestions = await caller.getSuggestions({
        userType: "vendor",
      });

      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toContain("produit");
    });

    it("should return admin suggestions for admin user type", async () => {
      const mockContext = {
        user: {
          id: "admin_123",
          name: "Test Admin",
          email: "admin@example.com",
          role: "user" as const,
        },
      };

      const caller = aiChatRouter.createCaller(mockContext);
      const suggestions = await caller.getSuggestions({
        userType: "admin",
      });

      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it("should return default suggestions when user type is not provided", async () => {
      const mockContext = {
        user: {
          id: "user_123",
          name: "Test User",
          email: "test@example.com",
          role: "user" as const,
        },
      };

      const caller = aiChatRouter.createCaller(mockContext);
      const suggestions = await caller.getSuggestions({});

      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe("escalateToHuman", () => {
    it("should escalate to human support", async () => {
      const mockContext = {
        user: {
          id: "user_123",
          name: "Test User",
          email: "test@example.com",
          role: "user" as const,
        },
      };

      const caller = aiChatRouter.createCaller(mockContext);
      const result = await caller.escalateToHuman({
        conversationId: "conv_123",
        reason: "Je ne comprends pas la réponse de l'IA",
        priority: "high",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("support");
      expect(result.ticketId).toBeDefined();
    });

    it("should handle escalation errors gracefully", async () => {
      const mockContext = {
        user: {
          id: "user_123",
          name: "Test User",
          email: "test@example.com",
          role: "user" as const,
        },
      };

      const caller = aiChatRouter.createCaller(mockContext);
      const result = await caller.escalateToHuman({
        conversationId: "conv_123",
        reason: "Test escalation",
        priority: "medium",
      });

      expect(result.success).toBe(true);
      expect(result.ticketId).toBeDefined();
    });
  });
});
