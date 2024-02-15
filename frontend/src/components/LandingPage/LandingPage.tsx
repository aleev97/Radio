import React, { useState, useEffect } from "react";
import styles from './landingpage.module.css';
import image from '../imagenes/logo.jpg';

const LandingPage: React.FC = () => {
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
    isAdmin: false
  });

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: ""
  });

  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginFormVisible, setLoginFormVisible] = useState(true);
  const [formPosition, setFormPosition] = useState(0);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleResize = () => {
    const isWideScreen = window.innerWidth > 850;
    setShowRegisterPassword(isWideScreen);
    setShowLoginPassword(isWideScreen);
  };

  const handleToggleShowRegisterPassword = () => {
    setShowRegisterPassword(!showRegisterPassword);
  };
  
  const handleToggleShowLoginPassword = () => {
    setShowLoginPassword(!showLoginPassword);
  };
  
  const handleFormChange = (formType: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (formType === 'login') {
      setLoginForm({
        ...loginForm,
        [name]: value
      });
    } else {
      setRegisterForm({
        ...registerForm,
        [name]: value
      });
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const endpoint = loginFormVisible ? 'api/users/login' : 'api/users/register';
    const formData = loginFormVisible ? loginForm : registerForm;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const successMessage = loginFormVisible ? 'Usuario autenticado exitosamente' : 'Usuario registrado exitosamente';
        console.log(successMessage);
      } else {
        console.error('Error:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
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
          <form className={`${styles.container_formularios} ${loginFormVisible ? styles.Formulario_login : styles.Formulario_register}`} onSubmit={handleSubmit}>
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
                    checked={registerForm.isAdmin}
                    onChange={() =>
                      setRegisterForm({
                        ...registerForm,
                        isAdmin: !registerForm.isAdmin
                      })
                    }
                    className={styles.checkboxInput}
                  />
                  <span className={styles.checkboxText}>Administrador</span>
                </label>
              </>
            )}
            <button className={styles.Button_RegisterInicio} type="submit">
              <p className={styles.text_button}>{loginFormVisible ? 'Entrar' : 'Registrarse'}</p>
            </button>
          </form>
        </div>
      </div>
      <img src={image} alt="Logo" className={styles.logo} />
    </main>
  );
};

export default LandingPage;