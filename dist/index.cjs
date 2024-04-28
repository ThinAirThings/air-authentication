"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  GoogleProvider: () => import_google.default,
  configAuthentication: () => configAuthentication
});
module.exports = __toCommonJS(src_exports);

// src/configs/configAuthentication.ts
var import_next_auth = __toESM(require("next-auth"), 1);
var import_credentials = __toESM(require("next-auth/providers/credentials"), 1);
var configAuthentication = ({
  customAuthorizer
}) => ({
  redirectTo,
  providers,
  getProfileFromProvider,
  createAccountFromProviderIfDoesNotExist
}) => {
  const { signIn, signOut, auth, handlers: { GET, POST } } = (0, import_next_auth.default)({
    providers: [
      (0, import_credentials.default)({
        authorize: customAuthorizer
      }),
      ...providers ?? []
    ],
    callbacks: {
      jwt: async ({ user, token, account }) => {
        console.log("jwt", user, token, account);
        if (user) {
          const provider = account.provider;
          if (provider === "credentials") {
            if (user) {
              token = {
                ...token,
                ...Object.fromEntries(Object.entries(user).map(([key, value]) => [key, value]))
              };
            }
            return token;
          }
          const existingDbUser = await getProfileFromProvider?.({
            ...user,
            providerId: account.providerAccountId,
            provider
          });
          if (existingDbUser) {
            token = {
              ...token,
              ...Object.fromEntries(Object.entries(existingDbUser).map(([key, value]) => [key, value]))
            };
            return token;
          }
          const newUser = await createAccountFromProviderIfDoesNotExist?.({
            ...user,
            providerId: account.providerAccountId,
            provider
          });
          token = {
            ...token,
            ...Object.fromEntries(Object.entries(newUser).map(([key, value]) => [key, value]))
          };
        }
        return token;
      },
      session: ({ session, token }) => {
        if (session.user && token.sub) {
          session.user = Object.fromEntries(Object.entries(token).map(([key, value]) => [key, value]));
        }
        return session;
      }
    }
  });
  return {
    GET,
    POST,
    auth: async () => await auth().then(
      (session) => session?.user ? session.user : null
    ),
    signIn: async (provider, credentials) => {
      await signIn(provider, { ...credentials ?? {} });
    },
    signOut
  };
};

// src/index.ts
var import_google = __toESM(require("next-auth/providers/google"), 1);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GoogleProvider,
  configAuthentication
});
