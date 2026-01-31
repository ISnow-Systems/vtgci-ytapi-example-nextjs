import {TriState} from "./ExtendUtils";

import type {SearchCondition, VideosCondition} from "./Types";


export class YouTubeAPI {
	private readonly APIEndpoint: string;

	constructor(endpoint: string = "https://infra.virtlive.jp/api/youtube/v3") {
		this.APIEndpoint = endpoint;
	}

	getSearchApiEndpoint(condition: SearchCondition): string {
		const url = new URL(`${this.APIEndpoint}/search`);
		if (condition.members != undefined) {
			url.searchParams.set("members", condition.members.join(","));
		}
		if (condition.type != undefined) {
			url.searchParams.set("type", condition.type.join(","));
		}
		if (condition.isShorts != undefined && (condition.type == undefined || condition.type.includes("video"))) {
			url.searchParams.set("shorts", TriState.condition(condition.isShorts, false) ? "yes" : "no");
		}
		if (condition.page != undefined) {
			url.searchParams.set("page", condition.page.toString());
		} else {
			url.searchParams.set("page", "1");
		}
		if (condition.limit != undefined) {
			url.searchParams.set("limit", condition.limit.toString());
		} else {
			url.searchParams.set("limit", "50");
		}
		if (condition.order != undefined) {
			url.searchParams.set("sort", condition.order.toUpperCase());
		}
		return url.toString();
	}

	getVideosApiEndpoint(condition: VideosCondition): string {
		let prefix = "";
		if (condition.isMembershipContent != undefined) {
			switch (condition.isMembershipContent) {
				case TriState.Yes:
					prefix = "membership-";
					break;
				case TriState.Default:
					prefix = "all-";
					break;
			}
		}
		const url = new URL(`${this.APIEndpoint}/${prefix}videos`);
		if (condition.type != undefined) {
			url.pathname += `/${condition.type}`;
		}
		if (condition.member != undefined) {
			url.pathname += `/${condition.member}`;
		}
		if (condition.page != undefined) {
			url.searchParams.set("page", condition.page.toString());
		} else {
			url.searchParams.set("page", "1");
		}
		if (condition.limit != undefined) {
			url.searchParams.set("limit", condition.limit.toString());
		} else {
			url.searchParams.set("limit", "50");
		}
		if (condition.order != undefined) {
			url.searchParams.set("sort", condition.order.toUpperCase());
		}
		return url.toString();
	}
}
