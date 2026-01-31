import { useRouter } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";
import { ID, Models } from "react-native-appwrite";
import { account } from "./appwrite";

type AuthContextType = {
  signUp: (email: string, password: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  user: Models.User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Models.User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
    } catch (error: any) {
      // Silently handle expected "no session" errors
      if (error.code === 401) {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Clear any existing session before signing up
      try {
        await account.deleteSession("current");
      } catch (e) {
        // Session might not exist, that's fine
      }
      
      await account.create(ID.unique(), email, password);
      
      // After creating user, log them in
      await account.createEmailPasswordSession(email, password);
      const currentUser = await account.get();
      setUser(currentUser);
      
      // Navigate to tabs
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logIn = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Clear any existing session before logging in
      try {
        await account.deleteSession("current");
      } catch (e) {
        // Session might not exist, that's fine
      }
      
      await account.createEmailPasswordSession(email, password);
      const currentUser = await account.get();
      setUser(currentUser);
      
      // Navigate to tabs
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await account.deleteSession("current");
      setUser(null);
      router.replace("/auth");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, clear local state
      setUser(null);
      router.replace("/auth");
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    signUp,
    logIn,
    logout,
    user,
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};