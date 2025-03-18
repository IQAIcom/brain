import type { Wiki } from "@everipedia/iq-utils";

export interface IQWikiResponse {
	wiki?: Partial<Wiki>;
}
export interface UserWikisResponse {
	userById: {
		wikisCreated: {
			activity: [
				{
					content: Partial<Wiki>[];
				},
			];
		};
	};
}
