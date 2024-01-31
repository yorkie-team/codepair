export function createDocumentKey() {
	return Math.random().toString(36).substring(7);
}

export function addSoftLineBreak(text: string) {
	return text
		.split("\n")
		.map((line) => line + "  ")
		.join("\n");
}
