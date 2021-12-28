import { Client, Collection } from 'discord.js';
import path from 'path';
import { readdirSync } from 'fs';
import { Command, Event, Config, Tokens } from '~/Interfaces';
import ConfigJson from '@/config.json';
import TokensJson from '@/tokens.json';

import * as firestorm from 'firestorm-db';
import { init } from '~/functions/commandProcess';

class ExtendedClient extends Client {
	public commands: Collection<string, Command> = new Collection();
	public aliases: Collection<string, Command> = new Collection();
	public events: Collection<string, Event> = new Collection();
	public config: Config = ConfigJson;
	public tokens: Tokens = TokensJson;
	public ownerIDs: string[];
	public categorys = readdirSync(path.join(__dirname, '..', 'Commands'));

	public async init() {
		this.login(this.tokens.token);
		init(this);
		firestorm.address(this.config.firestormUrl);
		firestorm.token(this.tokens.firestormToken);

		//command handling
		const commandPath = path.join(__dirname, '..', 'Commands');
		readdirSync(commandPath).forEach((dir) => {
			const commands = readdirSync(`${commandPath}/${dir}`).filter((file) => file.endsWith('.ts'));

			for (const file of commands) {
				const { command } = require(`${commandPath}/${dir}/${file}`);
				this.commands.set(command.name, command);

				if (command.aliases) {
					if (command.aliases.length !== 0) {
						command.aliases.forEach((alias) => {
							this.aliases.set(alias, command);
						});
					}
				}
			}
		});

		//event handling
		const eventPath = path.join(__dirname, '..', 'Events');
		readdirSync(eventPath).forEach(async (file) => {
			const { event } = await import(`${eventPath}/${file}`);
			this.events.set(event.name, event);
			this.on(event.name, event.run.bind(null, this));
		});
	}
}
export default ExtendedClient;
