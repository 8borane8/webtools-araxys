import type * as telegrafTypes from "telegraf/types";
import type * as telegraf from "telegraf";

export type RenderButtons = (
	ctx: telegraf.Context,
	name: string,
) =>
	| Promise<telegraf.Types.Markup<telegrafTypes.InlineKeyboardMarkup>>
	| telegraf.Types.Markup<telegrafTypes.InlineKeyboardMarkup>;
