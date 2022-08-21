import { PodcastItem, PodcastItemEnclosure } from "./index.js";
import { existsSync, createWriteStream } from "fs";
import { join } from "path";
import { SoundCloud } from "scdl-core";
import { upload } from "../aws.js";
import { publicUrl, downloadsDirectory } from "../config.js";
import { basename } from "path";
import { pipeline } from "stream/promises";
import slugify from "../slugify.js";

interface Track {
  artwork_url: string;
  created_at: string;
  description: string;
  urn: string;
  permalink_url: string;
  title: string;
  user: { username: string };
  duration: string;
}

const scdl = await SoundCloud.create();

function getEnclosure(file: string): PodcastItemEnclosure {
  return {
    type: "audio/mp3",
    file: file,
    url: publicUrl(basename(file)),
  };
}

async function download(url: string, file: string): Promise<void> {
  if (existsSync(file)) {
    const stream = await scdl.download(url);
    await pipeline(stream, createWriteStream(file));
  }
}

export async function crawl(apiUrl: string): Promise<PodcastItem[]> {
  const response = await fetch(apiUrl);
  const tracks = await response.json();

  const items = await Promise.all(
    tracks.collection.map(async (track: Track) => {
      const {
        artwork_url,
        created_at,
        description,
        urn,
        permalink_url,
        title,
        user,
        duration,
      } = track;

      const fileTitle = slugify(title);
      const file = join(downloadsDirectory(), `${fileTitle}.mp3`);

      await download(permalink_url, file);
      await upload(file);

      return {
        title: `[${user.username}] ${title}`,
        author: user.username,
        date: created_at,
        description,
        guid: urn,
        enclosure: getEnclosure(file),
        itunesImage: artwork_url,
        itunesDuration: duration,
      };
    })
  );

  return items;
}
