import EditorLayout from "./components/layouts/EditorLayout";
import EditorIndex from "./pages/editor/Index";
import MainLayout from "./components/layouts/MainLayout";
import Index from "./pages/Index";
import CallbackIndex from "./pages/auth/callback/Index";
import WorkspaceLayout from "./components/layouts/WorkspaceLayout";
import GuestRoute from "./components/common/GuestRoute";
import PrivateRoute from "./components/common/PrivateRoute";

const enum AccessType {
	PRIVATE, // Authroized user can access only
	PUBLIC, // Everyone can access
	GUEST, // Not authorized user can access only
}

const codePairRoutes = [
	{
		path: "",
		accessType: AccessType.GUEST,
		element: <MainLayout />,
		children: [
			{
				path: "",
				element: <Index />,
			},
		],
	},
	{
		path: "workspace",
		accessType: AccessType.PRIVATE,
		element: <MainLayout />,
		children: [
			{
				path: ":workspaceId",
				element: <WorkspaceLayout />,
			},
		],
	},
	{
		path: ":documentId",
		accessType: AccessType.PUBLIC,
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
		accessType: AccessType.GUEST,
		element: <CallbackIndex />,
	},
];

const injectProtectedRoute = (routes: typeof codePairRoutes) => {
	return routes.map((route) => {
		if (route.accessType === AccessType.PRIVATE) {
			route.element = <PrivateRoute>{route.element}</PrivateRoute>;
		} else if (route.accessType === AccessType.GUEST) {
			route.element = <GuestRoute>{route.element}</GuestRoute>;
		}

		return route;
	});
};

export const routes = injectProtectedRoute(codePairRoutes);
