export interface EditorPort {
	getSelection(): { from: number; to: number };
	replaceRange(
		from: number,
		to: number,
		insert: string,
		selection?: { anchor: number; head?: number }
	): void;
	scrollIntoView(pos: number): void;
	getContentWidth(): number;
}
