import DocumentIndex from "./pages/workspace/document/Index";
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
import DocumentShareIndex from "./pages/workspace/document/share/Index";

interface CodePairRoute {
	path: string;
	accessType?: AccessType;
	element: JSX.Element;
	errorElement?: JSX.Element;
	children?: {
		path: string;
		element: JSX.Element;
		accessType?: AccessType;
	}[];
}

const enum AccessType {
	PUBLIC, // Everyone can access (Default)
	PRIVATE, // Authroized user can access only
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
		path: ":workspaceSlug",
		element: <DocumentLayout />,
		children: [
			{
				path: ":documentId",
				accessType: AccessType.PRIVATE,
				element: <DocumentIndex />,
			},
			{
				path: ":documentId/share",
				accessType: AccessType.PUBLIC,
				element: <DocumentShareIndex />,
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

const injectProtectedRoute = (routes: Array<CodePairRoute>) => {
	const injectProtectedComp = (route: CodePairRoute) => {
		if (route.accessType === AccessType.PRIVATE) {
			route.element = <PrivateRoute>{route.element}</PrivateRoute>;
		} else if (route.accessType === AccessType.GUEST) {
			route.element = <GuestRoute>{route.element}</GuestRoute>;
		}

		return route;
	};

	return routes.map((route) => {
		route = injectProtectedComp(route);

		if (route?.children) {
			route.children = route.children.map((route) => injectProtectedComp(route));
		}

		route.errorElement = <CodePairError />;

		return route;
	});
};

export const routes = injectProtectedRoute(codePairRoutes);
