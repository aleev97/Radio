import { Errors } from "../../types";
export default function validate({ username, email, password }: { username: string; email: string; password: string }): Errors {
  let errors: Errors = {};

  if (!username) {
    errors = { ...errors, username: "Debe ingresar un nombre de usuario" };
  }

  if (!email) {
    errors = { ...errors, email: "Debe ingresar un correo electrónico" };
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors = { ...errors, email: "Debe ingresar un correo electrónico válido" };
  }

  if (!password) {
    errors = { ...errors, password: "Debe ingresar una contraseña" };
  } else if (password.length < 6) {
    errors = { ...errors, password: "La contraseña debe tener al menos 6 caracteres" };
  }

  return errors;
}