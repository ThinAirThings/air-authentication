import NextAuth, { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials";
import { OAuthUser } from "../types/OAuthUser";
import { redirect } from "next/navigation";

export const configAirAuthentication = <
    U extends Record<string, any>,
    C extends Record<string, any> = Record<string, any>,
>(
    customAuthorizer: (payload: C) => Promise<U | null> | (U | null)
) => ({
    redirectTo,
    providers,
    getProfileFromProvider,
    createAccountFromProviderIfDoesNotExist
}: {
    redirectTo: string,
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
        console.log(providers)
        const { signIn, signOut, auth, handlers: { GET, POST } } = NextAuth({
            providers: [
                Credentials({
                    authorize: customAuthorizer as any
                }),
                ...providers ?? []
            ],
            callbacks: {
                jwt: async ({ user, token, account }) => {
                    console.log(user, token, account)
                    if (user) {
                        const provider = account!.provider
                        if (provider === 'credentials') {
                            if (user) {
                                token = {
                                    ...token,
                                    ...Object.fromEntries(Object.entries(user).map(([key, value]) => [key, value]))
                                }
                            }
                            return token
                        }

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
                    }
                    return token
                },
                session: ({ session, token }) => {
                    console.log(session, token)
                    if (session.user && token.sub) {
                        session.user = Object.fromEntries(Object.entries(token).map(([key, value]) => [key, value])) as any
                    }
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
            signIn: async (provider: Parameters<typeof signIn>[0], credentials?: C) => {
                console.log(credentials)
                await signIn(provider, { ...credentials ?? {}, redirect: false })
                console.log(provider)
                // redirect(redirectTo)
            },
            signOut
        }
    }