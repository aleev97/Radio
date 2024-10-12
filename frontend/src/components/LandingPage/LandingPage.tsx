import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Errors, RegisterForm, LoginForm } from "../../types";
import styles from './landingpage.module.css';
import validate from './validate';
import axios from 'axios';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const [registerForm, setRegisterForm] = useState<RegisterForm>({ username: "", email: "", password: "", isadmin: false });
  const [loginForm, setLoginForm] = useState<LoginForm>({ username: "", password: "" });
  const [isadminChecked, setIsadminChecked] = useState(false);
  const [showPassword, setShowPassword] = useState({ register: false, login: false });
  const [loginFormVisible, setLoginFormVisible] = useState(true);
  const [registerErrors, setRegisterErrors] = useState<Errors>({});
  const [message, setMessage] = useState<string>("");
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleResize = () => {
    const isWideScreen = window.innerWidth > 850;
    setShowPassword({ register: isWideScreen, login: isWideScreen });
  };

  const handleToggleShowPassword = (formType: "register" | "login") => {
    setShowPassword((prevState) => ({ ...prevState, [formType]: !prevState[formType] }));
  };

  const handleFormChange = (formType: "login" | "register") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (formType === "login") {
      setLoginForm((prevState) => ({ ...prevState, [name]: value }));
    } else {
      setRegisterForm((prevState) => ({ ...prevState, [name]: value }));

      if (typingTimeout) clearTimeout(typingTimeout);

      const timeout = setTimeout(() => {
        if (value.trim()) {
          const validationErrors = validate({ ...registerForm, [name]: value });
          setRegisterErrors((prevErrors) => ({ ...prevErrors, [name]: validationErrors[name] || "" }));
        } else {
          setRegisterErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
        }
      }, 300);

      setTypingTimeout(timeout);
    }
  };

  const handleFormSwitch = (toLogin: boolean) => {
    setLoginFormVisible(toLogin);
  };

  const clearForm = (formType: "login" | "register") => {
    if (formType === "login") {
      setLoginForm({ username: "", password: "" });
    } else {
      setRegisterForm({ username: "", email: "", password: "", isadmin: false });
      setIsadminChecked(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate(registerForm);
    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await axios.post(`${API_BASE_URL}/users/register`, { ...registerForm, isadmin: isadminChecked });
        console.log("Datos de respuesta del backend al registrarse:", response.data); // Imprimir datos de registro en la consola
        setMessage("Usuario registrado exitosamente");
        clearForm("register");
      } catch (error) {
        console.log("Error al registrarse:", error); // Imprimir error en la consola
        setMessage("Error al registrar usuario");
      }
    } else {
      setRegisterErrors(validationErrors);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/users/login`, loginForm);
      console.log("Datos de respuesta del backend al iniciar sesión:", response.data); // Imprimir datos de inicio de sesión en la consola
      const { token } = response.data;

      // Guardar el token en localStorage
      localStorage.setItem("token", token);
      setMessage("Usuario autenticado exitosamente");
      clearForm("login");
      navigate("/home");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log("Error de respuesta del backend:", error.response.data); // Imprimir error de respuesta en la consola
        setMessage(error.response.data.message || "Error al iniciar sesión");
      } else {
        console.log("Error en la solicitud:", error); // Imprimir cualquier otro error en la consola
        setMessage("Error al iniciar sesión");
      }
    }
  };

  return (
    <main className={styles.landing_main}>
      <h1 className={styles.Titulo}>Bienvenidos a Radio de M.F.C</h1>
      <div className={styles.container}>
        <div className={styles.caja__trasera}>
          <div className={styles.caja__trasera_login}>
            <h3>¿Tienes cuenta?</h3>
            <p>Inicia sesión para entrar</p>
            <button onClick={() => handleFormSwitch(true)}>Iniciar Sesión</button>
          </div>
          <div className={styles.caja__trasera_register}>
            <h3>¿No tienes una cuenta?</h3>
            <p>Regístrate para iniciar sesión</p>
            <button onClick={() => handleFormSwitch(false)}>Registrarse</button>
          </div>
        </div>
        <div className={styles.container_formularios} style={{ left: `${loginFormVisible ? 0 : 33}%` }}>
          <form
            className={`${styles.container_formularios} ${loginFormVisible ? styles.Formulario_login : styles.Formulario_register}`}
            onSubmit={loginFormVisible ? handleLoginSubmit : handleRegisterSubmit}
          >
            <h2>{loginFormVisible ? "Iniciar sesión" : "Registrarse"}</h2>

            <input
              type="text"
              name="username"
              placeholder="Nombre de usuario"
              value={loginFormVisible ? loginForm.username : registerForm.username}
              onChange={handleFormChange(loginFormVisible ? "login" : "register")}
            />
            {!loginFormVisible && registerErrors.username && <p className={styles.error}>{registerErrors.username}</p>}

            {loginFormVisible ? (
              <div className={styles.passwordInputContainer}>
                <input
                  type={showPassword.login ? "password" : "text"} // Cambié aquí para mostrar la contraseña cuando se selecciona el botón
                  name="password"
                  placeholder="Contraseña"
                  value={loginForm.password}
                  onChange={handleFormChange('login')}
                  className={styles.passwordInput}
                />
                <button
                  type="button"
                  className={`${styles.showHideButton} ${styles.loginShowHideButton}`}
                  onClick={() => handleToggleShowPassword("login")}
                >
                  {showPassword.login ? "◡" : "👁️"}
                </button>
              </div>
            ) : (
              <>
                <input
                  type="email"
                  name="email"
                  placeholder="Correo electrónico"
                  value={registerForm.email}
                  onChange={handleFormChange('register')}
                />
                {!loginFormVisible && registerErrors.email && <p className={styles.error}>{registerErrors.email}</p>}
                <div className={styles.passwordInputContainer}>
                  <input
                    type={showPassword.register ? "password" : "text"} // Cambié aquí para mostrar la contraseña cuando se selecciona el botón
                    name="password"
                    placeholder="Contraseña"
                    value={registerForm.password}
                    onChange={handleFormChange('register')}
                    className={styles.passwordInput}
                  />
                  <button
                    className={`${styles.showHideButton} ${styles.registerShowHideButton}`}
                    type="button"
                    onClick={() => handleToggleShowPassword("register")}
                  >
                    {showPassword.register ? "◡" : "👁️"}
                  </button>
                </div>
                {!loginFormVisible && registerErrors.password && <p className={styles.error}>{registerErrors.password}</p>}
                <label className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    checked={isadminChecked}
                    onChange={() => setIsadminChecked(!isadminChecked)}
                    className={styles.checkboxInput}
                  />
                  <span className={styles.checkboxText}>Administrador</span>
                </label>
              </>
            )}

            <button className={styles.Button_RegisterInicio} type="submit">
              <p className={styles.text_button}>{loginFormVisible ? "Entrar" : "Registrarse"}</p>
            </button>

            <p className={styles.mensaje}>{message}</p>
          </form>
        </div>
      </div>
    </main>
  );
};

export default LandingPage;