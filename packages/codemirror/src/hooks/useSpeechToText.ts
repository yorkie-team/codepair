import { useCallback, useEffect, useRef, useState } from "react";
import { useCMEditorContext } from "../CMEditorContext";

interface SpeechRecognition extends EventTarget {
	continuous: boolean;
	interimResults: boolean;
	lang: string;
	start(): void;
	stop(): void;
	abort(): void;
	onresult: (event: SpeechRecognitionEvent) => void;
	onerror: (event: SpeechRecognitionErrorEvent) => void;
	onend: () => void;
}

interface SpeechRecognitionEvent {
	results: SpeechRecognitionResultList;
	resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
	error: string;
	message: string;
}

declare global {
	interface Window {
		SpeechRecognition: new () => SpeechRecognition;
		webkitSpeechRecognition: new () => SpeechRecognition;
	}
}

export interface SpeechToTextState {
	isListening: boolean;
	interimTranscript: string;
}

interface SpeechToTextFeatureHook {
	state: SpeechToTextState;
	toggleListening: () => void;
	isSpeechRecognitionSupported: boolean;
}

export const useSpeechToText = (): SpeechToTextFeatureHook => {
	const { editorPort } = useCMEditorContext();
	const [isListening, setIsListening] = useState(false);
	const [interimTranscript, setInterimTranscript] = useState("");
	const recognitionRef = useRef<SpeechRecognition | null>(null);
	const finalTranscriptRef = useRef("");
	const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);

	useEffect(() => {
		const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		if (SpeechRecognition) {
			setIsSpeechRecognitionSupported(true);
			recognitionRef.current = new SpeechRecognition();
			recognitionRef.current.continuous = true;
			recognitionRef.current.interimResults = true;
			recognitionRef.current.lang = "ko-KR";
		}

		return () => {
			if (recognitionRef.current) {
				recognitionRef.current.abort();
			}
		};
	}, []);

	useEffect(() => {
		if (!recognitionRef.current || !editorPort) return;

		recognitionRef.current.onresult = (event) => {
			if (!editorPort) return;

			let interimTranscript = "";
			let finalTranscript = "";

			for (let i = event.resultIndex; i < event.results.length; i++) {
				const transcript = event.results[i][0].transcript;
				if (event.results[i].isFinal) {
					finalTranscript += transcript + " ";
				} else {
					interimTranscript += transcript;
				}
			}

			if (finalTranscript) {
				finalTranscriptRef.current = finalTranscript;

				const { from, to } = editorPort.getSelection();
				const newCursorPos = from + finalTranscript.length;

				editorPort.replaceRange(from, to, finalTranscript, {
					anchor: newCursorPos,
					head: newCursorPos,
				});
			}

			setInterimTranscript(interimTranscript);
		};

		recognitionRef.current.onerror = (event) => {
			console.error("Speech recognition error:", event.error);
			setIsListening(false);
		};

		recognitionRef.current.onend = () => {
			setIsListening(false);
			setInterimTranscript("");
			finalTranscriptRef.current = "";
		};
	}, [editorPort]);

	const toggleListening = useCallback(() => {
		if (!recognitionRef.current) {
			console.warn("Speech recognition is not supported in this browser");
			return;
		}

		if (isListening) {
			recognitionRef.current.stop();
			setInterimTranscript("");
		} else {
			recognitionRef.current.start();
			setIsListening(true);
			finalTranscriptRef.current = "";
		}
	}, [isListening]);

	return {
		state: {
			isListening,
			interimTranscript,
		},
		toggleListening,
		isSpeechRecognitionSupported,
	};
};

export default useSpeechToText;
