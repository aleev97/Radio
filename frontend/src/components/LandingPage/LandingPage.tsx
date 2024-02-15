import React, { useState, useEffect } from "react";
import styles from './landingpage.module.css';
import image from '../imagenes/logo.jpg'

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
    if (window.innerWidth > 850) {
      setShowRegisterPassword(true);
      setShowLoginPassword(true);
    } else {
      setShowRegisterPassword(false);
      setShowLoginPassword(false);
    }
  };

  const handleToggleShowRegisterPassword = () => {
    setShowRegisterPassword(!showRegisterPassword);
  };
  
  const handleToggleShowLoginPassword = () => {
    setShowLoginPassword(!showLoginPassword);
  };
  
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterForm({
      ...registerForm,
      [name]: value
    });
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm({
      ...loginForm,
      [name]: value
    });
  };

  const handleMoveToLogin = () => {
    setLoginFormVisible(true);
    setFormPosition(0);
  };

  const handleMoveToRegister = () => {
    setLoginFormVisible(false);
    setFormPosition(33); // Mover el formulario de registro hacia la izquierda
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loginFormVisible) {
      // Code to handle login form submission
      try {
        const response = await fetch('api/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(loginForm)
        });
        if (response.ok) {
          console.log('Usuario autenticado exitosamente');
        } else {
          console.error('Error al iniciar sesión:', response.statusText);
        }
      } catch (error) {
        console.error('Error al conectar con el servidor:', error);
      }
    } else {
      // Code to handle register form submission
      try {
        const response = await fetch('api/users/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(registerForm)
        });
        if (response.ok) {
          console.log('Usuario registrado exitosamente');
        } else {
          console.error('Error al registrar usuario:', response.statusText);
        }
      } catch (error) {
        console.error('Error al conectar con el servidor:', error);
      }
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
              onChange={loginFormVisible ? handleLoginChange : handleRegisterChange}
            />
            {loginFormVisible ? (
              <div className={styles.passwordInputContainer}>
                <input
                  type={showLoginPassword ? "password" : "text"}
                  name="password"
                  placeholder="Contraseña"
                  value={loginForm.password}
                  onChange={handleLoginChange}
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
                  onChange={handleRegisterChange}
                />
                <div className={styles.passwordInputContainer}>
                  <input
                    type={showRegisterPassword ? "password" : "text"}
                    name="password"
                    placeholder="Contraseña"
                    value={registerForm.password}
                    onChange={handleRegisterChange}
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