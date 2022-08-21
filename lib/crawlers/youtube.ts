import { PodcastItem, PodcastItemEnclosure } from "./index.js";
import rss from "rss-to-json";
import { existsSync } from "fs";
import { basename, join } from "path";
import { upload } from "../aws.js";
import { publicUrl, downloadsDirectory } from "../config.js";
import slugify from "../slugify.js";
import mp3Duration from "mp3-duration";
import { youtubeMp3Converter } from "../youtubeMp3Converter.js";

interface Element {
  title: string;
  link: string;
  author: string;
  created: string;
  description: string;
  id: string;
  enclosures: PodcastItemEnclosure[];
}

const convertLinkToMp3 = youtubeMp3Converter(downloadsDirectory());

function getEnclosure(file: string): PodcastItemEnclosure {
  return {
    type: "audio/mp3",
    file: file,
    url: publicUrl(basename(file)),
  };
}

export async function crawl(feedUrl: string): Promise<PodcastItem[]> {
  const feed = await rss.parse(feedUrl, {});

  const items = await Promise.all(
    feed.items.map(async (element: Element) => {
      const { title, link, author, created, description, id, enclosures } =
        element;

      const fileTitle = slugify(title);
      const file = join(downloadsDirectory(), `${fileTitle}.mp3`);

      if (!existsSync(file)) {
        await convertLinkToMp3(link, { title: fileTitle });
      }

      const enclosure = await getEnclosure(file);
      const duration = await mp3Duration(file);
      await upload(file);

      return {
        title: `[${author}] ${title}`,
        author,
        date: new Date(created),
        description,
        guid: id,
        enclosure,
        itunesImage: enclosures[0],
        itunesDuration: duration,
      };
    })
  );

  return items;
}
