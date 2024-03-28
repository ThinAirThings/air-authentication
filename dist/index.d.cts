import * as next_server from 'next/server';
import * as _auth_core_providers from '@auth/core/providers';

type OAuthUser = {
    name: string;
    email: string;
    image?: string;
};

declare const airAuthenticationConfig: <U extends Record<string, any>, C extends Record<string, any> = Record<string, any>>(customAuthorizer: (payload: C) => U | Promise<U | null> | null) => ({ providers, getProfileFromProvider, createAccountFromProviderIfDoesNotExist }: {
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
    auth: () => Promise<U>;
    signIn: (provider: _auth_core_providers.BuiltInProviderType | (string & {}) | undefined, credentials?: C | undefined) => Promise<never>;
    signOut: <R extends boolean = true>(options?: {
        redirectTo?: string | undefined;
        redirect?: R | undefined;
    } | undefined) => Promise<R extends false ? any : never>;
};

export { airAuthenticationConfig };
