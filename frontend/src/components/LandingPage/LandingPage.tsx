import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../Redux/store";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser, setMessage, clearForm, setLoginForm, setRegisterForm } from "../../Redux/Actions/userActions";
import { RootState } from "../../Redux/store";
import styles from "./landingpage.module.css";
import validate from "./validate";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { registerForm, loginForm, message, authError, loading } = useSelector(
    (state: RootState) => state.user
  );

  const [isadminChecked, setIsadminChecked] = useState(false);
  const [showPassword, setShowPassword] = useState({ register: false, login: false });
  const [loginFormVisible, setLoginFormVisible] = useState(true);
  const [registerErrors, setRegisterErrors] = useState<{ [key: string]: string }>({});
  const [typingTimeout, setTypingTimeout] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const isWideScreen = window.innerWidth > 850;
      setShowPassword({ register: isWideScreen, login: isWideScreen });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggleShowPassword = (formType: "register" | "login") => {
    setShowPassword(prevState => ({ ...prevState, [formType]: !prevState[formType] }));
  };

  const handleFormSwitch = (toLogin: boolean) => setLoginFormVisible(toLogin);

  const handleFormChange = (formType: "login" | "register") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const action = formType === "login" ? setLoginForm : setRegisterForm;
    dispatch(action({
      ...formType === "login" ? loginForm : registerForm, [name]: value,
      email: "",
      isadmin: false
    }));

    if (formType === "register") {
      validateAndSetErrors(name, value);
    }
  };

  const validateAndSetErrors = (name: string, value: string) => {
    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = window.setTimeout(() => {
      const validationErrors = validate({ ...registerForm, [name]: value });
      setRegisterErrors(prevErrors => ({ ...prevErrors, [name]: validationErrors[name] || "" }));
    }, 300);
    setTypingTimeout(timeout);
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate(registerForm);
    if (Object.keys(validationErrors).length === 0) {
      dispatch(registerUser({ ...registerForm, isadmin: isadminChecked }));
      dispatch(setMessage("Registro exitoso. ¡Bienvenido!"));
      dispatch(clearForm("register"));
    } else {
      setRegisterErrors(validationErrors);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await dispatch(loginUser(loginForm));
      navigate('/home');
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(error.message);
      } else {
        console.error("Error desconocido", error);
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
        <div
          className={styles.container_formularios}
          style={{ left: `${loginFormVisible ? 0 : 33}%` }}
        >
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
                  type={showPassword.login ? "password" : "text"}
                  name="password"
                  placeholder="Contraseña"
                  value={loginForm.password}
                  onChange={handleFormChange("login")}
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
                  onChange={handleFormChange("register")}
                />
                {!loginFormVisible && registerErrors.email && <p className={styles.error}>{registerErrors.email}</p>}
                <div className={styles.passwordInputContainer}>
                  <input
                    type={showPassword.register ? "password" : "text"}
                    name="password"
                    placeholder="Contraseña"
                    value={registerForm.password}
                    onChange={handleFormChange("register")}
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
            <p className={styles.mensaje}>{message || authError}</p>
            {loading && <p className={styles.loading}>Cargando...</p>}
          </form>
        </div>
      </div>
    </main>
  );
};

export default LandingPage;