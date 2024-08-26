import type * as telegrafTypes from "telegraf/types";
import type * as telegraf from "telegraf";

import type { RenderContent } from "./RenderContent.ts";
import type { RenderButtons } from "./RenderButtons.ts";
import type { OnMessage } from "./OnMessage.ts";
import type { OnLoad } from "./OnLoad.ts";

export interface Message {
	readonly name: string;

	readonly content: RenderContent | string;
	readonly buttons: RenderButtons | telegraf.Types.Markup<telegrafTypes.InlineKeyboardMarkup>;

	readonly onload: OnLoad | null;
	readonly onmessage: OnMessage | null;
}
