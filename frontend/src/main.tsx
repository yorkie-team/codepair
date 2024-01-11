import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import EditorLayout from "./components/layouts/EditorLayot";
import EditorIndex from "./pages/editor/Index";

const router = createBrowserRouter([
	{
		path: "/",
		element: <EditorLayout />,
		children: [
			{
				path: ":documentId",
				element: <EditorIndex />,
			},
		],
	},
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);
