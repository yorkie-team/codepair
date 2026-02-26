export type TagMeta = {
	label?: string;
	bg: string;
	fg: string;
	description?: string;
};

export const TAGS = {
	bug: { bg: "#d73a4a", fg: "#ffffff", description: "an unexpected problem" },
	documentation: { bg: "#0075ca", fg: "#ffffff", description: "a need for improvements" },
	duplicate: { bg: "#cfd3d7", fg: "#24292e", description: "similar issues" },
	enhancement: { bg: "#a2eeef", fg: "#0b4f6c", description: "new feature requests" },
	"good first issue": {
		bg: "#7057ff",
		fg: "#ffffff",
		description: "a good issue for first-time contributors",
	},
	"help wanted": {
		bg: "#008672",
		fg: "#ffffff",
		description: "a maintainer wants help on an issue",
	},
	invalid: { bg: "#e4e669", fg: "#24292e", description: "an issue is no longer relevant" },
	question: { bg: "#d876e3", fg: "#ffffff", description: "an issue needs more information" },
	wontfix: { bg: "#ffffff", fg: "#24292e", description: "work won't continue on an issue" },
} as const satisfies Record<string, TagMeta>;

export type TagType = keyof typeof TAGS;

export const ALL_TAGS = Object.keys(TAGS) as (keyof typeof TAGS)[];
