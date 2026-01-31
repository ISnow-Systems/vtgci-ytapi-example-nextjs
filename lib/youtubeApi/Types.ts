//APIルート構造
import type {TriState} from "./ExtendUtils";

export type VideosResponse = {
	items: VideoItems,
	results: ApiHeader
};

export type MemberResponse = {
	members: Members,
	results: ApiHeader
};

export type VideoType = ("video" | "liveBefore" | "liveNow" | "liveAfter" | "premiereBefore" | "premiereNow" | "premiereAfter");

//
export type SearchCondition = PaginationInformation & CommonVideoRequestCondition & {
	members?: string[],
};

export type VideosCondition = PaginationInformation & {
	member?: string,
	isMembershipContent?: TriState,
	type?: VideoType;
};

export type CommonVideoRequestCondition = {
	isShorts?: TriState,
	type?: VideoType[];
}

export type PaginationInformation = CommonRequestParam & {
	limit?: number,
	page?: number,
}

export type CommonRequestParam = {
	order?: "desc" | "asc"
}

///エイリアス
export type SearchResponse = VideosResponse;

//内部構造
export type ApiHeader = {
	recode: {
		totalCounts: number,
		resultCounts: number,
		updatedAt: number,
	},
	page: {
		pageLimit: number,
		currentPage: number,
		totalPages: number,
	}
};

export type Members = Member[];
export type Member = {
	/**
	 * メンバーをDB上で識別する際のID
	 */
	memberId: string,
	/**
	 * メンバーの管理上の表示名
	 */
	displayName: string,
	/**
	 * YouTubeチャンネルの一意の識別子を格納する文字列。
	 * このIDはYouTube APIやチャンネル特定時に利用される。
	 */
	youtubeChannelId: string,
	/**
	 * YouTubeアカウントのハンドル名を格納する変数。
	 * 一意な文字列でアカウントを識別します。
	 */
	youtubeHandle: string,
	/**
	 * YouTubeチャンネルの名前を格納する変数。
	 * この変数には、デフォルトの言語で記述されたチャンネル名が設定されます。
	 */
	channelName: string,
	/**
	 * YouTubeチャンネルの説明を保持する文字列。
	 * 通常、デフォルトの言語で記述され、チャンネルの概要や目的を説明します。
	 */
	channelDescription: string,
	/**
	 * ローカライズされたチャンネル情報を格納するオブジェクト。
	 * 動画のローカライズ情報と同型で管理しています。
	 *
	 * この変数は、各言語ごとのチャンネル情報を処理する際に使用され、
	 * 各プロパティには対応するローカライズ済みのデータが設定されます。
	 *
	 * 注意: 処理の簡略化のため、動画のローカライズ情報と同じ型を利用しています。
	 */
	localizations: LocalizedVideoInformation
	/**
	 * チャンネル登録者数を保持する変数です。
	 * 有効数字は3桁までを基準としますが、稀に値が隠される場合があります。
	 * UIや分析など、登録者数の表示や利用に使用されます。
	 */
	subscribersCount?: number,
	/**
	 * ユーザーがYouTube上に投稿した動画の数を示します。
	 * 注意: この数値はデータベースにキャッシュされている動画情報の数とは一致しない可能性があります。
	 */
	videoCount: number,
	/**
	 * メンバーが投稿した動画の視聴回数の合計を管理するプロパティ。
	 * 動画が投稿されていない場合（videoCount が 0）であれば、この値も 0 となる。
	 */
	viewCount: number,
	/**
	 * メンバーシップ機能の有効状態を示すフラグ。
	 *
	 * この変数は、メンバーシップ機能が有効化されており、少なくとも1つのメンバー限定動画が投稿されているかどうかを判定します。
	 * 具体的には、該当するプレイリスト（プレイリストIDが「UUMO」で始まるもの）に1つ以上のコンテンツが存在している場合に `true` となります。
	 *
	 * @type {boolean}
	 */
	isMembershipAvailable: boolean,
	// YouTubeチャンネルへのリンク
	url: string,
	/**
	 * YouTubeが自動生成する特別なプレイリストの情報を格納するオブジェクト。
	 *
	 * このオブジェクトには、アップロード動画や人気動画、ライブストリームなどの
	 * 特定カテゴリに基づくプレイリストのデータが含まれています。
	 * プレイリストの中には存在がオプショナル（条件によって生成されない）なものもあります。
	 *
	 * 構造:
	 * - allUploads: すべてのアップロード動画のプレイリスト。
	 * - uploadVideos: ユーザーがアップロードした動画のみを含むプレイリスト。
	 * - popularVideos: 人気動画を集めたプレイリスト。
	 * - liveStreams: ライブストリーム動画を集めたプレイリスト。
	 * - membershipVideos: メンバーシップに関連する動画のプレイリスト。（オプショナル）
	 * - membershipContents: メンバーシップ向けコンテンツ全体のプレイリスト。（オプショナル）
	 * - membershipShorts: メンバーシップ向けのショート動画のプレイリスト。（オプショナル）
	 * - membershipLiveStreams: メンバーシップ向けのライブストリーム動画のプレイリスト。（オプショナル）
	 * - popularShorts: 人気のショート動画を集めたプレイリスト。
	 * - popularLiveStreams: 人気のライブストリーム動画を集めたプレイリスト。
	 * - shorts: ユーザーが投稿したショート動画全体のプレイリスト。
	 */
	auto_playlists: {
		allUploads: Playlist,
		uploadVideos: Playlist,
		popularVideos: Playlist,
		liveStreams: Playlist,
		membershipVideos?: Playlist,
		membershipContents?: Playlist,
		membershipShorts?: Playlist,
		membershipLiveStreams?: Playlist,
		popularShorts: Playlist,
		popularLiveStreams: Playlist,
		shorts: Playlist,
	},
	/**
	 * デフォルトの言語を表します。
	 * ユーザーインターフェースやローカライズの初期設定に使用されます。
	 * 必ずしも設定されているとは限らないため、使用時には適切なフォールバックを考慮してください。
	 */
	defaultLanguage?: string,
	/**
	 * チャンネルの国籍を表します。
	 * この値によって、収益化の資格やプラットフォーム上の一部の機能が影響を受ける場合があります。
	 * 値はオプションであり、指定されないこともあります。
	 */
	country?: string,
	/**
	 * 動画やコンテンツが子供向けとしてマークされているかを示します。
	 *
	 * `true` の場合、子供向けに作られたコンテンツであると判断されます。
	 * `false` または未設定の場合、子供向けではないか、判断が行われていないことを表します。
	 */
	madeForKids?: boolean,
}

export type Playlist = {
	id: string,
	url: string,
}

export type ThumbnailsList = {
	[key: string]: ThumbnailDefinition
}

export type ThumbnailDefinition = {
	url: string,
	width: number,
	height: number,
}

export type VideoInformation = {
	title: string,
	description: string,
}

export type LocalizedVideoInformation = {
	[lang: string]: VideoInformation,
}

export type VideoItem = (Video | UpcomingLiveStream | LiveStream | LiveStreamArchive);
export type VideoItems = VideoItem[];

export type VideoCommonProperties = VideoInformation & {
	videoId: string,
	publishedAt: string,
	channelTitle: string,
	localizations: LocalizedVideoInformation,
	defaultLanguage: string,
	defaultAudioLanguage: string,
	tags: string[],
	license: "youtube" | "creativeCommon",
	thumbnailColor: ThumbnailColorDefinition,
	thumbnail: string,
	thumbnails: ThumbnailsList,
	isShorts: boolean,
	isCaptionAvailable: boolean | null,
	isMembershipContent: boolean,
	isEmbeddable: boolean | null,
	categoryId: number | null,
	url: string,
	category: string,
	contentDimension: "2D" | "3D",
	contentProjection: "Rectangular" | "360degree",
	contentDuration: VideoDuration | null,
	contentTypeValue: VideoType,
	contentTypeCategory: "video" | "shorts" | "live" | "premiere",
}

export type VideoDuration = {
	seconds: number,
	stringValue: string,
}

export type ThumbnailColorDefinition = {
	decimal: number,
	hexadecimal: string,
	rgb: {
		r: number,
		g: number,
		b: number,
	},
	hsv: {
		h: number,
		s: number,
		v: number,
	},
}

export type Video = VideoCommonProperties & {
	liveBroadcast: "none",
	contentTypeValue: "video",
	contentTypeCategory: "video" | "shorts",
};

export type UpcomingLiveStream = VideoCommonProperties & {
	liveBroadcast: "upcoming",
	contentTypeValue: "liveBefore" | "premiereBefore",
	contentTypeCategory: "live" | "premiere",
	liveScheduledStartTime?: string,
};

export type LiveStream = VideoCommonProperties & {
	liveBroadcast: "live",
	contentTypeValue: "liveNow" | "premiereNow",
	contentTypeCategory: "live" | "premiere",
	liveScheduledStartTime?: string,
	liveActualStartTime: string,
};

export type LiveStreamArchive = VideoCommonProperties & {
	liveBroadcast: "none",
	contentTypeValue: "liveAfter" | "premiereAfter",
	contentTypeCategory: "live" | "premiere",
	liveScheduledStartTime?: string,
	liveActualStartTime: string,
	liveActualEndTime: string,
};
