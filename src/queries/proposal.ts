import { gql } from "graphql-request";

export const PROPOSAL_QUERY = gql`
  query ProposalQuery {
    dao(id: "0xf02fd4286917270cb94fbc13a0f4e1ed76f7e986") {
      createdAt
      createdBy
      txHash
      proposals(first: 5, orderBy: createdAt, orderDirection: desc) {
        id
        createdAt
      }
    }
  }
`;
