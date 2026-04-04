export interface AuthActionState {
  status: "idle" | "success" | "error";
  message: string;
  email?: string;
  requiresEmailVerification?: boolean;
}

export const initialAuthActionState: AuthActionState = {
  status: "idle",
  message: "",
};