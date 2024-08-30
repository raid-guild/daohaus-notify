import { Client, Events, TextChannel } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";
import { deployCommands } from "./deploy-commands";
import {
  getProposalsEnteredVoting,
  getProposalsNew,
  parseProposalDetails,
  startPolling,
  constructFields,
  createEmbed,
} from "./proposalHelpers";
import { Proposal } from "./utils/types";

const client = new Client({
  intents: ["Guilds", "GuildMessages", "DirectMessages"],
});

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  const proposals_new = await getProposalsNew();
  // console.log(`proposals_new ${proposals_new}`);
  readProposals(true, proposals_new);
  const proposals_voting = await getProposalsEnteredVoting();
  // console.log(`proposals_voting ${proposals_voting}`);
  readProposals(false, proposals_voting);
});

function readProposals(
  new_proposal: boolean,
  proposals: Array<Proposal>
): void {
  const channel = client.channels.cache.get(
    config.ANNOUNCEMENT_CHANNEL_ID
  ) as TextChannel;

  if (!channel) {
    console.error("Announcement channel not found");
    return;
  }

  proposals.forEach((proposal) => {
    const details = parseProposalDetails(proposal.details);
    const fields = constructFields(proposal);
    const embed = createEmbed(proposal, new_proposal, details, fields);
    startPolling(channel, embed);
  });
}

client.on("guildCreate", async (guild) => {
  await deployCommands({ guildId: guild.id });
});

client.on(Events.InteractionCreate, (interaction) => {
  console.log(`interactionCreate ${interaction}`);
  if (!interaction.isCommand()) {
    return;
  }
  const { commandName } = interaction;
  if (commands[commandName as keyof typeof commands]) {
    commands[commandName as keyof typeof commands].execute(interaction);
  }
});

client.login(config.DISCORD_TOKEN);
