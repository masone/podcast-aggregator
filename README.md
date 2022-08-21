# Podcast aggregator
Create podcasts from Youtube, Odysee and Soundcloud. Also supports creating a master feed by aggregating multiple sources. Integrates with S3 compatible object storage - no podcast hosting software required.

Use cases:
- Create a podcast for a Youtube or Soundcloud channel
- Create a podcast for a curated list of Youtube videos or Soundcloud assets
- Create a master feed that aggregates audio from multiple sources

## Configuration
Create a `podcast.config.js` (see `example.config.js`) to set podcast metadata and configure the upload to S3. Ensure your bucket allows public access (or configure Cloudfront).

Create a `.env` file with the following environment variables (or set them manually when starting the process):

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `HTTP_PROXY` (optional, beta) A proxy can be used to circumvent geo restrictions. Try using one if you're getting `403` responses from the youtube API
- `NODE_OPTIONS` (optional) If you're on a machine with limited memory, consider setting
`NODE_OPTIONS` to `--max-old-space-size=500` whereas 500 is a bit lower than your limit in MB. This forces the garbage collector before you run out of memory

## Usage
```
npm start
```

If you want to pass a different config file than the default:
```
npm start -- --config=./other.config.js
```

Your feed will be uploaded to your AWS S3 bucket as an XML file. If you don't intend to publish your feed publicly, pocketcasts supports [submitting private feeds](https://pocketcasts.com/submit/) (also a good way to test your configuration).

## Good to know
- A machine with disk is recommended as audio files get cached locally
- Does not retain a full history of all previously processed episodes. New episodes in the configured feeds will eventually replace new ones
- The Youtube API can have restrictions, use a proxy to work around it
- Youtube downloads can be flaky in general (rate limits, etc). It's running sufficiently stable, but don't expect this to run without any hiccups all the time
- Soundcloud is incredibly restrictive and the API is not public. A developer account is required to get a personal clientId
- To monitor a background cronjob, consider setting up a dead mans switch https://nosnch.in
- This is an early version that works for me (TM), contributions are welcome
