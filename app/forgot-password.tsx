import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import { Button } from "@/components/Button";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  const handleSendResetEmail = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setEmailSent(true);
    }, 2000);
  };

  const handleBackToLogin = () => {
    router.back();
  };

  const handleResendEmail = () => {
    setEmailSent(false);
    handleSendResetEmail();
  };

  if (emailSent) {
    return (
      <LinearGradient
        colors={[colors.background.primary, colors.background.surface]}
        style={styles.container}
      >
        <StatusBar style="light" />
        <View style={styles.centeredContent}>
          <View style={styles.successIcon}>
            <Ionicons
              name="mail-outline"
              size={64}
              color={colors.accent.primary}
            />
          </View>

          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a password reset link to{"\n"}
            <Text style={styles.emailText}>{email}</Text>
          </Text>

          <Text style={styles.instructions}>
            Click the link in the email to reset your password. If you don't see
            the email, check your spam folder.
          </Text>

          <Button
            title="Resend Email"
            onPress={handleResendEmail}
            variant="outline"
            fullWidth
            style={styles.resendButton}
          />

          <TouchableOpacity
            onPress={handleBackToLogin}
            style={styles.backToLogin}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={colors.accent.primary}
            />
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.surface]}
      style={styles.container}
    >
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={handleBackToLogin}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.lockIcon}>
              <Ionicons
                name="lock-closed-outline"
                size={48}
                color={colors.accent.primary}
              />
            </View>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              No worries! Enter your email address and we'll send you a link to
              reset your password.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={colors.text.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
            </View>

            <Button
              title="Send Reset Link"
              onPress={handleSendResetEmail}
              loading={loading}
              fullWidth
              style={styles.sendButton}
            />

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Remember your password? </Text>
              <TouchableOpacity onPress={handleBackToLogin}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 32,
    padding: 8,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  lockIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
  },
  emailText: {
    color: colors.accent.primary,
    fontWeight: "600",
  },
  instructions: {
    fontSize: 14,
    color: colors.text.muted,
    textAlign: "center",
    lineHeight: 20,
    marginVertical: 24,
    paddingHorizontal: 16,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text.primary,
  },
  sendButton: {
    marginBottom: 32,
  },
  resendButton: {
    marginBottom: 24,
    width: "100%",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  loginLink: {
    fontSize: 14,
    color: colors.accent.primary,
    fontWeight: "600",
  },
  backToLogin: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backToLoginText: {
    fontSize: 16,
    color: colors.accent.primary,
    fontWeight: "500",
  },
});
