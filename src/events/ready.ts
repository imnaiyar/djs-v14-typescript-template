import type { Event } from "#structures";
import { EmbedBuilder, WebhookClient } from "discord.js";
const ready = process.env.READY_LOGS ? new WebhookClient({ url: process.env.READY_LOGS }) : undefined;

const readyHandler: Event<"ready"> = async (client): Promise<void> => {
  client.logger.log(`Logged in as ${client.user.tag}`);
  const readyalertemb = new EmbedBuilder()
    .addFields(
      {
        name: "Bot Status",
        value: `Total guilds: ${client.guilds.cache.size}\nTotal Users: ${client.guilds.cache.reduce(
          (size, g) => size + g.memberCount,
          0,
        )}`,
        inline: false,
      },
      /* {
        name: "Website",
        value: text,
        inline: false,
      }, */
      {
        name: "Interactions",
        value: `Loaded Interactions`,
        inline: false,
      },
      {
        name: "Success",
        value: `Bot is now online`,
      },
    )
    .setColor("Gold")
    .setTimestamp();

  // Ready alert
  if (ready) {
    ready.send({
      username: "Ready",
      avatarURL: client.user.displayAvatarURL(),
      embeds: [readyalertemb],
    });
  }
};

export default readyHandler;
