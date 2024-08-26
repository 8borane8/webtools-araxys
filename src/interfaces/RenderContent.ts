import type * as telegraf from "telegraf";

export type RenderContent = (ctx: telegraf.Context) => Promise<string> | string;
