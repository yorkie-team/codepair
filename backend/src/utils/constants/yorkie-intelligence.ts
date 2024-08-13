import { ConfigService } from "@nestjs/config";

export enum IntelligenceFeature {
	GITHUB_ISSUE = "github-issue",
	GITHUB_PR = "github-pr",
}

export const generateFeatureList = (configService: ConfigService) => {
	const generateIconUrl = (icon: string) => {
		return `${configService.get("FRONTEND_BASE_URL")}/yorkie_intelligence/${icon}`;
	};

	return [
		{
			title: "Write GitHub Issue",
			icon: generateIconUrl("github.svg"),
			feature: "github-issue",
		},
		{
			title: "Write GitHub Pull Request",
			icon: generateIconUrl("github.svg"),
			feature: "github-pr",
		},
		{
			title: "Write Document",
			icon: generateIconUrl("document.svg"),
			feature: "document-writing",
		},
	];
};
