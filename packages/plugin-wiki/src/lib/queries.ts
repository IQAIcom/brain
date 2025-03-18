import { gql } from "graphql-request";

export const USER_WIKIS = (id: string) => gql`
{
  userById(id: "${id}") {
    wikisCreated {
      ... on UserActivity {
        activity {
          content {
            id
            ipfs
            title
            created
            updated
            summary
            categories {
              id
              title
            }
            tags {
              id
            }
            images {
              id
              type
            }
            metadata {
              id
              value
            }
            user {
              id
              profile {
                username
                avatar
              }
            }
          }
        }
      }
    }
  }
}
`;

export const WIKI_QUERY = (id: string) => gql`
        {
                wiki(id: "${id}") {
                    id
                    ipfs
                    title
                    summary
                }
            }
`;
