import { ISODateString } from "./helpers-enums";

/**
 * Usuario del panel. Es lo que devuelve el back, que NO incluye la contraseña:
 * `POST /auth/login` y `GET /auth/usuarios` construyen la respuesta campo por
 * campo, y `GET /auth/me` devuelve el payload del JWT.
 *
 * El campo `password` estuvo aquí sin que nada lo rellenara. Un tipo que
 * promete un campo invita a persistirlo, y este store se guarda en
 * localStorage: no debe volver.
 */
export type Usuario = {
  id: number;
  username: string;
  activo: boolean;
  rol: "ADMIN" | "STAFF";

  createdAt: ISODateString;
  updatedAt: ISODateString;
};

/**
 * Lo que devuelve `GET /auth/me`: el payload del JWT, no una fila de BD. Son
 * cuatro campos, sin las fechas.
 */
export type UsuarioSesion = Pick<
  Usuario,
  "id" | "username" | "rol" | "activo"
>;
