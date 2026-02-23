export type EditorPosition = number | number[];

export interface EditorPort {
	getSelection(): { from: EditorPosition; to: EditorPosition };
	replaceRange(
		from: EditorPosition,
		to: EditorPosition,
		insert: string,
		selection?: { anchor: EditorPosition; head?: EditorPosition }
	): void;
	scrollIntoView(pos: EditorPosition): void;
	getContentWidth(): number;
	getContent(): string;
}
