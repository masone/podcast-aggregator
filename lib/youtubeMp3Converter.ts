/* eslint-disable  @typescript-eslint/no-explicit-any */
// https://github.com/classicCokie/youtube-mp3-converter/blob/main/lib/index.js
import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import HttpsProxyAgent from "https-proxy-agent";

interface Params {
  title: string;
  videoUrl?: string;
  startTime?: string;
  duration?: string;
  filePath?: string;
}

interface VideoInfo {
  videoDetails: {
    title: string;
    video_url: string;
    lengthSeconds: number;
  };
}

const requestOptions = {
  requestOptions: process.env.HTTP_PROXY
    ? { agent: HttpsProxyAgent(process.env.HTTP_PROXY) }
    : {},
};

const downloadAndConvertVideoToMp3 = ({
  title,
  videoUrl,
  startTime,
  duration,
  filePath,
}: any) => {
  return new Promise((resolve, reject) =>
    ffmpeg(ytdl(videoUrl, { filter: "audioonly", ...requestOptions }))
      .toFormat("mp3")
      .setStartTime(startTime)
      .duration(duration)
      .on("error", (err: unknown) => reject(err))
      .on("end", () => resolve(`${filePath}/${title}.mp3`))
      .saveToFile(`${filePath}/${title}.mp3`)
  );
};

const mergeParams = (
  videoInfo: VideoInfo,
  params: Params,
  filePath: string
) => ({
  title: params.title ?? videoInfo.videoDetails.title,
  videoUrl: videoInfo.videoDetails.video_url,
  startTime: params.startTime ?? "00:00:00",
  duration: params.duration ?? videoInfo.videoDetails.lengthSeconds,
  filePath: filePath ?? __dirname,
});

export function youtubeMp3Converter(filePath: string) {
  return (youtubeUrl: string, params: Params) =>
    ytdl
      .getInfo(youtubeUrl)
      .then((info: any) =>
        mergeParams(info as VideoInfo, params || {}, filePath)
      )
      .then(downloadAndConvertVideoToMp3);
}
