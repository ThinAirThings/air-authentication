import NextAuth, { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials";
import { OAuthUser } from "../types/OAuthUser";

export const airAuthenticationConfig = <
    U extends Record<string, any>,
    C extends Record<string, any> = Record<string, any>,
>(
    customAuthorizer: (payload: C) => Promise<U | null> | (U | null)
) => ({
    providers,
    getProfileFromProvider,
    createAccountFromProviderIfDoesNotExist
}: {
    providers?: NextAuthConfig['providers'],
    getProfileFromProvider?: (payload: OAuthUser & {
        providerId: string
        provider: string;
    }) => Promise<U | null> | (U | null),
    createAccountFromProviderIfDoesNotExist?: (payload: OAuthUser & {
        providerId: string
        provider: string;
    }) => Promise<U> | U
}) => {
        const { signIn, signOut, auth, handlers: { GET, POST } } = NextAuth({
            providers: [
                Credentials({
                    authorize: customAuthorizer as any
                }),
                ...providers ?? []
            ],
            callbacks: {
                jwt: async ({ user, token, account }) => {
                    if (user) {
                        const provider = account!.provider
                        if (provider === 'credentials') {
                            console.log("Credentials Provider")
                            if (user) {
                                token = {
                                    ...token,
                                    ...Object.fromEntries(Object.entries(user).map(([key, value]) => [key, value]))
                                }
                            }
                            console.log("TOKEN1", token)
                            return token
                        }
                        console.log(account)
                        console.log("INSIDE JWT")
                        console.log("USER1", user)
                        const existingDbUser = await getProfileFromProvider?.({
                            ...user as OAuthUser,
                            providerId: account!.providerAccountId,
                            provider: provider
                        }) as unknown as (U | null)
                        if (existingDbUser) {
                            token = {
                                ...token,
                                ...Object.fromEntries(Object.entries(existingDbUser).map(([key, value]) => [key, value]))
                            }
                            return token
                        }
                        const newUser = await createAccountFromProviderIfDoesNotExist?.({
                            ...user as OAuthUser,
                            providerId: account!.providerAccountId,
                            provider: provider
                        }) as unknown as U
                        token = {
                            ...token,
                            ...Object.fromEntries(Object.entries(newUser).map(([key, value]) => [key, value]))
                        }
                        console.log("TOKEN1", token)
                    }
                    return token
                },
                session: ({ session, token }) => {
                    console.log("SESSION1", session)
                    console.log("TOKEN2", token)
                    if (session.user && token.sub) {
                        session.user = Object.fromEntries(Object.entries(token).map(([key, value]) => [key, value])) as any
                    }
                    console.log("USER2", session.user)
                    return session as any
                }
            }
        })
        return {
            GET,
            POST,
            auth: async () => await auth().then(session =>
                session?.user ? session.user : null
            ) as unknown as U,
            signIn: async (provider: Parameters<typeof signIn>[0], credentials?: C) => await signIn(provider, { ...credentials }),
            signOut
        }
    }