import { Bot } from "#structures";

export default async (client: Bot, err: Error): Promise<void> => {
  client.logger.error(`Client Error:`, err);
};
