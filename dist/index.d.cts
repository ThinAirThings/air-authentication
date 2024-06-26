import * as next_server from 'next/server';
import * as _auth_core_providers from '@auth/core/providers';
export { default as GoogleProvider } from 'next-auth/providers/google';

type OAuthUser = {
    name: string;
    email: string;
    image?: string;
};

declare const configAuthentication: <U extends Record<string, any>, C extends Record<string, any> = Record<string, any>>({ customAuthorizer }: {
    customAuthorizer: (payload: C) => U | Promise<U | null> | null;
}) => ({ redirectTo, providers, getProfileFromProvider, createAccountFromProviderIfDoesNotExist }: {
    redirectTo: string;
    providers?: _auth_core_providers.Provider[] | undefined;
    getProfileFromProvider?: ((payload: OAuthUser & {
        providerId: string;
        provider: string;
    }) => U | Promise<U | null> | null) | undefined;
    createAccountFromProviderIfDoesNotExist?: ((payload: OAuthUser & {
        providerId: string;
        provider: string;
    }) => U | Promise<U>) | undefined;
}) => {
    GET: (req: next_server.NextRequest) => Promise<Response>;
    POST: (req: next_server.NextRequest) => Promise<Response>;
    auth: () => Promise<U | null>;
    signIn: (provider: _auth_core_providers.BuiltInProviderType | (string & {}) | undefined, credentials?: C | undefined) => Promise<void>;
    signOut: <R extends boolean = true>(options?: {
        redirectTo?: string | undefined;
        redirect?: R | undefined;
    } | undefined) => Promise<R extends false ? any : never>;
};

export { configAuthentication };
