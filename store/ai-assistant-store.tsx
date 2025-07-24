import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { AIMessage, QuickReply } from "@/types";

// Mock quick replies
const defaultQuickReplies: QuickReply[] = [
  { id: "1", text: "View today's menu", action: "NAVIGATE_TO_MEALS" },
  { id: "2", text: "Raise a complaint", action: "NAVIGATE_TO_COMPLAINTS" },
  { id: "3", text: "Check rent status", action: "NAVIGATE_TO_RENT" },
  { id: "4", text: "Show announcements", action: "NAVIGATE_TO_ANNOUNCEMENTS" },
];

// Mock AI responses based on user input
const getMockResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("rent") || lowerMessage.includes("payment")) {
    return "Your rent of ₹3000 is due on the 5th of this month. You can pay it through the Rent Management section. Would you like me to take you there?";
  } else if (
    lowerMessage.includes("menu") ||
    lowerMessage.includes("food") ||
    lowerMessage.includes("meal")
  ) {
    return "Today's menu includes:\n- Breakfast: Poha & Tea\n- Lunch: Rice, Dal & Sabzi\n- Dinner: Roti & Mixed Veg\n\nYou can opt-in or out from the Meal Management section.";
  } else if (
    lowerMessage.includes("complaint") ||
    lowerMessage.includes("issue") ||
    lowerMessage.includes("problem")
  ) {
    return "You can raise a new complaint from the Complaint Box section. Currently, you have 1 pending complaint. Would you like to check its status?";
  } else if (
    lowerMessage.includes("wifi") ||
    lowerMessage.includes("internet")
  ) {
    return 'The WiFi password is "PG2025Secure". If you\'re experiencing connectivity issues, please raise a complaint.';
  } else if (
    lowerMessage.includes("announcement") ||
    lowerMessage.includes("notice")
  ) {
    return "There are 4 announcements, including 1 emergency notice about water supply disruption tomorrow. Check the Announcements page for details.";
  } else {
    return "I'm your PG assistant. I can help you with information about rent, meals, complaints, and announcements. What would you like to know?";
  }
};

// Define the context type
interface AIAssistantContextType {
  messages: AIMessage[];
  quickReplies: QuickReply[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => Promise<void>;
}

// Create the context with explicit typing
const AIAssistantContext = createContext<AIAssistantContextType | undefined>(
  undefined
);

// Provider component
export const AIAssistantProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [quickReplies] = useState<QuickReply[]>(defaultQuickReplies);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const data = await AsyncStorage.getItem("aiMessages");
        if (data) {
          setMessages(JSON.parse(data));
        } else {
          // Initial welcome message
          const initialMessage: AIMessage = {
            id: "1",
            role: "assistant",
            content: "Hello! I'm your PG assistant. How can I help you today?",
            timestamp: new Date().toISOString(),
          };
          setMessages([initialMessage]);
          await AsyncStorage.setItem(
            "aiMessages",
            JSON.stringify([initialMessage])
          );
        }
      } catch (error) {
        console.error("Failed to load AI messages:", error);
      }
    };

    loadMessages();
  }, []);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    await AsyncStorage.setItem("aiMessages", JSON.stringify(updatedMessages));

    // Simulate AI response
    setIsLoading(true);

    setTimeout(async () => {
      const responseContent = getMockResponse(content);
      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
        timestamp: new Date().toISOString(),
      };

      const messagesWithResponse = [...updatedMessages, assistantMessage];
      setMessages(messagesWithResponse);
      await AsyncStorage.setItem(
        "aiMessages",
        JSON.stringify(messagesWithResponse)
      );
      setIsLoading(false);
    }, 1000);
  };

  const clearMessages = async () => {
    // Keep only the initial welcome message
    const initialMessage: AIMessage = {
      id: Date.now().toString(),
      role: "assistant",
      content: "Hello! I'm your PG assistant. How can I help you today?",
      timestamp: new Date().toISOString(),
    };

    setMessages([initialMessage]);
    await AsyncStorage.setItem("aiMessages", JSON.stringify([initialMessage]));
  };

  const value: AIAssistantContextType = {
    messages,
    quickReplies,
    isLoading,
    sendMessage,
    clearMessages,
  };

  return (
    <AIAssistantContext.Provider value={value}>
      {children}
    </AIAssistantContext.Provider>
  );
};

// Custom hook to use the context
export const useAIAssistant = (): AIAssistantContextType => {
  const context = useContext(AIAssistantContext);
  if (context === undefined) {
    throw new Error(
      "useAIAssistant must be used within an AIAssistantProvider"
    );
  }
  return context;
};
