import EditorLayout from "./components/layouts/EditorLayout";
import EditorIndex from "./pages/editor/Index";
import MainLayout from "./components/layouts/MainLayout";
import Index from "./pages/Index";
import CallbackIndex from "./pages/auth/callback/Index";
import ProtectedRoute from "./components/common/ProtectedRoute";

const codePairRoutes = [
	{
		path: "/",
		private: false,
		element: <MainLayout />,
		children: [
			{
				path: "/",
				element: <Index />,
			},
		],
	},
	{
		path: "/:documentId",
		private: true,
		element: <EditorLayout />,
		children: [
			{
				path: "",
				element: <EditorIndex />,
			},
		],
	},
	{
		path: "auth/callback",
		private: false,
		element: <CallbackIndex />,
	},
];

const injectProtectedRoute = (routes: typeof codePairRoutes) => {
	return routes.map((route) => {
		if (route.private) {
			route.element = <ProtectedRoute>{route.element}</ProtectedRoute>;
		}

		return route;
	});
};

export const routes = injectProtectedRoute(codePairRoutes);
