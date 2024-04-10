import {
  ContextMenuCommandInteraction,
  ApplicationCommandType,
  UserContextMenuCommandInteraction,
  MessageContextMenuCommandInteraction,
  PermissionResolvable,
} from "discord.js";
import { IntegrationTypes, ContextTypes, ContextMenuType } from "#libs/types";
import { Bot } from "#structures";
/* eslint-disable */

export interface ContextMenuCommand<Type extends ContextMenuType = null> {
  data: {
    name: string;
    type: typeof ApplicationCommandType.User | typeof ApplicationCommandType.Message;
    integration_types?: IntegrationTypes[];
    contexts?: ContextTypes[];
    userPermissions?: PermissionResolvable[];
    botPermissions?: PermissionResolvable[];
  };
  ownerOnly?: boolean;
  cooldown?: number;

  execute(
    interaction: Type extends "UserContext"
      ? UserContextMenuCommandInteraction
      : Type extends "MessageContext"
        ? MessageContextMenuCommandInteraction
        : ContextMenuCommandInteraction,
    client: Bot,
  ): Promise<void>;
}
