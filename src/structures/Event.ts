import { ClientEvents } from "discord.js";
import { Bot } from "./Bot.js";

export interface Event<T extends keyof ClientEvents> {
  (client: Bot, ...args: ClientEvents[T]): Promise<void>;
}
