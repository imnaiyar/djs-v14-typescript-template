import {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  PermissionFlagsBits,
  Routes,
  OAuth2Scopes,
  TextChannel,
  Webhook,
  ApplicationCommand,
} from "discord.js";
import { SlashCommand, Button, PrefixCommand, ContextMenuCommand } from "#structures";
import config from "#src/config";
import { recursiveReadDir } from "#libs/recursiveReadDir";
import { logger as Logger } from "#handlers";
import path from "node:path";
import chalk from "chalk";
import { table } from "table";
import { pathToFileURL } from "node:url";

/** The bot's client */
export class Bot extends Client<true> {
  /** Configurations for the bot */
  public config = config;

  /** Collection of Slash Commands */
  public commands = new Collection<string, SlashCommand>();

  /** Collection of Prefix Commands */
  public prefix= new Collection<string, PrefixCommand>();

  /** Collection of Context Menu Commands */
  public contexts = new Collection<string, ContextMenuCommand>();

  /** Collection of Buttons */
  public buttons = new Collection<string, Button>();

  /** Collection of command cooldowns */
  public cooldowns = new Collection<string, Collection<string, number>>();

  /** Custom logger */
  public logger = Logger;

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.GuildMessageReactions,
      ],
      partials: [Partials.Channel, Partials.GuildMember, Partials.Message],
      allowedMentions: {
        repliedUser: false,
      },
    });
  }

  /**
   * Load all events from the specified directory
   * @param directory
   */
  public async loadEvents(directory: string): Promise<void> {
    this.logger.log(chalk.blueBright("<------------ Loading Events --------------->"));
    let success = 0;
    let failed = 0;
    const clientEvents: unknown[][] = [];
    const files = recursiveReadDir(directory);

    for (const filePath of files) {
      const file = path.basename(filePath);
      try {
        const eventName = path.basename(file, ".js");
        const { default: event } = await import(pathToFileURL(filePath).href);

        this.on(eventName, event.bind(null, this));
        clientEvents.push([file, "✓"]);
        success += 1;
      } catch (ex) {
        failed += 1;
        Logger.error(`loadEvent - ${file}`, ex);
      }
    }

    this.logger.log(
      `\n${table(clientEvents, {
        header: {
          alignment: "center",
          content: "Client Events",
        },
        singleLine: true,
        columns: [{ width: 25 }, { width: 5, alignment: "center" }],
      })}`,
    );

    Logger.log(`Loaded ${success + failed} events. Success (${success}) Failed (${failed})`);
  }

  /**
   * Load slash command to client on startup
   * @param dir The command directory
   * TODO: Add validation for commands
   */
  public async loadSlashCmd(dir: string): Promise<void> {
    this.logger.log(chalk.blueBright("<------------ Loading Slash ---------------->"));
    let added = 0;
    let failed = 0;
    const files = recursiveReadDir(dir, ["sub"]);
    for (const filePath of files) {
      const file = path.basename(filePath);
      try {
        const { default: cmd } = await import(pathToFileURL(filePath).href);
        const command = cmd as SlashCommand;
        if (this.commands.has(command.data.name)) throw new Error("The command already exists");
        // const vld = cmdValidation(command, file);
        // if (!vld) return;
        if (typeof command !== "object") continue;
        this.commands.set(command.data.name, command);
        this.logger.log(`Loaded ${command.data.name}`);
        added++;
      } catch (err) {
        failed++;
        Logger.error(`loadSlashCmds - ${file}`, err);
      }
    }

    this.logger.log(`Loaded ${added} Slash Commands. Failed ${failed}`);
  }

  /**
   * Load context menu commands to client on startup
   * @param dir The command directory
   * TODO: Add validation for commands
   */
  public async loadContextCmd(dir: string): Promise<void> {
    this.logger.log(chalk.blueBright("<------------ Loading Contexts ---------------->"));
    let added = 0;
    let failed = 0;
    const files = recursiveReadDir(dir, ["sub"]);
    for (const filePath of files) {
      const file = path.basename(filePath);
      try {
        const { default: cmd } = await import(pathToFileURL(filePath).href);
        const command = cmd as ContextMenuCommand;
        if (typeof command !== "object") continue;
        if (this.contexts.has(command.data.name + command.data.type.toString())) throw new Error("The command already exists");
        // const vld = cmdValidation(command, file);
        // if (!vld) return;
        this.contexts.set(command.data.name + command.data.type.toString(), command);
        this.logger.log(`Loaded ${command.data.name}`);
        added++;
      } catch (err) {
        failed++;
        Logger.error(`loaContextCmds - ${file}`, err);
      }
    }

    this.logger.log(`Loaded ${added} Context Menu Commands. Failed ${failed}`);
  }

  /**
   * Load buttons to client on startup
   * @param dir The butoons directory
   */
  public async loadButtons(dir: string): Promise<void> {
    this.logger.log(chalk.blueBright("<------------ Loading Buttons -------------->"));
    let added = 0;
    let failed = 0;
    const files = recursiveReadDir(dir);
    for (const filePath of files) {
      const file = path.basename(filePath);

      try {
        const { default: btn } = await import(pathToFileURL(filePath).href);
        const button = btn as Button;
        if (this.buttons.has(button.data.name)) throw new Error("The command already exists");
        if (typeof button !== "object") continue;
        this.buttons.set(button.data.name, button);
        this.logger.log(`Loaded ${button.data.name}`);
        added++;
      } catch (ex) {
        failed += 1;
        Logger.error(`${file}`, ex);
      }
    }
    this.logger.log(`Loaded ${added} buttons. Failed ${failed}`);
  }

  /**
   * Load prefix command on startup
   * @param dir
   */
  public async loadPrefix(dir: string): Promise<void> {
    this.logger.log(chalk.blueBright("<------------ Loading Prefix --------------->"));
    let added = 0;
    let failed = 0;
    const files = recursiveReadDir(dir);
    for (const filePath of files) {
      const file = path.basename(filePath);
      try {
        const { default: cmd } = await import(pathToFileURL(filePath).href);
        const command = cmd as PrefixCommand;
        if (this.prefix.has(command.data.name)) throw new Error("The command already exists");
        if (typeof command !== "object") continue;
        this.prefix.set(command.data.name, command);
        command.data?.aliases?.forEach((al: string) => this.prefix.set(al, command));
        this.logger.log(`Loaded ${command.data.name}`);
        added++;
      } catch (err) {
        failed++;
        Logger.error(`${file}`, err);
      }
    }

    this.logger.log(`Loaded ${added} Prefix Commands. Failed ${failed}`);
  }

  /**
   * Register Slash Commands
   */
  public async registerCommands(): Promise<void> {
    const toRegister: SlashCommand["data"] | ContextMenuCommand["data"][] = [];
    this.commands
      .map((cmd) => ({
        name: cmd.data.name,
        description: cmd.data.description,
        type: 1,
        options: cmd.data?.options,
        integration_types: cmd.data.integration_types,
        ...(cmd.data.userPermissions && {
          default_member_permissions: cmd.data.userPermissions
            .reduce(
              (accumulator: bigint, permission) =>
                accumulator | PermissionFlagsBits[permission as unknown as keyof typeof PermissionFlagsBits],
              BigInt(0),
            )
            .toString(),
        }),
        contexts: cmd.data.contexts,
      }))
      .forEach((s) => toRegister.push(s));

    this.contexts
      .map((cmd) => ({
        name: cmd.data.name,
        type: cmd.data.type,
        integration_types: cmd.data.integration_types,
        contexts: cmd.data.contexts,
        ...(cmd.data.userPermissions && {
          default_member_permissions: cmd.data.userPermissions
            .reduce(
              (accumulator: bigint, permission) =>
                accumulator | PermissionFlagsBits[permission as unknown as keyof typeof PermissionFlagsBits],
              BigInt(0),
            )
            .toString(),
        }),
      }))
      .forEach((s) => toRegister.push(s));
    await this.rest.put(Routes.applicationCommands(this.user.id), {
      body: toRegister,
    });

    this.logger.success("Successfully registered interactions");
  }

  /**
   * Get bot's invite
   */
  public getInvite(): string {
    return this.generateInvite({
      scopes: ["bot", "application.commands"] as unknown as OAuth2Scopes[],
      permissions: 412317243584n,
    });
  }

  /**
   * @param channel Channel where webhook is to be created
   * @param reason The reason for webhooks creation
   */
  public async createWebhook(channel: TextChannel, reason: string): Promise<Webhook> {
    const webhook = await channel.createWebhook({
      name: "Bot",
      avatar: this.user.displayAvatarURL(),
      reason: reason ? reason : "Bot Webhook",
    });
    return webhook;
  }

  /**
   * get commands from client application
   * @param value - command name or id
   */
  public async getCommand(value: string | number): Promise<ApplicationCommand> {
    if (!value) throw new Error('Command "name" or "id" must be passed as an argument');
    await this.application.commands.fetch();
    const command =
      typeof value === "string" && isNaN(value as unknown as number)
        ? this.application.commands.cache.find((cmd) => cmd.name === value.toLowerCase())
        : !isNaN(value as unknown as number)
          ? this.application.commands.cache.get(value.toString())
          : (() => {
              throw new Error("Provided Value Must Either be a String or a Number");
            })();
    if (!command) throw new Error("No matching command found");
    return command;
  }
}
