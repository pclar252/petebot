const { googleToken } = require('../config.json');
const { google } = require('googleapis');
const ytdl = require('ytdl-core');

const youtube = google.youtube({
	version: 'v3',
	auth: googleToken
});

const youtubePrefix = 'https://www.youtube.com/watch?v='

module.exports = {
	name: 'yt',
	description: 'Find and play youtube media',
	async execute(message, args) {
		const channel = message.member.voice.channel;
		channel.join().then(async function (connection) {
			const query = args.join(' ');
			let url;
			if (!query.startsWith(youtubePrefix)) {
				const res = await youtube.search.list({
					part: 'id',
					q: query
				});

				const id = res.data.items[0].id.videoId;
				url = `${youtubePrefix}${id}`;
			} else {
				url = query;
			}
			const stream = ytdl(url, {
				filter: 'audioonly'
			});

			dispatcher.on('finish', () => {
				connection.disconnect();
			});
		});
	},
};
