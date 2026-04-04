import {
  initialAuthActionState,
  type AuthActionState,
} from "@/app/(auth)/action-state";

export function normalizeAuthActionState(
  value: Partial<AuthActionState> | null | undefined,
): AuthActionState {
  return {
    status:
      value?.status === "success" || value?.status === "error"
        ? value.status
        : initialAuthActionState.status,
    message: typeof value?.message === "string" ? value.message : "",
    email: typeof value?.email === "string" ? value.email : undefined,
    requiresEmailVerification:
      value?.requiresEmailVerification === true ? true : undefined,
  };
}