import * as telegrafFilters from "telegraf/filters";
import * as telegraf from "telegraf";
import * as fs from "@std/fs";

import type { UserMessage } from "./interfaces/UserMessage.ts";
import { MessageManager } from "./managers/MessageManager.ts";
import type { UserConfig } from "./interfaces/UserConfig.ts";
import type { Config } from "./interfaces/Config.ts";

export class Araxys {
	private readonly users: Map<number, UserMessage> = new Map();

	public readonly bot: telegraf.Telegraf;
	private readonly messageManager: MessageManager;
	private readonly config: Config;

	constructor(
		private readonly workspace: string,
		token: string,
		userConfig: UserConfig = {},
	) {
		this.config = {
			home: userConfig.home || "home",
			photo: userConfig.photo || null,
		};

		this.bot = new telegraf.Telegraf(token);
		this.messageManager = new MessageManager(this.workspace);
	}

	public async start() {
		this.preventConfigurationErrors();

		await this.messageManager.load();

		this.preventErrors();
		this.registerEventListeners();

		console.log(`@${(await this.bot.telegram.getMe()).username} is ready !`);
		await this.bot.launch();
	}

	private preventConfigurationErrors() {
		if (!fs.existsSync(this.workspace)) {
			throw new Error("The specified workspace does not exist.");
		}
	}

	private preventErrors() {
		if (!this.messageManager.getMessage(this.config.home)) {
			throw new Error("The home message does not exist.");
		}
	}

	private registerEventListeners() {
		// deno-lint-ignore no-explicit-any
		this.bot.start(async (ctx: telegraf.Context<any>) => {
			if (ctx.chat.type != "private") {
				return;
			}

			const message = this.messageManager.getMessage(this.config.home);
			if (message == null) {
				throw new Error();
			}

			const messageOnLoad = message.onload == null
				? undefined
				: await message.onload.bind(this)(ctx, this.config.home);

			if (messageOnLoad != undefined) {
				// Redirection vers le nouveau message
			}

			const messageContent = typeof message.content == "function"
				? await message.content.bind(this)(ctx, this.config.home)
				: message.content;
			const messageButtons = typeof message.buttons == "function"
				? await message.buttons.bind(this)(ctx, this.config.home)
				: message.buttons;

			this.users.set(ctx.from!.id, { id: ctx.message.message_id, name: this.config.home });
			await ctx.deleteMessage();

			if (this.config.photo == null) {
				await ctx.reply(messageContent, {
					parse_mode: "HTML",
					reply_markup: messageButtons.reply_markup,
				});
			} else {
				await ctx.replyWithPhoto(
					this.config.photo.startsWith("https://")
						? { url: this.config.photo }
						: { source: this.config.photo },
					{
						caption: messageContent,
						parse_mode: "HTML",
						reply_markup: messageButtons.reply_markup,
					},
				);
			}
		});

		this.bot.on(
			telegrafFilters.callbackQuery(),
			// deno-lint-ignore no-explicit-any
			(ctx: telegraf.Context<any>) => this.sendMessage(ctx.update.callback_query.data, ctx),
		);

		this.bot.on(telegrafFilters.message(), async (ctx) => {
			if (ctx.chat.type != "private") {
				return;
			}

			await ctx.deleteMessage();
			if (!this.users.has(ctx.from!.id)) {
				return;
			}

			const name = this.users.get(ctx.from!.id)?.name || "";
			const message = this.messageManager.getMessage(name);
			if (message == null || message.onmessage == null) {
				return;
			}

			await message.onmessage(ctx, name);
		});
	}

	// deno-lint-ignore no-explicit-any
	public async sendMessage(name: string, ctx: telegraf.Context<any>) {
		const message = this.messageManager.getMessage(name);
		if (message == null) {
			throw new Error(`The message named "${name}" does not exist.`);
		}

		const messageOnLoad = message.onload == null ? undefined : await message.onload.bind(this)(ctx, name);
		if (messageOnLoad != undefined) {
			this.sendMessage(messageOnLoad, ctx);
			return;
		}

		const messageContent = typeof message.content == "function"
			? await message.content.bind(this)(ctx, name)
			: message.content;
		const messageButtons = typeof message.buttons == "function"
			? await message.buttons.bind(this)(ctx, name)
			: message.buttons;

		const messageId = ctx.update.callback_query == undefined
			? this.users.get(ctx.from!.id)?.id
			: ctx.update.callback_query.message.message_id;

		this.users.set(ctx.from!.id, { id: messageId, name: name });
		if (this.config.photo == null) {
			await this.bot.telegram.editMessageText(ctx.from!.id, messageId, undefined, messageContent, {
				parse_mode: "HTML",
				reply_markup: messageButtons.reply_markup,
			});
		} else {
			await this.bot.telegram.editMessageCaption(ctx.from!.id, messageId, undefined, messageContent, {
				parse_mode: "HTML",
				reply_markup: messageButtons.reply_markup,
			});
		}
	}
}
