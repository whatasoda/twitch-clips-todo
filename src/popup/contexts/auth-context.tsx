import { createContext, type ParentComponent, useContext } from "solid-js";
import { useAuth } from "../hooks/use-auth";

type AuthContextValue = ReturnType<typeof useAuth>;

const AuthContext = createContext<AuthContextValue>();

export const AuthProvider: ParentComponent = (props) => {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{props.children}</AuthContext.Provider>;
};

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within an AuthProvider");
  return ctx;
}
