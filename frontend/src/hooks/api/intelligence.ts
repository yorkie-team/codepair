import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { selectAuth } from "../../store/authSlice";
import { selectDocument } from "../../store/documentSlice";
import { IntelligenceFeature } from "../../constants/intelligence";

export const useIntelligenceFeatureStream = (feature: IntelligenceFeature) => {
	const authStore = useSelector(selectAuth);
	const documentSotre = useSelector(selectDocument);
	const [data, setData] = useState<string | null>(null);
	const [memoryKey, setMemoryKey] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const mutateAsync = useCallback(
		async (content: string) => {
			setIsLoading(true);
			setMemoryKey(null);
			setData(null);
			const response = await fetch(
				`${import.meta.env.VITE_API_ADDR}/intelligence/${feature}`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${authStore.accessToken}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						documentId: documentSotre.data?.id,
						content,
					}),
				}
			);
			const reader = response.body?.getReader();
			let isFirst = true;
			let result = "";

			while (reader) {
				const { done, value } = await reader.read();
				setIsLoading(false);

				if (done) {
					break;
				}

				let text = new TextDecoder().decode(value);

				if (isFirst) {
					const splitted = text.split("\n");
					setMemoryKey(splitted[0]);
					isFirst = false;
					text = splitted.slice(1).join("\n");
				}

				result += text;
				setData(result);
			}
		},
		[authStore.accessToken, documentSotre.data?.id, feature]
	);

	return {
		data,
		memoryKey,
		isLoading,
		mutateAsync,
	};
};

export const useIntelligenceStream = (memoryKey: string | null) => {
	const authStore = useSelector(selectAuth);
	const documentSotre = useSelector(selectDocument);
	const [data, setData] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const mutateAsync = useCallback(
		async (content: string) => {
			if (!memoryKey) return;

			setIsLoading(true);
			setData(null);
			const response = await fetch(`${import.meta.env.VITE_API_ADDR}/intelligence`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${authStore.accessToken}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					documentId: documentSotre.data?.id,
					memoryKey,
					content,
				}),
			});
			const reader = response.body?.getReader();
			let result = "";

			while (reader) {
				const { done, value } = await reader.read();
				setIsLoading(false);

				if (done) {
					break;
				}

				const text = new TextDecoder().decode(value);

				result += text;
				setData(result);
			}
		},
		[authStore.accessToken, documentSotre.data?.id, memoryKey]
	);

	return {
		data,
		memoryKey,
		isLoading,
		mutateAsync,
	};
};
