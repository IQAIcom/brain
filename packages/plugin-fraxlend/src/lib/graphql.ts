import { GraphQLClient } from "graphql-request";

const endpoint = "https://api.frax.finance/graphql/fraxtal/fraxlend";

export const client = new GraphQLClient(endpoint);
