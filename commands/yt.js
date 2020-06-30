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
					part: 'snippet, id',
					q: query
				});

				const identifierEmoji = ['🔴','🟠','🟡','🟢','🔵'];
				let response = '';
				for (let i = 0; i < res.data.items.length; i++) {
					const videoData = res.data.items[i].snippet;
					response += identifierEmoji[i] + ' ' + videoData.title + ' - ' + videoData.channelTitle + '\n';
				}
				const videoList = await message.channel.send(response);
				try {
					for (let i = 0; i < identifierEmoji.length; i++) {
						await videoList.react(identifierEmoji[i]);
					}
				} catch (error) {
					console.error('Failed to react with an emoji');
				}

				const filter = (reaction, user) => {
					return identifierEmoji.includes(reaction.emoji.name) && user.id != videoList.author.id
					;
				}
				const collector = videoList.createReactionCollector(filter, { max: 1, time: 15000 });

				const selectionPromise = new Promise(resolve => {
					collector.on('collect', (reaction, user) => {
						const index = identifierEmoji.findIndex(x => x == reaction.emoji.name);
						if(index == -1) {
							console.error('reaction not in list?');
							index = 0;
						}
						resolve(index);
					});
				});

				const timeoutPromise = new Promise(resolve => {
					collector.on('end', collected => {
						if(collected.size == 0) console.log('yt: timeout triggered on song select');
						resolve(collected.size);
					});
				});

				const resultPromise = Promise.race([selectionPromise, timeoutPromise]);

				const id = res.data.items[await resultPromise].id.videoId;
				videoList.delete();
				url = `${youtubePrefix}${id}`;
			} else {
				url = query;
			}

			let stream;
			try {
				stream = ytdl(url, {
					filter: 'audioonly'
				});
			} catch(error) {
				console.error('Failed to download youtube media');
			}

			message.channel.send('Now playing ' + url);

			const dispatcher = connection.play(stream);

			dispatcher.on('finish', () => {
				connection.disconnect();
			});
		});
	},
};
