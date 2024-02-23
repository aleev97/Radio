import { Errors } from "../../types";

export default function validate({ username, password }: { username: string; password: string }): Errors {
  let errors: Errors = {};

  if (!username) {
    errors = { ...errors, username: "Debe ingresar un nombre de usuario" };
  } else if (username.length < 3 || username.length > 20) {
    errors = { ...errors, username: "El nombre de usuario debe tener entre 3 y 20 caracteres" };
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors = { ...errors, username: "El nombre de usuario solo puede contener letras, números y guiones bajos" };
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