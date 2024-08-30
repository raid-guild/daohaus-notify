import axios from "axios";
import {
  DAOHAUS_V3_GNOSIS_SUBGRAPH_URL,
  GUILD_GNOSIS_DAO_ADDRESS_V3,
} from "./utils/constants";
import { EmbedBuilder, TextChannel } from "discord.js";
import { config } from "./config";
import { Proposal } from "./utils/types";

export const getProposalsNew = async () => {
  try {
    //   const query = `
    //     query ProposalQuery {
    //       dao(id: ${GUILD_GNOSIS_DAO_ADDRESS_V3}) {
    //         createdAt
    //         createdBy
    //         txHash
    //         proposals(
    //      where: { createdAt_lt: 6000 }
    //     orderBy: createdAt
    //     orderDirection: desc
    //    ) {
    //           id
    //      createdAt
    //      createdBy
    //      proposedBy
    //      proposerMembership
    //      dao
    //      proposalId
    //      proposalData
    //      votingStarts
    //      votingEnds
    //      expiration
    //      actionGasEstimate
    //      details
    //      sponsor
    //      sponsorMembership
    //      proposalOffering
    //      tributeOffered
    //      proposalType
    //      title
    ////         }
    //       }
    //     }
    // `;

    const query = `
    query ProposalQuery {
      dao(id: "${GUILD_GNOSIS_DAO_ADDRESS_V3}") {
        createdAt
        createdBy
        txHash
        proposals(first: 1) {
          id 
          createdAt 
          createdBy 
          proposedBy 
          proposerMembership 
          dao 
          proposalId 
          proposalData 
          votingStarts 
          votingEnds 
          expiration 
          actionGasEstimate 
          details 
          sponsor
          sponsorMembership 
          proposalOffering 
          tributeOffered
          proposalType 
          title
          
        }
      }
    }
  `;
    const response = await axios.post(DAOHAUS_V3_GNOSIS_SUBGRAPH_URL, {
      query,
    });

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    console.log("100%", response.data.data.dao.proposals);

    return response.data.data.dao.proposals;
  } catch (err) {
    //discordLogger(JSON.stringify(err), client);
    return JSON.stringify(err);
  }
};

// Query the proposals that have entered voting less than 10 minutes ago, BUT were created more than 10 minutes ago
// This way we exclude duplicate notifications
export const getProposalsEnteredVoting = async () => {
  try {
    const query = `
    query ProposalQuery {
      dao(id: "${GUILD_GNOSIS_DAO_ADDRESS_V3}") {
        createdAt
        createdBy
        txHash
        proposals(where: { votingStarts_gt: ${
          Date.now() - 10 * 60 * 1000
        }, createdAt_lte: ${Date.now() - 10 * 60 * 1000} }
            orderBy: votingStarts
            orderDirection: desc
          ) {
          id 
          createdAt 
          createdBy 
          proposedBy 
          proposerMembership 
          dao 
          proposalId 
          proposalData 
          votingStarts 
          votingEnds 
          expiration 
          actionGasEstimate 
          details 
          sponsor
          sponsorMembership 
          proposalOffering 
          tributeOffered
          proposalType 
          title
        }
      }
    }
  `;
    const response = await axios.post(DAOHAUS_V3_GNOSIS_SUBGRAPH_URL, {
      query,
    });

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    console.log("100%", response.data.data.dao.proposals);

    return response.data.data.dao.proposals;
  } catch (err) {
    //discordLogger(JSON.stringify(err), client);
    return JSON.stringify(err);
  }
};

export function parseProposalDetails(details_str: string) {
  const details = JSON.parse(details_str);
  return {
    title: details["title"],
    description: details["description"],
  };
}

export function constructFields(proposal: Proposal) {
  const fields: any[] = [];
  const date = new Date();

  if (proposal.createdBy) {
    fields.push({
      name: "Created by:",
      value: proposal.createdBy,
      inline: true,
    });
  }

  if (proposal.proposedBy) {
    fields.push({
      name: "Proposed by:",
      value: `${proposal.proposedBy}, (${proposal.proposerMembership})`,
      inline: true,
    });
  }

  if (proposal.txHash) {
    fields.push({
      name: "Transaction Hash:",
      value: proposal.txHash,
      inline: false,
    });
  }

  if (proposal.proposalType) {
    fields.push({ name: "Type:", value: proposal.proposalType, inline: true });
  }

  if (proposal.actionGasEstimate) {
    fields.push({
      name: "Estimated gas necessary:",
      value: proposal.actionGasEstimate.toString(),
      inline: true,
    });
  }

  if (proposal.proposalOffering) {
    fields.push({
      name: "Tribute amount at submission:",
      value: proposal.proposalOffering.toString(),
      inline: true,
    });
  }

  if (proposal.tributeOffered) {
    fields.push({
      name: "Tribute amount offered:",
      value: proposal.tributeOffered.toString(),
      inline: true,
    });
  }

  const remaining_time =
    proposal.votingStarts < date.getTime()
      ? proposal.votingEnds - date.getTime()
      : proposal.votingStarts - date.getTime();

  const seconds = Math.floor(remaining_time / 1000);
  const hours = Math.floor(seconds / 3600);
  const remainingSeconds = seconds % 3600;

  fields.push({
    name:
      proposal.votingStarts < date.getTime()
        ? "Voting time left:"
        : "Voting starts in:",
    value: `${hours}h ${remainingSeconds}s`,
    inline: true,
  });

  return fields;
}

export function createEmbed(
  proposal: Proposal,
  new_proposal: boolean,
  details: { title: string; description: string },
  fields: any[]
) {
  const title = new_proposal
    ? `New proposal: "${details.title}"`
    : `Proposal "${details.title}" has entered voting period`;

  return new EmbedBuilder()
    .setColor(0xff3864)
    .setTitle(title)
    .setDescription(details.description)
    .addFields(fields)
    .setThumbnail("https://avatars.githubusercontent.com/u/59065542?s=200&v=4")
    .setTimestamp();
}

export function startPolling(channel: TextChannel, embed: EmbedBuilder) {
  setInterval(() => {
    channel.send({ embeds: [embed] });
  }, 10 * 1000); // TESTING CODE
  // ACTUAL CODE: }, 10 * 60 * 1000); // 10 minutes
}
