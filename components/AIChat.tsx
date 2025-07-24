import React, { useRef, useState, forwardRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Send, X, Sparkles } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/constants/colors";
import { AIMessage, QuickReply } from "@/types";
import { BottomSheet, BottomSheetRef } from "./BottomSheet";
import { useAIAssistant } from "@/store/ai-assistant-store";

interface AIChatProps {
  onClose: () => void;
  onQuickReplyPress?: (action: string) => void;
}

export const AIChat = ({ onClose, onQuickReplyPress }: AIChatProps) => {
  const { messages, quickReplies, isLoading, sendMessage } = useAIAssistant();
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (inputText.trim() === "") return;
    sendMessage(inputText);
    setInputText("");
  };

  const handleQuickReplyPress = (action: string) => {
    if (onQuickReplyPress) {
      onQuickReplyPress(action);
    }
  };

  const renderMessage = ({ item }: { item: AIMessage }) => {
    const isUser = item.role === "user";

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.assistantMessage,
        ]}
      >
        {!isUser && (
          <View style={styles.assistantIcon}>
            <Sparkles size={16} color={colors.accent.primary} />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userText : styles.assistantText,
            ]}
          >
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={colors.accent.gradient}
            style={styles.headerIcon}
          >
            <Sparkles size={20} color={colors.text.primary} />
          </LinearGradient>
          <View>
            <Text style={styles.title}>AI Assistant</Text>
            <Text style={styles.subtitle}>Here to help you</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={20} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.quickRepliesContainer}>
        <Text style={styles.quickRepliesTitle}>Quick Actions</Text>
        <View style={styles.quickRepliesGrid}>
          {quickReplies.map((reply: QuickReply) => (
            <TouchableOpacity
              key={reply.id}
              style={styles.quickReply}
              onPress={() => handleQuickReplyPress(reply.action)}
              activeOpacity={0.8}
            >
              <Text style={styles.quickReplyText}>{reply.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Ask me anything..."
            placeholderTextColor={colors.text.muted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.disabledButton,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
            activeOpacity={0.8}
          >
            {inputText.trim() ? (
              <LinearGradient
                colors={colors.accent.gradient}
                style={styles.sendButtonGradient}
              >
                <Send size={18} color={colors.text.primary} />
              </LinearGradient>
            ) : (
              <Send size={18} color={colors.text.muted} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

interface AIAssistantBottomSheetProps {
  onQuickReplyPress?: (action: string) => void;
}

export const AIAssistantBottomSheet = forwardRef<
  BottomSheetRef,
  AIAssistantBottomSheetProps
>(({ onQuickReplyPress }, ref) => {
  const handleClose = () => {
    if (ref && typeof ref === "object" && ref.current) {
      ref.current.close();
    }
  };

  return (
    <BottomSheet ref={ref} snapPoints={[0.7, 0.95]}>
      <AIChat onClose={handleClose} onQuickReplyPress={onQuickReplyPress} />
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: colors.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: colors.text.muted,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.elevated,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 20,
    gap: 16,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 4,
  },
  userMessage: {
    justifyContent: "flex-end",
  },
  assistantMessage: {
    justifyContent: "flex-start",
  },
  assistantIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background.elevated,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: colors.accent.primary,
    borderBottomRightRadius: 6,
    marginLeft: "auto",
  },
  assistantBubble: {
    backgroundColor: colors.background.elevated,
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: colors.text.primary,
  },
  assistantText: {
    color: colors.text.primary,
  },
  quickRepliesContainer: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  quickRepliesTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.text.primary,
    marginBottom: 12,
  },
  quickRepliesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickReply: {
    backgroundColor: colors.background.elevated,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  quickReplyText: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: "500" as const,
  },
  inputContainer: {
    paddingTop: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: colors.background.elevated,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
});
