import { useAuth } from "@/libs/authContext";
import { Redirect } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Text, TextInput, Snackbar } from "react-native-paper";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  // Error states
  const [error, setError] = useState<string>("");
  const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>("");

  const { signUp, logIn , isAuthenticated , isLoading } = useAuth();
  if (isAuthenticated && !isLoading) {
    return <Redirect href="/(tabs)" />;
  }
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setError("");

    // Input validation
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      setSnackbarVisible(true);
      
      if (!email.trim()) setEmailError("Email is required");
      if (!password.trim()) setPasswordError("Password is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        await logIn(email, password);
       
      } else {
        await signUp(email, password);
        // Clear form on success
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        
        setError("Account created successfully!");
        setSnackbarVisible(true);
      }
    } catch (error: any) {
      // Handle different types of error messages
      const errorMessage = error?.message || error || "An error occurred";
      setError(errorMessage);
      setSnackbarVisible(true);
      
      // You can also set field-specific errors based on error type
      if (errorMessage.toLowerCase().includes("email")) {
        setEmailError(errorMessage);
      } else if (errorMessage.toLowerCase().includes("password")) {
        setPasswordError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setError("");
    setIsLogin((prev) => !prev);
  };

  const dismissSnackbar = () => {
    setSnackbarVisible(false);
    // Clear error after dismissing snackbar
    setTimeout(() => setError(""), 300);
  };

  return (
    <>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.innerContainer}>
            <Text style={styles.title} variant="headlineMedium">
              {isLogin ? "Welcome back" : "Create Account"}
            </Text>

            <TextInput
              style={styles.input}
              label="Email"
              placeholder="Enter your email"
              keyboardType="email-address"
              mode="outlined"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError("");
              }}
              autoCapitalize="none"
              autoComplete="email"
              disabled={isSubmitting}
              error={!!emailError}
            />

            <TextInput
              style={styles.input}
              label="Password"
              placeholder="Enter your password"
              mode="outlined"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError("");
              }}
              disabled={isSubmitting}
              autoComplete={isLogin ? "current-password" : "new-password"}
              error={!!passwordError}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                />
              }
            />

            {!isLogin && (
              <TextInput
                style={styles.input}
                label="Confirm Password"
                placeholder="Confirm your password"
                mode="outlined"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setConfirmPasswordError("");
                }}
                disabled={isSubmitting}
                autoComplete="new-password"
                error={!!confirmPasswordError}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? "eye-off" : "eye"}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isSubmitting}
                  />
                }
              />
            )}

            <View style={styles.buttonContainer}>
              {isLogin ? (
                <Button
                  style={styles.button}
                  mode="contained"
                  onPress={handleSubmit}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  contentStyle={styles.buttonContent}
                >
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
              ) : (
                <Button
                  style={styles.button}
                  mode="contained"
                  onPress={handleSubmit}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  contentStyle={styles.buttonContent}
                >
                  {isSubmitting ? "Creating account..." : "Sign Up"}
                </Button>
              )}
            </View>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText} variant="bodyMedium">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
              </Text>
              <Button
                mode="text"
                onPress={resetForm}
                style={styles.toggleButton}
                disabled={isSubmitting}
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={dismissSnackbar}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: dismissSnackbar,
        }}
        style={error?.toLowerCase().includes('success') ? styles.successSnackbar : styles.errorSnackbar}
      >
        <Text style={styles.snackbarText}>{error}</Text>
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
  },
  input: {
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  button: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    color: "#666",
  },
  toggleButton: {
    marginLeft: -10,
  },
  successSnackbar: {
    backgroundColor: '#4CAF50',
  },
  errorSnackbar: {
    backgroundColor: '#F44336',
  },
  snackbarText: {
    color: '#FFFFFF',
  },
});