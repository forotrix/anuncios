import React, { useState } from "react";
import styles from "./RegistrationModal.module.css";
import { authService, type AuthResponse } from "../../services/auth.service";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  onClose?: () => void;
  variant?: "default" | "variantA" | "variantB";
};

type ViewState = "selection" | "particular" | "user" | "login";

const MIN_PASSWORD_LENGTH = 8;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialFormData = {
  email: "",
  name: "",
  password: "",
  confirmPassword: "",
  contactNumber: "",
  location: "",
  category: "",
};

type FormField = keyof typeof initialFormData;

type ApiError = Error & { status?: number };

export const RegistrationModal = ({ onClose, variant = "default" }: Props) => {
  const [view, setView] = useState<ViewState>("selection");
  const [formData, setFormData] = useState(initialFormData);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: persistSession } = useAuth();

  const isRegisterView = view === "particular" || view === "user";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as FormField]: value }));
    setError(null);
  };

  const handleCategorySelect = (category: string) => {
    setFormData((prev) => ({ ...prev, category }));
    setIsDropdownOpen(false);
  };

  const changeView = (next: ViewState) => {
    setView(next);
    setError(null);
    setIsDropdownOpen(false);
    if (next === "selection") {
      setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    }
  };

  const validateFields = () => {
    const email = formData.email.trim();
    if (!emailRegex.test(email)) {
      return "Ingresa un correo valido";
    }

    if (!formData.password.trim()) {
      return "La contraseña es obligatoria";
    }

    if (isRegisterView) {
      if (!formData.name.trim()) {
        return "El nombre o alias es obligatorio";
      }

      if (formData.password.length < MIN_PASSWORD_LENGTH) {
        return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`;
      }

      if (formData.confirmPassword !== formData.password) {
        return "Las contraseñas no coinciden";
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      return;
    }

    const email = formData.email.trim();
    const password = formData.password.trim();

    setIsLoading(true);
    try {
      let authResult: AuthResponse;
      if (view === "login") {
        authResult = await authService.login({ email, password });
        console.log("Login successful");
      } else {
        const role = view === "particular" ? "provider" : "customer";
        authResult = await authService.register({
          email,
          password,
          role,
          name: formData.name.trim(),
          category: formData.category,
          location: formData.location.trim(),
          phone: formData.contactNumber.trim(),
        });
        console.log("Registration successful");
      }

      const shouldRemember = view === "login" ? rememberMe : true;
      persistSession(authResult, shouldRemember);
      onClose?.();
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.status === 401) {
        setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      }
      setError(apiError.message ?? "Ocurrio un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  const renderHeader = () => (
    <div className={styles.header}>
      <div className={styles.welcomeText}>Bienvenidos a ForoTrix</div>
      <div className={styles.loginLink}>
        <span className={styles.loginLinkText}>
          {view === "login" ? "No tienes cuenta?" : "Ya tienes cuenta?"}
          <br />
        </span>
        <button
          type="button"
          className={styles.loginLinkAction}
          onClick={() => changeView(view === "login" ? "selection" : "login")}
        >
          {view === "login" ? "Registrate aqui" : "Entrar aqui"}
        </button>
      </div>
    </div>
  );

  const renderEmailField = () => (
    <div className={styles.formGroup}>
      <label className={styles.label}>Correo electronico</label>
      <div className={styles.inputWrapper}>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={styles.input}
          placeholder="Correo electronico"
          autoComplete="email"
        />
      </div>
    </div>
  );

  const renderNameField = () => (
    <div className={styles.formGroup}>
      <label className={styles.label}>Nombre o alias</label>
      <div className={styles.inputWrapper}>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={styles.input}
          placeholder="Nombre o alias"
          autoComplete="name"
        />
      </div>
    </div>
  );

  const renderPasswordField = (label: string, field: "password" | "confirmPassword", isVisible: boolean, onToggle: () => void, helperText?: string) => (
    <div className={styles.formGroup}>
      <label className={styles.label}>{label}</label>
      <div className={styles.inputWrapper}>
        <input
          type={isVisible ? "text" : "password"}
          name={field}
          value={formData[field]}
          onChange={handleChange}
          className={styles.input}
          placeholder={field === "confirmPassword" ? "Confirma tu contraseña" : "Ingresa tu contraseña"}
          autoComplete={field === "confirmPassword" ? "new-password" : view === "login" ? "current-password" : "new-password"}
        />
        <button type="button" className={styles.inputActionButton} onClick={onToggle}>
          {isVisible ? "Ocultar" : "Ver"}
        </button>
      </div>
      {helperText && <p className={styles.helperText}>{helperText}</p>}
    </div>
  );

  const renderParticularView = () => (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.headerRow}>
        <button type="button" className={styles.backButton} onClick={() => changeView("selection")}>
          {"< Volver"}
        </button>
        <div className={styles.title}>Registrate</div>
      </div>

      {renderEmailField()}

      <div className={styles.formGroup}>
        <label className={styles.label}>Elige tu categoria</label>
        <div className={styles.dropdownWrapper}>
          <button type="button" className={styles.dropdownButton} onClick={() => setIsDropdownOpen((prev) => !prev)}>
            {formData.category || "Seleccionar"}
          </button>
          {isDropdownOpen && (
            <div className={styles.dropdownMenu}>
              {["Mujeres", "Trans", "Trans Operada", "Otro"].map((cat) => (
                <button key={cat} type="button" className={styles.dropdownItem} onClick={() => handleCategorySelect(cat)}>
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.row}>
        {renderNameField()}
        <div className={styles.formGroup}>
          <label className={styles.label}>Numero de contacto</label>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              className={styles.input}
              placeholder="Numero de contacto"
            />
          </div>
        </div>
      </div>

      {renderPasswordField("Crea tu contraseña", "password", isPasswordVisible, () => setIsPasswordVisible((prev) => !prev), `Mínimo ${MIN_PASSWORD_LENGTH} caracteres, combina letras y números`)}
      {renderPasswordField("Confirma tu contraseña", "confirmPassword", isConfirmVisible, () => setIsConfirmVisible((prev) => !prev))}

      <div className={styles.formGroup}>
        <label className={styles.label}>Ubicación</label>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={styles.input}
            placeholder="Ciudad o zona"
          />
        </div>
      </div>

      <div className={styles.submitButtonContainer}>
        {error && <div className={styles.error}>{error}</div>}
        <button type="submit" className={styles.submitButton} disabled={isLoading}>
          <span className={styles.submitButtonText}>{isLoading ? "Cargando..." : "Registrarse"}</span>
        </button>
      </div>
    </form>
  );

  const renderUserView = () => (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.headerRow}>
        <button type="button" className={styles.backButton} onClick={() => changeView("selection")}>
          {"< Volver"}
        </button>
        <div className={styles.title}>Registrate</div>
      </div>

      {renderEmailField()}
      {renderNameField()}
      {renderPasswordField("Crea tu contraseña", "password", isPasswordVisible, () => setIsPasswordVisible((prev) => !prev), `Mínimo ${MIN_PASSWORD_LENGTH} caracteres, combina letras y números`)}
      {renderPasswordField("Confirma tu contraseña", "confirmPassword", isConfirmVisible, () => setIsConfirmVisible((prev) => !prev))}

      <div className={styles.submitButtonContainer}>
        {error && <div className={styles.error}>{error}</div>}
        <button type="submit" className={styles.submitButton} disabled={isLoading}>
          <span className={styles.submitButtonText}>{isLoading ? "Cargando..." : "Registrarse"}</span>
        </button>
      </div>
    </form>
  );

  const renderLoginView = () => (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.title}>Entrar</div>

      {renderEmailField()}
      {renderPasswordField("Contraseña", "password", isPasswordVisible, () => setIsPasswordVisible((prev) => !prev))}

      <div className={styles.formFooter}>
        <div className={styles.checkboxRow}>
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className={styles.checkbox}
          />
          <label htmlFor="remember">Recordarme</label>
        </div>
        <button type="button" className={styles.linkButton} onClick={() => setError("Recuperar contraseña estará disponible pronto") }>
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <div className={styles.submitButtonContainer}>
        {error && <div className={styles.error}>{error}</div>}
        <button type="submit" className={styles.submitButton} disabled={isLoading}>
          <span className={styles.submitButtonText}>{isLoading ? "Cargando..." : "Entrar"}</span>
        </button>
      </div>
    </form>
  );

  const renderSelectionView = () => (
    <>
      <div className={styles.title}>Registrate</div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Correo electronico</label>
        <div className={styles.inputWrapper}>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={styles.input}
            placeholder="Correo electronico"
          />
        </div>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Tipo de usuario</label>
        <div className={styles.selectionButtons}>
          <button type="button" className={styles.selectionButton} onClick={() => changeView("particular")}>
            Particular/Agencia
          </button>
          <button type="button" className={styles.selectionButton} onClick={() => changeView("user")}>
            Usuario/Cliente
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContainer}>
        {renderHeader()}
        {view === "selection" && renderSelectionView()}
        {view === "particular" && renderParticularView()}
        {view === "user" && renderUserView()}
        {view === "login" && renderLoginView()}
      </div>
    </div>
  );
};
