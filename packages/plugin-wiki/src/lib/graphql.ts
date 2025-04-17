import { GraphQLClient } from "graphql-request";

const endpoint = "https://graph.everipedia.org/graphql";

export const client = new GraphQLClient(endpoint);
