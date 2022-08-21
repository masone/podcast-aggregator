import { PodcastItem, PodcastItemEnclosure } from "./index.js";
import rss from "rss-to-json";

interface Element {
  title: string;
  itunes_duration: string;
  link: string;
  itunes_author: string;
  itunes_image: {
    href: string;
  };
  created: string;
  description: string;
  enclosures: PodcastItemEnclosure[];
}

interface Feed {
  items: Element[];
}

export async function crawl(feedUrl: string): Promise<PodcastItem[]> {
  const feed: Feed = await rss.parse(feedUrl, {});

  return feed.items.map((element: Element) => {
    const {
      title,
      itunes_duration,
      link,
      itunes_author,
      itunes_image,
      created,
      description,
      enclosures,
    } = element;

    return {
      title: `[${itunes_author}] ${title}`,
      author: itunes_author,
      date: new Date(created),
      description,
      guid: link,
      enclosure: { ...enclosures[0], size: enclosures[0].length },
      itunesDuration: itunes_duration,
      itunesImage: itunes_image.href,
    };
  });
}
