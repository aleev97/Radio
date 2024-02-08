import React, { useState } from "react";
import styles from './landingpage.module.css'

const LandingPage = () => {

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

  //manejar cambios en formularios
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

  //enviar datos de registro al back
  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
  };

  return (
    <div className={styles.container} >
      <h1 className={styles.Titulo} >Bienvenidos a Impacto Juvenil fm 98.3</h1>
      <div className={styles.containe_Formulario} >
        <h2 className={styles.Subtitulo} >Registro</h2>
        <form className={styles.Formulario} onSubmit={handleRegisterSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Nombre de usuario"
            value={registerForm.username}
            onChange={handleRegisterChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={registerForm.email}
            onChange={handleRegisterChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={registerForm.password}
            onChange={handleRegisterChange}
          />
          <label>
            <input
              type="checkbox"
              name="isAdmin"
              checked={registerForm.isAdmin}
              onChange={() =>
                setRegisterForm({
                  ...registerForm,
                  isAdmin: !registerForm.isAdmin
                })
              }
            />
            Administrador
          </label>
          <button type="submit">Registrarse</button>
        </form>
      </div>
      <div className={styles.containe_Formulario} >
        <h2 className={styles.Subtitulo} >Iniciar sesión</h2>
        <form className={styles.Formulario} onSubmit={handleLoginSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Nombre de usuario"
            value={loginForm.username}
            onChange={handleLoginChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={loginForm.password}
            onChange={handleLoginChange}
          />
          <button type="submit">Iniciar sesión</button>
        </form>
      </div>
    </div>
  );
};

export default LandingPage;