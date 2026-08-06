"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { RegistrationModal } from "@/components/RegistrationModal/RegistrationModal";

type AuthModalContextValue = {
  isOpen: boolean;
  openRegister: () => void;
  openLogin: () => void;
  close: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export const AuthModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [initialView, setInitialView] = useState<"selection" | "login">("selection");

  const openRegister = useCallback(() => {
    setInitialView("selection");
    setIsOpen(true);
  }, []);

  const openLogin = useCallback(() => {
    setInitialView("login");
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      openRegister,
      openLogin,
      close,
    }),
    [isOpen, openRegister, openLogin, close],
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      {isOpen && <RegistrationModal onClose={close} variant="default" initialView={initialView} />}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error("useAuthModal debe usarse dentro de AuthModalProvider");
  }
  return ctx;
};
