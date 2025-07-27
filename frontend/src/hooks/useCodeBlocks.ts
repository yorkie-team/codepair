import { useCallback, useState } from "react";

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

	/**
	 * Function to detect and manage code blocks in the DOM
	 * @param containerRef Container element to search for code blocks
	 */
	const detectCodeBlocks = useCallback((containerRef: React.RefObject<HTMLDivElement>) => {
		if (!containerRef.current) return;

		const preElements = containerRef.current.querySelectorAll("pre");
		const newCodeBlocks: CodeBlock[] = [];

		preElements.forEach((preElement, index) => {
			const codeElement = preElement.querySelector("code");
			if (!codeElement) return;

			const codeText = codeElement.textContent || "";
			const blockId = `code-block-${index}`;

			if (preElement.getAttribute("data-block-id")) return;

			preElement.setAttribute("data-block-id", blockId);

			const wrapper = document.createElement("div");
			wrapper.className = "code-block-wrapper";
			wrapper.style.position = "relative";
			wrapper.setAttribute("data-block-id", blockId);

			preElement.parentNode?.insertBefore(wrapper, preElement);
			wrapper.appendChild(preElement);

			const portalContainer = document.createElement("div");
			portalContainer.className = "copy-button-container";
			portalContainer.setAttribute("data-block-id", blockId);
			wrapper.appendChild(portalContainer);

			newCodeBlocks.push({
				id: blockId,
				text: codeText,
				container: portalContainer,
			});
		});

		setCodeBlocks(newCodeBlocks);
	}, []);

	return {
		codeBlocks,
		detectCodeBlocks,
	};
};
