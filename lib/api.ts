import ky from "ky";

export const api = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_URL, // URL base de tu backend NestJS

  credentials: "include", // Enviar cookies httpOnly para login, auth, sesiones

  timeout: 15000, // Tiempo límite antes de fallar

  // Reintentos automáticos
  retry: {
    limit: 2,
    methods: ["get", "post", "patch"],
  },

  // Interceptores antes/después de la petición
  hooks: {
    beforeRequest: [
      (request) => {
        // console.log("➡️", request.method, request.url);
        // request.headers.set("x-api-key", "123");
      },
    ],
    afterResponse: [
      (_input, _options, response) => {
        // console.log("⬅️", response.status, response.url);
      },
    ],
    beforeError: [
      (error) => {
        // Un 401 es la respuesta normal de un visitante sin sesión (por
        // ejemplo en `/cliente/me`), no un fallo: registrarlo llenaba la
        // consola de errores que no lo son. El resto sí se registra, y sólo
        // en desarrollo.
        const status = error.response?.status;
        if (status !== 401 && process.env.NODE_ENV === "development") {
          console.warn(`[api] ${status ?? "sin respuesta"} ${error.request?.url ?? ""}`);
        }
        return error;
      },
    ],
  },

  // headers: {
  //   "Content-Type": "application/json",
  // },

  // searchParams: { page: 1, limit: 10 },

  // throwHttpErrors: true, // lanza error si 400/500
});
