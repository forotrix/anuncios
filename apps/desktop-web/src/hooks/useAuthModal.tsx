"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { RegistrationModal } from "@/components/RegistrationModal/RegistrationModal";

type AuthModalContextValue = {
  isOpen: boolean;
  openRegister: () => void;
  close: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export const AuthModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openRegister = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      openRegister,
      close,
    }),
    [isOpen, openRegister, close],
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      {isOpen && <RegistrationModal onClose={close} variant="default" />}
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
