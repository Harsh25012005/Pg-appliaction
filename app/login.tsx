import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/constants/colors";
import { Button } from "@/components/Button";
import { useUser } from "@/store/user-store";


export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useUser();

  const handleLogin = async () => {
    // Validate email
    if (!email.trim()) {
      setLoginError("Please enter your email address");
      return;
    }
    
    // Validate password
    if (!password.trim()) {
      setLoginError("Please enter your password");
      return;
    }
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setLoginError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setLoginError(null);
    setLoginSuccess(null);

    try {
      // Proceed with login
      const userData = await login(email, password);

      // Only navigate if login was successful and userData exists
      if (userData) {
        setLoginSuccess(`Welcome back, ${userData.name}!`);
        // Small delay to show success message
        setTimeout(() => {
          router.replace("/(tabs)");
        }, 1000);
      } else {
        setLoginError("Login failed. Please try again.");
      }
    } catch (error: any) {
      setLoginError(error.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const navigateToSignup = () => {
    router.push("/signup");
  };

  // Clear error and success messages on input change
  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (loginError) setLoginError(null);
    if (loginSuccess) setLoginSuccess(null);
  };
  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (loginError) setLoginError(null);
    if (loginSuccess) setLoginSuccess(null);
  };

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
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, loginError && styles.inputError]}
                value={email}
                onChangeText={handleEmailChange}
                placeholder="Enter your email"
                placeholderTextColor={colors.text.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, loginError && styles.inputError]}
                value={password}
                onChangeText={handlePasswordChange}
                placeholder="Enter your password"
                placeholderTextColor={colors.text.muted}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {loginError && (
              <View style={styles.errorBox}>
                <View style={styles.errorIcon}>
                  <Text style={styles.errorIconText}>⚠️</Text>
                </View>
                <View style={styles.errorContent}>
                  <Text style={styles.errorTitle}>Login Failed</Text>
                  <Text style={styles.errorText}>{loginError}</Text>
                </View>
              </View>
            )}

            {loginSuccess && (
              <View style={styles.successBox}>
                <View style={styles.successIcon}>
                  <Text style={styles.successIconText}>✅</Text>
                </View>
                <View style={styles.successContent}>
                  <Text style={styles.successTitle}>Login Successful</Text>
                  <Text style={styles.successText}>{loginSuccess}</Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => router.push("/forgot-password")}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              fullWidth
              style={styles.loginButton}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={navigateToSignup}>
                <Text style={styles.signupLink}>Sign Up</Text>
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
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
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
  inputError: {
    borderColor: '#F87171',
    borderWidth: 2,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 32,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: colors.accent.primary,
    fontWeight: "500",
  },
  loginButton: {
    marginBottom: 32,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: colors.text.muted,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  signupLink: {
    fontSize: 14,
    color: colors.accent.primary,
    fontWeight: "600",
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#F87171',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  errorIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  errorIconText: {
    fontSize: 18,
  },
  errorContent: {
    flex: 1,
  },
  errorTitle: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },

  successBox: {
    backgroundColor: '#F0FDF4',
    borderColor: '#22C55E',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  successIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  successIconText: {
    fontSize: 18,
  },
  successContent: {
    flex: 1,
  },
  successTitle: {
    color: '#15803D',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  successText: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});
