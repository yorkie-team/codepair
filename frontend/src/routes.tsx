import DocumentIndex from "./pages/document/Index";
import MainLayout from "./components/layouts/MainLayout";
import LoginIndex from "./pages/login/Index";
import CallbackIndex from "./pages/auth/callback/Index";
import WorkspaceLayout from "./components/layouts/WorkspaceLayout";
import GuestRoute from "./components/common/GuestRoute";
import PrivateRoute from "./components/common/PrivateRoute";
import WorkspaceIndex from "./pages/workspace/Index";
import CodePairError from "./components/common/CodePairError";
import JoinIndex from "./pages/workspace/join/Index";
import Index from "./pages/Index";
import DocumentLayout from "./components/layouts/DocumentLayout";

interface CodePairRoute {
	path: string;
	accessType: AccessType;
	element: JSX.Element;
	errorElement?: JSX.Element;
	children?: {
		path: string;
		element: JSX.Element;
	}[];
}

const enum AccessType {
	PRIVATE, // Authroized user can access only
	PUBLIC, // Everyone can access
	GUEST, // Not authorized user can access only
}

const codePairRoutes: Array<CodePairRoute> = [
	{
		path: "",
		accessType: AccessType.GUEST,
		element: <MainLayout />,
		children: [
			{
				path: "",
				element: <Index />,
			},
			{
				path: "login",
				element: <LoginIndex />,
			},
		],
	},
	{
		path: ":workspaceSlug",
		accessType: AccessType.PRIVATE,
		element: <WorkspaceLayout />,
		children: [
			{
				path: "",
				element: <WorkspaceIndex />,
			},
		],
	},
	{
		path: "document",
		accessType: AccessType.PUBLIC,
		element: <DocumentLayout />,
		children: [
			{
				path: ":documentSlug",
				element: <DocumentIndex />,
			},
		],
	},
	{
		path: "auth/callback",
		accessType: AccessType.GUEST,
		element: <CallbackIndex />,
	},
	{
		path: "join/:invitationToken",
		accessType: AccessType.PRIVATE,
		element: <JoinIndex />,
	},
];

const injectProtectedRoute = (routes: typeof codePairRoutes) => {
	return routes.map((route) => {
		if (route.accessType === AccessType.PRIVATE) {
			route.element = <PrivateRoute>{route.element}</PrivateRoute>;
		} else if (route.accessType === AccessType.GUEST) {
			route.element = <GuestRoute>{route.element}</GuestRoute>;
		}

		route.errorElement = <CodePairError />;

		return route;
	});
};

export const routes = injectProtectedRoute(codePairRoutes);
