import { useCallback, useState, useRef } from "react";

type CodeBlock = {
	id: string;
	text: string;
	container: HTMLElement;
};

/**
 * Custom hook to detect and manage code blocks in the DOM
 */
export const useCodeBlocks = () => {
	const [codeBlocks, setCodeBlocks] = useState<CodeBlock[]>([]);
	const idMapRef = useRef(new WeakMap<HTMLElement, string>());

	/**
	 * Function to detect and manage code blocks in the DOM
	 * @param containerRef Container element to search for code blocks
	 */
	const detectCodeBlocks = useCallback((containerRef: React.RefObject<HTMLDivElement>) => {
		if (!containerRef.current) return;

		const preElements = containerRef.current.querySelectorAll("pre");
		const newCodeBlocks: CodeBlock[] = [];

		preElements.forEach((preElement) => {
			const codeElement = preElement.querySelector("code");
			if (!codeElement) return;

			const codeText = codeElement.textContent || "";
			let id = idMapRef.current.get(preElement);
			if (!id) {
				id = crypto.randomUUID();
				idMapRef.current.set(preElement, id);

				const wrapper = document.createElement("div");
				wrapper.className = "code-block-wrapper";
				wrapper.style.position = "relative";

				preElement.parentNode?.insertBefore(wrapper, preElement);
				wrapper.appendChild(preElement);

				const portalContainer = document.createElement("div");
				portalContainer.className = "copy-button-container";
				wrapper.appendChild(portalContainer);

				newCodeBlocks.push({
					id: id,
					text: codeText,
					container: portalContainer,
				});
			}
		});

		setCodeBlocks(newCodeBlocks);
	}, []);

	return {
		codeBlocks,
		detectCodeBlocks,
	};
};
