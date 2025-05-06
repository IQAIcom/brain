import { graphql } from "gql.tada";

export const USER_CREATED_WIKIS_QUERY = graphql(`
  query userCreatedWikis($id: String!) {
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

export const USER_EDITED_WIKIS_QUERY = graphql(`
  query userEditedWikis($id: String!) {
    userById(id: $id) {
      wikisEdited {
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

export const USER_ACTIVITIES_QUERY = graphql(`
  query userActivities($id: String!, $offset: Int = 0, $limit: Int = 30) {
    activitiesByUser(userId: $id, offset: $offset, limit: $limit) {
      id
      type
      datetime
      block
      ipfs
      wikiId
      user {
        id
        profile {
          username
          avatar
        }
      }
      content {
        id
        title
        summary
        transactionHash
        ipfs
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
      metadata {
        id
        value
      }
      images {
        id
        type
      }
      tags {
        id
      }
      categories {
        id
        title
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
`);
