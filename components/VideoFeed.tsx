"use client";

import React, {useEffect, useRef, useState} from 'react';
import {Archive, Calendar, Clock, Play, Radio, RefreshCw, Smartphone, Spotlight, Zap} from 'lucide-react';
import {SearchResponse, VideoItem, VideoType} from "@/lib/youtubeApi/Types";
import {YouTubeAPI} from "@/lib/youtubeApi/YouTubeAPI";
import {TriState} from "@/lib/youtubeApi/ExtendUtils";

const VTGCI_YTAPI_BASE_URL = (process.env.NEXT_PUBLIC_VTGCI_API_ORIGIN_URL ?? "https://infra.virtlive.jp") + (process.env.NEXT_PUBLIC_VTGCI_YTAPI_BASE_PATH ?? "/api/youtube/v3");
const VTGCI_WS_BASE_URL = (process.env.NEXT_PUBLIC_VTGCI_API_ORIGIN_URL ?? "https://infra.virtlive.jp") + (process.env.NEXT_PUBLIC_VTGCI_WS_BASE_PATH ?? "/ws/youtube").replace(/^http/, 'ws');

/**
 * ------------------------------------------------------------------
 * UI コンポーネント群
 * ------------------------------------------------------------------
 */

// 日付フォーマッター
const formatDate = (dateString: string, beforeMes: string | null = "前", nowMes: string | null = "たった今", afterMes: string | null = "後") => {
	beforeMes ??= "前";
	afterMes ??= "後";
	nowMes ??= "たった今";
	const date = new Date(dateString);
	const now = new Date();
	const diffDirectionIsAfter = date.getTime() > now.getTime();
	const diff = Math.abs(now.getTime() - date.getTime());
	const diffM = Math.abs((now.getFullYear() * 12 + now.getMonth()) - (date.getFullYear() * 12 + date.getMonth()))
	//@ts-ignore
	const formatter = new Intl.DurationFormat('ja-JP', {style: 'short'});

	if (diff < 60_000 && nowMes !== "") {
		return nowMes;
	} else if (diff < 3600_000) {
		// 1時間以内なら分単位の相対表示
		return `${formatter.format(`PT${Math.round(diff / 1000 / 60)}M`)}${diffDirectionIsAfter ? afterMes : beforeMes}`;
	} else if (diff < 86400_000) {
		// 24時間以内なら時間単位の相対表示
		return `${formatter.format(`PT${Math.round(diff / 1000 / 3600)}H`)}${diffDirectionIsAfter ? afterMes : beforeMes}`;
	} else if (diffM >= 24) {
		return `${formatter.format(`P${Math.round(diffM / 12)}Y`)}${diffDirectionIsAfter ? afterMes : beforeMes}`;
	} else if (diffM >= 6) {
		return `${formatter.format(`P${Math.floor(diffM / 12)}Y${Math.floor(diffM % 12)}M`)}${diffDirectionIsAfter ? afterMes : beforeMes}`;
	}
	return date.toLocaleDateString('ja-JP', {month: 'short', day: 'numeric'});
};

/**
 * VideoCard: 個別の動画カードコンポーネント
 * デザイン: 画像の「カード・フィード」に合わせ、角丸で清潔感のあるデザイン
 */
const VideoCard = ({video}: { video: VideoItem }) => {
	const [isHovered, setIsHovered] = useState(false);
	const [imageLoaded, setImageLoaded] = useState(false);

	const isLive = video.contentTypeCategory === 'live';
	const isShort = video.contentTypeCategory === 'shorts';
	const isPremiere = video.contentTypeCategory === 'premiere';
	const isVideo = video.contentTypeCategory === 'video';
	const isUpcoming = video.contentTypeValue === 'liveBefore' || video.contentTypeValue === 'premiereBefore';
	const isArchive = video.contentTypeValue === 'liveAfter' || video.contentTypeValue === 'premiereAfter';
	const isNow = video.contentTypeValue === 'liveNow' || video.contentTypeValue === 'premiereNow';

	// サムネイルURLの選定
	const thumbUrl = video.thumbnails.maxres?.url || video.thumbnails.high?.url || video.thumbnails.medium?.url || video.thumbnails.standard?.url || video.thumbnails.default?.url || video.thumbnail;
	const thumbnailColorY =
		video.thumbnailColor.rgb.r / 255 * 0.299 +
		video.thumbnailColor.rgb.g / 255 * 0.587 +
		video.thumbnailColor.rgb.b / 255 * 0.114;

	return (
		<a
			href={`https://www.youtube.com/${isShort ? "shorts/" : "watch?v="}${video.videoId}`}
			target="_blank"
			rel="noopener noreferrer"
			className="group flex flex-col relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			style={{
				// ホバー時にテーマカラーを影に反映させる
				'--theme-color': video.thumbnailColor.hexadecimal,
			} as React.CSSProperties}
		>
			{/* サムネイルエリア */}
			<div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-700">
				{/* LQIP (ぼかし背景) */}
				{!imageLoaded && (
					<img
						src={`${VTGCI_YTAPI_BASE_URL}/thumbnails/${video.videoId}/placeholder`}
						alt=""
						className="absolute inset-0 w-full h-full object-cover filter blur-lg scale-110"
					/>
				)}

				{/* 本番画像 */}
				<img
					src={thumbUrl}
					alt={video.title}
					className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
					onLoad={() => setImageLoaded(true)}
				/>

				{/* オーバーレイ (ホバー時) */}
				<div
					className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}/>

				{/* Play Icon (ホバー時) */}
				<div
					className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isHovered ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
					<div
						className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
						style={{
							backgroundColor: video.thumbnailColor.hexadecimal,
							color: thumbnailColorY > 0.5 ? 'black' : 'white'
						}}>
						<Play fill="currentColor" size={20} className="ml-1"/>
					</div>
				</div>

				{/* バッジ類 */}
				<div className="absolute top-2 left-2 flex gap-1">
					{(isLive && isNow) && (
						<span
							className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-lg shadow-sm animate-pulse">
                            <Radio size={12}/> LIVE
                        </span>
					)}
					{(isPremiere && isNow) && (
						<span
							className="flex items-center gap-1 px-2 py-1 bg-amber-600 text-white text-xs font-bold rounded-lg shadow-sm animate-pulse">
                            <Spotlight size={12}/> PREMIERE
                        </span>
					)}
					{(isLive || isPremiere) && isUpcoming && (
						<span
							className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm">
                            <Calendar size={12}/> SCHEDULE
                        </span>
					)}
					{(isLive && isArchive) && (
						<span
							className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs font-bold rounded-lg shadow-sm">
                            <Archive size={12}/> ARCHIVE
                        </span>
					)}
					{isShort && (
						<span
							className="flex items-center gap-1 px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-xs font-bold rounded-lg shadow-sm border border-white/20">
                            <Smartphone size={12} fill="currentColor"/> SHORTS
                        </span>
					)}
					{(isVideo || (isPremiere && isArchive)) && (
						<span
							className="flex items-center gap-1 px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-xs font-bold rounded-lg shadow-sm border border-white/20">
                            <Play size={12}/> VIDEO
                        </span>
					)}
				</div>
			</div>

			{/* コンテンツ情報エリア */}
			<div className="p-4 relative flex-1 flex flex-col">
				{/* 装飾用サイドライン（テーマカラー） */}
				<div
					className="absolute left-0 top-4 bottom-4 w-1 grow-0 shrink-0 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity"
					style={{backgroundColor: video.thumbnailColor.hexadecimal}}
				/>
				<div className="grow flex flex-col w-full justify-between">
					<h3 className="text-sm font-bold grow text-gray-800 dark:text-gray-100 line-clamp-2 leading-relaxed decoration-2 group-hover:underline group-hover:decoration-(--theme-color) transition-colors mb-2 w-full">
						{video.title}
					</h3>

					<div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
						<div className="flex items-center gap-1.5 overflow-hidden">
							{/* API仕様 v3.1 (VTGCI 26.02以降に搭載予定)ではアイコンも表示出来ます */}
							<span className="truncate">{video.channelTitle}</span>
						</div>
						<div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
							<Clock size={10}/>
							{ /*
                            スケジュール: 前、後
                            ライブ・プレミア公開中: 経過、(空文字)
                            アーカイブ: 前、(空文字)
                            動画: 前、(空文字)
                            */}
							{
								isUpcoming && formatDate(video.liveScheduledStartTime ?? video.publishedAt, "前", null, "後")
							}
							{
								isNow && formatDate(video.liveActualStartTime, "経過", null, null)
							}
							{
								isArchive && formatDate(video.liveActualEndTime, "前", null, null)
							}
							{
								(isVideo || isShort) && formatDate(video.publishedAt, "前", null, null)
							}
						</div>
					</div>
				</div>
			</div>
		</a>
	);
};


/**
 * メインコンポーネント
 */
export default function VideoFeed() {
	const [videos, setVideos] = useState<VideoItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<'all' | 'video' | 'live' | 'short' | 'premiere'>('all');
	const [, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
	const [hasUpdate, setHasUpdate] = useState(false);
	const socketRef = useRef<WebSocket | null>(null);

	const api = new YouTubeAPI(VTGCI_YTAPI_BASE_URL)

	// データ取得関数
	const fetchVideos = async (typeFilter: VideoType[] = [], isShorts: TriState = TriState.Default) => {
		setLoading(true);
		try {
			// API呼び出し
			const res = await fetch(api.getSearchApiEndpoint({
				type: typeFilter.length == 0 ? undefined : typeFilter,
				isShorts
			}));
			if (!res.ok) throw new Error('API Error');
			const data: SearchResponse = await res.json();

			setVideos(data.items);
		} catch (err) {
			console.error('Failed to fetch videos:', err);
		} finally {
			setLoading(false);
			setHasUpdate(false);
		}
	};

	const fetchVideosEvent = () => {
		switch (filter) {
			case 'all':
				fetchVideos([], TriState.Default);
				break;
			case 'live':
				fetchVideos(['liveBefore', "liveNow", "liveAfter"], TriState.No);
				break;
			case 'short':
				fetchVideos(["video"], TriState.Yes);
				break;
			case 'premiere':
				fetchVideos(['premiereBefore', "premiereNow", "premiereAfter"], TriState.No);
				break;
			default:
				fetchVideos(['video'], TriState.Default);
				break;
		}
	}

	// 初回ロード & フィルタ変更時
	useEffect(fetchVideosEvent, [filter]);

	// WebSocket接続管理
	useEffect(() => {
		const connectWs = () => {
			setWsStatus('connecting');
			const ws = new WebSocket(`${VTGCI_WS_BASE_URL}/notify`);

			ws.onopen = () => {
				setWsStatus('connected');
				console.log('WS Connected');
			};

			ws.onmessage = async (event) => {
				// pingはブラウザが自動処理する場合もあるが、明示的な場合
				if (event.data === 'ping') {
					ws.send('pong');
					return;
				}

				// 5分毎のキャッシュ更新完了通知
				if (event.data === 'fullyUpdated') {
					let typeFilter: VideoType[], isShorts: TriState;
					switch (filter) {
						case 'all':
							typeFilter = [];
							isShorts = TriState.Default;
							break;
						case 'live':
							typeFilter = ['liveBefore', "liveNow", "liveAfter"];
							isShorts = TriState.No;
							break;
						case 'short':
							typeFilter = ["video"];
							isShorts = TriState.Yes;
							break;
						case 'premiere':
							typeFilter = ['premiereBefore', "premiereNow", "premiereAfter"];
							isShorts = TriState.No;
							break;
						default:
							typeFilter = ['video'];
							isShorts = TriState.Default;
							break;
					}
					const res = await fetch(api.getSearchApiEndpoint({
						type: typeFilter.length == 0 ? undefined : typeFilter,
						isShorts
					}));
					if (!res.ok) {
						setHasUpdate(true);
					} else {
						const data: SearchResponse = await res.json();
						if (
							videos.filter(v => !data.items.some(i => i.videoId === v.videoId)).length > 0) setHasUpdate(true);
					}
				}
			};

			ws.onclose = () => {
				setWsStatus('disconnected');
				// 再接続ロジック（簡易版）
				setTimeout(connectWs, 5000);
			};

			socketRef.current = ws;
		};

		connectWs();

		return () => {
			socketRef.current?.close();
		};
	}, []);


	return (
		<div className="w-full max-w-7xl mx-auto p-4 md:p-8 font-sans bg-gray-50 dark:bg-gray-900 min-h-screen">

			{/* ヘッダーエリア */}
			<div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
				<div>
					<h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 dark:text-white mb-2 tracking-tight">
						LATEST MOVIES
					</h2>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						所属タレントの最新動画・配信情報
					</p>
				</div>

				{/* フィルタータブ */}
				<div
					className="flex items-center gap-2 p-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
					{(['all', 'video', 'live', 'premiere', 'short'] as const).map((f) => (
						<button
							key={f}
							onClick={() => setFilter(f)}
							className={`
                            px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200
                            ${filter === f
								? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md'
								: 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}
                                `}>
							{f === 'all' && 'すべて'}
							{f === 'video' && '動画'}
							{f === 'live' && '配信'}
							{f === 'premiere' && 'プレミア公開'}
							{f === 'short' && 'Shorts'}
						</button>
					))}
				</div>
			</div>

			{/* 新着通知バー (WebSocket連動) */}
			<div className={`
        transition-all duration-500 ease-in-out overflow-hidden
        ${hasUpdate ? 'max-h-20 opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}
      `}>
				<button
					onClick={fetchVideosEvent}
					className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl shadow-md flex items-center justify-center gap-2 font-bold transition-colors"
				>
					<RefreshCw className="animate-spin-slow" size={18}/>
					リストが更新されました。クリックして最新を表示
				</button>
			</div>

			{/* 動画グリッド */}
			{loading ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{Array.from({length: 8}).map((_, i) => (
						<div key={i}
							 className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm h-64 animate-pulse">
							<div className="h-36 bg-gray-200 dark:bg-gray-700"/>
							<div className="p-4 space-y-3">
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"/>
								<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"/>
							</div>
						</div>
					))}
				</div>
			) : (
				<>
					{videos.length > 0 ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{videos.map((video) => (
								<VideoCard key={video.videoId} video={video}/>
							))}
						</div>
					) : (
						<div className="text-center py-20 text-gray-400">
							<div className="mb-4 flex justify-center">
								<Zap size={48} className="text-gray-300 dark:text-gray-700"/>
							</div>
							<p>該当する動画が見つかりませんでした。</p>
						</div>
					)}
				</>
			)}
		</div>
	);
}
