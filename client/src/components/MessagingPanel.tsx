import React, { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface MessagingPanelProps {
  conversationId?: number;
  vendorId?: number;
  orderId?: number;
}

export function MessagingPanel({ conversationId, vendorId, orderId }: MessagingPanelProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(
    conversationId || null
  );
  const [messageContent, setMessageContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get or create conversation
  const createConversationMutation = trpc.messaging.getOrCreateConversation.useMutation();

  // Get conversations list
  const { data: conversations, isLoading: conversationsLoading } =
    trpc.messaging.getConversations.useQuery();

  // Get messages for selected conversation
  const { data: messages, isLoading: messagesLoading, refetch: refetchMessages } =
    trpc.messaging.getMessages.useQuery(
      { conversationId: selectedConversationId || 0, limit: 50 },
      { enabled: !!selectedConversationId }
    );

  // Send message mutation
  const sendMessageMutation = trpc.messaging.sendMessage.useMutation({
    onSuccess: () => {
      setMessageContent("");
      refetchMessages();
    },
  });

  // Mark as read mutation
  const markAsReadMutation = trpc.messaging.markAsRead.useMutation();

  // Get unread count
  const { data: unreadCount } = trpc.messaging.getUnreadCount.useQuery();

  // Handle starting a conversation with a vendor
  const handleStartConversation = async () => {
    if (!vendorId) return;

    try {
      setIsLoading(true);
      const conversation = await createConversationMutation.mutateAsync({
        vendorId,
        orderId,
      });
      setSelectedConversationId(Number(conversation.id));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!messageContent.trim() || !selectedConversationId) return;

    try {
      setIsLoading(true);
      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversationId,
        content: messageContent,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark as read when viewing conversation
  useEffect(() => {
    if (selectedConversationId) {
      markAsReadMutation.mutate({ conversationId: selectedConversationId });
    }
  }, [selectedConversationId]);

  // If no conversation is selected and we have a vendor ID, show start conversation
  if (!selectedConversationId && vendorId) {
    return (
      <Card className="p-6 text-center">
        <MessageSquare className="mx-auto mb-4 h-12 w-12 text-orange-500" />
        <h3 className="mb-2 text-lg font-semibold">Commencer une conversation</h3>
        <p className="mb-4 text-sm text-gray-600">
          Contactez le vendeur pour discuter de cette commande
        </p>
        <Button
          onClick={handleStartConversation}
          disabled={isLoading}
          className="bg-orange-500 hover:bg-orange-600"
        >
          {isLoading ? "Création..." : "Commencer la conversation"}
        </Button>
      </Card>
    );
  }

  // If no conversation selected, show list of conversations
  if (!selectedConversationId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Conversations</h3>
          {unreadCount && unreadCount > 0 && (
            <span className="rounded-full bg-orange-500 px-3 py-1 text-sm text-white">
              {unreadCount} non lus
            </span>
          )}
        </div>

        {conversationsLoading ? (
          <div className="text-center text-gray-500">Chargement...</div>
        ) : !conversations || conversations.length === 0 ? (
          <Card className="p-6 text-center">
            <MessageSquare className="mx-auto mb-2 h-8 w-8 text-gray-400" />
            <p className="text-gray-600">Aucune conversation</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Card
                key={conv.id}
                className="cursor-pointer p-4 hover:bg-gray-50"
                onClick={() => setSelectedConversationId(conv.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {conv.clientId === conv.clientId ? "Vendeur" : "Client"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(conv.lastMessageAt), "PPp", { locale: fr })}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Show conversation view
  return (
    <div className="flex h-full flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <h3 className="text-lg font-semibold">Conversation</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedConversationId(null)}
        >
          Retour
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea
        ref={scrollRef}
        className="flex-1 rounded-lg border bg-gray-50 p-4"
      >
        {messagesLoading ? (
          <div className="text-center text-gray-500">Chargement des messages...</div>
        ) : !messages || messages.length === 0 ? (
          <div className="text-center text-gray-500">Aucun message</div>
        ) : (
          <div className="space-y-4">
            {[...messages].reverse().map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.senderId === msg.senderId ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs rounded-lg px-4 py-2 ${
                    msg.senderId === msg.senderId
                      ? "bg-orange-500 text-white"
                      : "bg-white text-gray-900"
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className="mt-1 text-xs opacity-70">
                    {format(new Date(msg.createdAt), "HH:mm", { locale: fr })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Message input */}
      <div className="flex gap-2">
        <Input
          placeholder="Écrivez votre message..."
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={isLoading}
        />
        <Button
          onClick={handleSendMessage}
          disabled={isLoading || !messageContent.trim()}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
