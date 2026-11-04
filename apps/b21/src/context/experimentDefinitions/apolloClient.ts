import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { createFetchLoginRedirect } from "@atlas/auth";
import { authProvider } from "../../auth";

export const client = new ApolloClient({
  link: new HttpLink({
    uri: "/api/graphql",
    credentials: "include",
    fetch: createFetchLoginRedirect(authProvider.login),
  }),
  cache: new InMemoryCache(),
});
