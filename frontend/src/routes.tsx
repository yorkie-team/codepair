import CodePairError from "./components/common/CodePairError";
import GuestRoute from "./components/common/GuestRoute";
import PrivateRoute from "./components/common/PrivateRoute";
import DocumentLayout from "./components/layouts/DocumentLayout";
import MainLayout from "./components/layouts/MainLayout";
import SettingLayout from "./components/layouts/SettingLayout";
import WorkspaceLayout from "./components/layouts/WorkspaceLayout";
import Index from "./pages/Index";
import CallbackIndex from "./pages/auth/callback/Index";
import NotFound from "./pages/error";
import ProfileIndex from "./pages/settings/profile/Index";
import WorkspaceIndex from "./pages/workspace/Index";
import DocumentIndex from "./pages/workspace/document/Index";
import DocumentShareIndex from "./pages/workspace/document/share/Index";
import JoinIndex from "./pages/workspace/join/Index";
import MemberIndex from "./pages/workspace/member/Index";

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
	PRIVATE, // Authorized user can access only
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
			{
				path: "member",
				element: <MemberIndex />,
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
	{
		path: "/404",
		accessType: AccessType.PUBLIC,
		element: <NotFound />,
	},
	{
		path: "settings/profile",
		accessType: AccessType.PRIVATE,
		element: <SettingLayout />,
		children: [
			{
				path: "",
				element: <ProfileIndex />,
			},
		],
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
