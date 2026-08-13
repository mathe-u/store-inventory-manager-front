"use client";

import { createContext, useContext } from "react";
import type { ApiUser } from "@/src/lib/api";

interface UserContextValue {
  user: ApiUser | null;
}

export const UserContext = createContext<UserContextValue>({ user: null });

/**
 * Hook conveniente para ler o usuário logado em qualquer componente
 * filho do DashboardLayout.
 */
export function useUser(): UserContextValue {
  return useContext(UserContext);
}
