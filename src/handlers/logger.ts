import { EmbedBuilder, WebhookClient } from "discord.js";
import * as pino from "pino";
const webhookLogger = process.env.ERROR_LOGS ? new WebhookClient({ url: process.env.ERROR_LOGS }) : undefined;

const pinoLogger = pino.default(
  {
    level: "debug",
  },
  pino.multistream([
    {
      level: "info",
      stream: pino.transport({
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:default",
          ignore: "pid,hostname",
          singleLine: false,
          hideObject: false,
          customColors: "info:green,warn:yellow,error:red,message:white,",
        },
      }),
    },
    {
      level: "debug",
      stream: pino.destination({
        dest: `${process.cwd()}/logs/combined-${new Date().getFullYear()}.${
          new Date().getMonth() + 1
        }.${new Date().getDate()}.log`,
        sync: true,
        mkdir: true,
      }),
    },
  ]),
);

async function sendWebhook(content: any, err?: any): Promise<void> {
  if (!content && !err) return;
  const errStr: string = content?.stack || err?.stack || content || err;

  const embed = new EmbedBuilder().setColor("Blue").setAuthor({ name: err?.name ?? "Error" });

  embed.setDescription(`\`\`\`js\n${errStr.substring(0, 2048)}\`\`\``);
  embed.addFields({
    name: "Description",
    value: `${content?.message || content || err?.message || "NA"}`,
  });

  webhookLogger?.send({ username: "Logs", embeds: [embed] }).catch(() => {});
}

/**
 * Custom logger
 */
export default class {
  /**
   * @param content
   */
  static success(content: string) {
    pinoLogger.info(content);
  }

  /**
   * @param content
   */
  static log(content: string) {
    pinoLogger.info(content);
  }

  /**
   * @param content
   */
  static warn(content: string) {
    pinoLogger.warn(content);
  }

  /**
   * @param content
   * @param ex
   */
  static error(content: any, ex?: any) {
    if (ex) {
      pinoLogger.error(ex, `${content}: ${ex?.message}`);
    } else {
      pinoLogger.error(content);
    }
    if (webhookLogger) sendWebhook(content, ex);
  }

  /**
   * @param content
   */
  static debug(content: string) {
    pinoLogger.debug(content);
  }
}
