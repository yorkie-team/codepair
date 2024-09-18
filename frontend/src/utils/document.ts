export function createDocumentKey() {
	return Math.random().toString(36).substring(7);
}

export function addSoftLineBreak(text: string) {
	return text
		.split("\n")
		.map((line) => {
			if (line.trim() === "") return "";
			else return line + "  ";
		})
		.join("\n");
}
