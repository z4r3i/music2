import { Backend, type Stream, type Video, type VideoWithStreams } from "./backend";
import type { ComboObject } from "./app";

export class Invidious extends Backend {

	private endpoint = "https://yt.drgnz.club/api/v1";

	/* Getters */
	
	public async getVideo(id: string): Promise<Video | null> {
		return this.cached(`video_${id}`) ?? (await this.fetchVideo(id)).video;
	}

	public async getStreams(id: string): Promise<Stream[] | null> {
		return this.cached(`streams_${id}`) ?? (await this.fetchVideo(id)).streams;
	}

	public async getSearchSuggestions(q: string): Promise<string[] | null> {
		return this.cached(`suggestions_${q}`) ?? await this.fetchSearchSuggestions(q);
	}

	public async getSearch(q: string): Promise<string[] | null> {
		return this.cached(`search_${q}`) ?? await this.fetchSearch(q);
	}

	/* Fetching */

	private async fetchVideo(id: string): Promise<VideoWithStreams> {
		let resp = await $fetch<ComboObject | null>(`${this.endpoint}/videos/${id}?fields=videoId,title,author,adaptiveFormats,videoThumbnails`);
		let {video, streams} = this.convertVideoWithStreams(resp);
		if (this.cache) {
			if (video) this.cache.cacheVideo(video);
			if (streams) this.cache.cacheStreams(id, streams);
		}
		return {video, streams};
	}

	private async fetchSearchSuggestions(q: string): Promise<string[] | null> {
		let resp = await $fetch<ComboObject | null>(`${this.endpoint}/search/suggestions`, {query: {q}});
		let suggestions = resp ? resp.suggestions : null;
		if (this.cache && suggestions) this.cache.cacheSearchSuggestions(q, suggestions);
		return suggestions;
	}

	private async fetchSearch(q: string): Promise<string[] | null> {
		let resp = await $fetch<ComboObject[] | null>(`${this.endpoint}/search`, {query: {q}});
		let results = this.convertSearch(resp).map(v => {
			if (this.cache) this.cache.cacheVideo(v);
			return v.id;
		});
		if (this.cache && results) this.cache.cacheSearch(q, results);
		return results;
	}

	/* Converting */

	private convertVideoWithStreams(resp: ComboObject | null): VideoWithStreams {
		if (!resp) return {video: null, streams: null};
		let streams = resp.adaptiveFormats.map((s: ComboObject) => {
			if (!s.audioSampleRate) return;
			return {
				bitrate: parseInt(s.bitrate),
				url: s.url,
				type: "default"
			};
		}).filter((s: Stream | undefined) => s != undefined);
		return {
			video: this.convertVideo(resp),
			streams
		};
	}

	private convertVideo(resp: ComboObject): Video {
		let id = resp.videoId;
		let title = resp.title;
		let author = resp.author.replace(" - Topic", "");
		let thumbnail = resp.videoThumbnails[4].url
		return {id, title, author, thumbnail};
	}

	private convertSearch(resp: ComboObject[] | null): Video[] {
		let videos: Video[] = [];
		if (!resp) return videos;
		resp.forEach((s: ComboObject) => {
			if (s.type == "video") {
				videos.push(this.convertVideo(s))
			}
		});
		return videos;
	}


}