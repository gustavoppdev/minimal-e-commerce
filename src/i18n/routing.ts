import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en", "pt-br"],

  // Used when no locale matches
  defaultLocale: "en",

  pathnames: {
    "/": "/",
    "/auth/sign-in": {
      en: "/auth/sign-in",
      "pt-br": "/auth/entrar",
    },
    "/auth/sign-up": {
      en: "/auth/sign-up",
      "pt-br": "/auth/cadastro",
    },
  },
});
