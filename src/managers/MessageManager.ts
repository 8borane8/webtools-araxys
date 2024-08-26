import * as path from "@std/path";
import * as fs from "@std/fs";

import type { Message } from "../interfaces/Message.ts";

export class MessageManager {
	private readonly messages: Array<Message> = [];

	constructor(private readonly workspace: string) {}

	public async load() {
		for (const walkEntry of fs.walkSync(`${this.workspace}/messages`, { includeDirs: false })) {
			const dynamicImport = await import(path.toFileUrl(walkEntry.path).toString());
			const message: Message = dynamicImport.default;

			this.messages.push(message);
		}
	}

	public getMessage(name: string): Message | null {
		return this.messages.find((message) => message.name == name) || null;
	}
}
