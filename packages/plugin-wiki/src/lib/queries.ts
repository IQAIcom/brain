import { graphql } from "gql.tada";

export const USER_WIKIS_QUERY = graphql(`
  query userWikis($id: String!) {
    userById(id: $id) {
      wikisCreated {
        ... on UserActivity {
          activity {
            content {
              id
              ipfs
              transactionHash
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
`);

export const WIKI_QUERY = graphql(`
  query wiki($id: String!) {
    wiki(id: $id) {
      id
      ipfs
      transactionHash
      title
      summary
    }
  }
`);
