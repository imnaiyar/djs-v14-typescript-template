import { ButtonInteraction } from "discord.js";
import { type Bot } from "./Bot";
/* eslint-disable */

/** Buttons structure */
export type Button = {
  /** Button Data */
  data: {
    /** Button id (or ID starts with) */
    name: string;
  };

  /** The callback for when the button is clicked */
  execute: (interaction: ButtonInteraction, client: Bot) => Promise<void>;
};
