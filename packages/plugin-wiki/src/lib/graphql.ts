import { GraphQLClient } from "graphql-request";

const endpoint = "https://api.iq.wiki/graphql";

export const client = new GraphQLClient(endpoint);
