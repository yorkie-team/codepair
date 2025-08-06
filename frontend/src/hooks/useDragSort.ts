import { useCallback, useRef, useState } from "react";

interface DragState {
	isDragging: boolean;
	draggedIndex: number | null;
	dropIndex: number | null;
	dropIndicatorY: number;
	draggedElement: HTMLElement | null;
	startY: number;
	currentY: number;
	pointerOffset: { x: number; y: number };
}

interface UseDragSortOptions<T> {
	items: T[];
	onReorder: (newItems: T[]) => void;
	getItemKey: (item: T) => string | number;
}

interface DragHandlers {
	onPointerDown: (event: React.PointerEvent, index: number) => void;
	onPointerMove: (event: React.PointerEvent) => void;
	onPointerUp: (event: React.PointerEvent) => void;
}

export function useDragSort<T>({ items, onReorder, getItemKey }: UseDragSortOptions<T>) {
	const [dragState, setDragState] = useState<DragState>({
		isDragging: false,
		draggedIndex: null,
		dropIndex: null,
		dropIndicatorY: 0,
		draggedElement: null,
		startY: 0,
		currentY: 0,
		pointerOffset: { x: 0, y: 0 },
	});

	const containerRef = useRef<HTMLElement>(null);
	const itemRefs = useRef<Map<string | number, HTMLElement>>(new Map());

	const setItemRef = useCallback((key: string | number, element: HTMLElement | null) => {
		if (element) {
			itemRefs.current.set(key, element);
		} else {
			itemRefs.current.delete(key);
		}
	}, []);

	const calculateDropPosition = useCallback(
		(clientY: number): { dropIndex: number; dropIndicatorY: number } => {
			if (!containerRef.current) return { dropIndex: 0, dropIndicatorY: 0 };

			const containerRect = containerRef.current.getBoundingClientRect();
			const relativeY = clientY - containerRect.top;

			let dropIndex = 0;
			let dropIndicatorY = 0;

			const itemPositions: Array<{ index: number; top: number; bottom: number }> = [];

			itemRefs.current.forEach((element, key) => {
				const index = items.findIndex((item) => getItemKey(item) === key);
				if (index === -1 || index === dragState.draggedIndex) return;

				const rect = element.getBoundingClientRect();
				itemPositions.push({
					index,
					top: rect.top - containerRect.top,
					bottom: rect.bottom - containerRect.top,
				});
			});

			itemPositions.sort((a, b) => a.index - b.index);

			if (itemPositions.length === 0) {
				dropIndex = 0;
				dropIndicatorY = 10;
			} else {
				let foundPosition = false;

				for (let i = 0; i < itemPositions.length; i++) {
					const item = itemPositions[i];

					if (relativeY <= item.top) {
						dropIndex = item.index;
						dropIndicatorY = Math.max(2, item.top);
						foundPosition = true;
						break;
					} else if (relativeY <= item.bottom) {
						dropIndex = item.index + 1;
						dropIndicatorY = item.bottom;
						foundPosition = true;
						break;
					}
				}

				if (!foundPosition) {
					const lastItem = itemPositions[itemPositions.length - 1];
					dropIndex = lastItem.index + 1;
					dropIndicatorY = lastItem.bottom;
				}
			}

			if (dragState.draggedIndex !== null && dropIndex > dragState.draggedIndex) {
				dropIndex--;
			}

			return {
				dropIndex: Math.max(0, Math.min(dropIndex, items.length - 1)),
				dropIndicatorY,
			};
		},
		[items, dragState.draggedIndex, getItemKey]
	);

	const handlePointerDown = useCallback(
		(event: React.PointerEvent, index: number) => {
			if (!containerRef.current) return;

			const element = itemRefs.current.get(getItemKey(items[index]));
			if (!element) return;

			event.preventDefault();
			event.currentTarget.setPointerCapture(event.pointerId);

			const rect = element.getBoundingClientRect();
			const pointerOffset = {
				x: event.clientX - rect.left,
				y: event.clientY - rect.top,
			};

			setDragState({
				isDragging: true,
				draggedIndex: index,
				dropIndex: index,
				dropIndicatorY: 0,
				draggedElement: element,
				startY: event.clientY,
				currentY: event.clientY,
				pointerOffset,
			});

			document.body.style.userSelect = "none";
			document.body.style.touchAction = "none";
		},
		[items, getItemKey]
	);

	const handlePointerMove = useCallback(
		(event: React.PointerEvent) => {
			if (!dragState.isDragging || !containerRef.current) return;

			event.preventDefault();

			const { dropIndex, dropIndicatorY } = calculateDropPosition(event.clientY);

			setDragState((prev) => ({
				...prev,
				currentY: event.clientY,
				dropIndex,
				dropIndicatorY,
			}));
		},
		[dragState.isDragging, calculateDropPosition]
	);

	const handlePointerUp = useCallback(
		(event: React.PointerEvent) => {
			if (!dragState.isDragging || dragState.draggedIndex === null) return;

			event.preventDefault();
			event.currentTarget.releasePointerCapture(event.pointerId);

			document.body.style.userSelect = "";
			document.body.style.touchAction = "";

			if (dragState.dropIndex !== null && dragState.dropIndex !== dragState.draggedIndex) {
				const newItems = [...items];
				const [movedItem] = newItems.splice(dragState.draggedIndex, 1);
				newItems.splice(dragState.dropIndex, 0, movedItem);
				onReorder(newItems);
			}

			setDragState({
				isDragging: false,
				draggedIndex: null,
				dropIndex: null,
				dropIndicatorY: 0,
				draggedElement: null,
				startY: 0,
				currentY: 0,
				pointerOffset: { x: 0, y: 0 },
			});
		},
		[dragState, items, onReorder]
	);

	const dragHandlers: DragHandlers = {
		onPointerDown: handlePointerDown,
		onPointerMove: handlePointerMove,
		onPointerUp: handlePointerUp,
	};

	return {
		dragState,
		containerRef,
		setItemRef,
		dragHandlers,
	};
}
