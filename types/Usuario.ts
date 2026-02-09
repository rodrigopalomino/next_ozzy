import { ISODateString } from "./helpers-enums";

export type Usuario = {
  id: number;
  username: string;
  password: string;
  activo: boolean;
  rol: "ADMIN" | "STAFF";

  createdAt: ISODateString;
  updatedAt: ISODateString;
};
