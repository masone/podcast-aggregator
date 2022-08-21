export default {
  urls: [
    "https://odysee.com/@{username}:d0", // crawl from Odysee
    "https://www.youtube.com/feeds/videos.xml?channel_id={channelId}", // crawl from YouTube
    "https://api.soundcloud.com/users/{userId}/tracks?access=playable&limit=20&offset=0&app_locale=en&client_id={yourApiClientId}", // crawl from Soundcloud - requires a developer account for API access
  ],
  feed: {
    slug: "title",
    title: "Title",
    description: "Description",
    url: "https://example.com",
    website: "https://example.com",
    author: "Author",
    cover: "./cover.png",
  },
  aws: {
    host: "s3.us-east-2.amazonaws.com",
    bucket: "bucket",
  },
};
