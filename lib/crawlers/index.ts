import { crawl as crawlYoutube } from "./youtube.js";
import { crawl as crawlSoundcloud } from "./soundcloud.js";
import { crawl as crawlOdysee } from "./odysee.js";

export interface PodcastItemEnclosure {
  type: string;
  file: string;
  url: string;
  length?: number;
}

export interface PodcastItem {
  title: string;
  author: string;
  date: string | Date | undefined;
  description: string;
  enclosure: PodcastItemEnclosure;
  guid: string;
  itunesImage?: string;
  itunesDuration?: string;
}

export function crawl(url: string) {
  if (url.match("soundcloud.com")) {
    return crawlSoundcloud(url);
  } else if (url.match("odysee.com")) {
    return crawlOdysee(url);
  } else if (url.match("youtube.com")) {
    return crawlYoutube(url);
  } else {
    throw new Error("Unknown source type");
  }
}
