import { Errors } from "../../types";

export default function validate({ username, email, password }: { username: string; email: string; password: string }): Errors {
  let errors: Errors = {};

  if (!username) {
    errors = { ...errors, username: "Debe ingresar un nombre de usuario" };
  } else if (username.length < 3 || username.length > 20) {
    errors = { ...errors, username: "El nombre de usuario debe tener entre 3 y 20 caracteres" };
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors = { ...errors, username: "El nombre de usuario solo puede contener letras, números y guiones bajos" };
  }

  if (!email) {
    errors = { ...errors, email: "Debe ingresar un correo electrónico" };
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors = { ...errors, email: "El correo electrónico ingresado no es válido" };
  }

  if (!password) {
    errors = { ...errors, password: "Debe ingresar una contraseña" };
  } else if (password.length < 6) {
    errors = { ...errors, password: "La contraseña debe tener al menos 6 caracteres" };
  } else if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{6,}/.test(password)) {
    errors = { ...errors, password: "La contraseña debe contener al menos una mayúscula, una minúscula y un número" };
  }

  return errors;
}