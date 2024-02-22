import React, { useState, useEffect } from "react";
import styles from './landingpage.module.css';
import image from '../imagenes/logo.jpg';
import validate from './validate';
import { Errors } from "../../types";
import axios from 'axios';
interface RegisterForm {
  username: string;
  email: string;
  password: string;
  isadmin: boolean;
}
interface LoginForm {
  username: string;
  email: string;
  password: string;
}

const LandingPage: React.FC = () => {
  const API_BASE_URL = 'http://localhost:3000/api';

  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    username: "",
    email: "",
    password: "",
    isadmin: false
  });

  const [isadminChecked, setIsadminChecked] = useState(false);
  const [loginForm, setLoginForm] = useState<LoginForm>({
    username: "",
    password: "",
    email: ""
  });

  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginFormVisible, setLoginFormVisible] = useState(true);
  const [formPosition, setFormPosition] = useState(0);
  const [registerErrors, setRegisterErrors] = useState<Errors>({});
  const [loginErrors, setLoginErrors] = useState<Errors>({});
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(""); // Limpiar el mensaje después de 2.8 segundos
      }, 8800);
      return () => clearTimeout(timer); // Limpiar el temporizador si el componente se desmonta o el mensaje cambia
    }
  }, [message]);

  useEffect(() => {
    const isWideScreen = window.innerWidth > 850;
    setShowRegisterPassword(isWideScreen);
    setShowLoginPassword(isWideScreen);
  }, []);

  const handleResize = () => {
    const isWideScreen = window.innerWidth > 850;
    setShowRegisterPassword(isWideScreen);
    setShowLoginPassword(isWideScreen);
  };

  const handleToggleShowRegisterPassword = () => {
    setShowRegisterPassword(prevState => !prevState);
  };

  const handleToggleShowLoginPassword = () => {
    setShowLoginPassword(prevState => !prevState);
  };

  const handleFormChange = (formType: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (formType === 'login') {
      setLoginForm(prevState => ({
        ...prevState,
        [name]: value
      }));
    } else {
      setRegisterForm(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleMoveToLogin = () => {
    setLoginFormVisible(true);
    setFormPosition(0);
  };

  const handleMoveToRegister = () => {
    setLoginFormVisible(false);
    setFormPosition(33);
  };

  const clearForm = (formType: string) => {
    if (formType === 'login') {
      setLoginForm({
        username: "",
        email: "",
        password: ""
      });
    } else {
      setRegisterForm({
        username: "",
        email: "",
        password: "",
        isadmin: false
      });
      setIsadminChecked(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate(registerForm);
    if (Object.keys(validationErrors).length === 0) {
      const isAdminValue = isadminChecked ? true : false;
      try {
        await axios.post(`${API_BASE_URL}/users/register`, { ...registerForm, isadmin: isAdminValue });
        setMessage('Usuario registrado exitosamente');
        clearForm('register');
      } catch (error) {
        setMessage('Error al registrar usuario');
        console.error('Error:', error);
      }
    } else {
      setRegisterErrors(validationErrors);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate(loginForm);
    if (Object.keys(validationErrors).length === 0) {
      try {
        await axios.post(`${API_BASE_URL}/users/login`, loginForm);
        setMessage('Usuario autenticado exitosamente');
        clearForm('login');
      } catch (error) {
        setMessage('Error al iniciar sesión');
        console.error('Error:', error);
      }
    } else {
      setLoginErrors(validationErrors as Errors);
    }
  };

  return (
    <main>
      <h1 className={styles.Titulo}>Bienvenidos a Radio de M.F.C</h1>
      <div className={styles.container}>
        <div className={styles.caja__trasera}>
          <div className={styles.caja__trasera_login}>
            <h3>¿Tienes cuenta?</h3>
            <p>Inicia sesión para entrar</p>
            <button onClick={handleMoveToLogin}>Iniciar Sesión</button>
          </div>
          <div className={styles.caja__trasera_register}>
            <h3>¿No tienes una cuenta?</h3>
            <p>Regístrate para iniciar sesión</p>
            <button onClick={handleMoveToRegister}>Registrarse</button>
          </div>
        </div>
        <div className={styles.container_formularios} style={{ left: `${formPosition}%` }}>
          <form className={`${styles.container_formularios} ${loginFormVisible ? styles.Formulario_login : styles.Formulario_register}`} onSubmit={loginFormVisible ? handleLoginSubmit : handleRegisterSubmit}>
            <h2>{loginFormVisible ? 'Iniciar sesión' : 'Registrarse'}</h2>
            <input
              type="text"
              name="username"
              placeholder="Nombre de usuario"
              value={loginFormVisible ? loginForm.username : registerForm.username}
              onChange={handleFormChange(loginFormVisible ? 'login' : 'register')}
            />
            {loginFormVisible ? (
              <div className={styles.passwordInputContainer}>
                <input
                  type={showLoginPassword ? "password" : "text"}
                  name="password"
                  placeholder="Contraseña"
                  value={loginForm.password}
                  onChange={handleFormChange('login')}
                  className={styles.passwordInput}
                />
                <button
                  type="button"
                  className={`${styles.showHideButton} ${styles.loginShowHideButton}`}
                  onClick={handleToggleShowLoginPassword}
                >
                  {showLoginPassword ? "◡" : "👁️"}
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
                <div className={styles.passwordInputContainer}>
                  <input
                    type={showRegisterPassword ? "password" : "text"}
                    name="password"
                    placeholder="Contraseña"
                    value={registerForm.password}
                    onChange={handleFormChange('register')}
                    className={styles.passwordInput}
                  />
                  <button
                    className={`${styles.showHideButton} ${styles.registerShowHideButton}`}
                    type="button"
                    onClick={handleToggleShowRegisterPassword}
                  >
                    {showRegisterPassword ? "◡" : "👁️"}
                  </button>
                </div>
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
              <p className={styles.text_button}>{loginFormVisible ? 'Entrar' : 'Registrarse'}</p>
            </button>
            {loginFormVisible && loginErrors.username && <p className={styles.error}>{loginErrors.username}</p>}
            {!loginFormVisible && registerErrors.username && <p className={styles.error}>{registerErrors.username}</p>}
            {!loginFormVisible && registerErrors.email && <p className={styles.error}>{registerErrors.email}</p>}
            {!loginFormVisible && registerErrors.password && <p className={styles.error}>{registerErrors.password}</p>}
          </form>
        </div>
      </div>
      <img src={image} alt="Logo" className={styles.logo} />
      {message && (
        <div className={styles.message_container}>
          <p>{message}</p>
        </div>
      )}
    </main>
  );
};

export default LandingPage;