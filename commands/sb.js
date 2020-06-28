const fs = require('fs');
const { soundBites } = require('../media/sb/avail.json');

module.exports = {
	name: 'sb',
	description: 'Sound bites :)',
	async execute(message, args) {
		let connection; 
		const query = args.join();

		/* Asking for list? */
		if ( query == "list" ) {
			let helpText = "";
			for (const media in soundBites) {
				helpText += `${media} - ${soundBites[media].desc}\n`;
			}

			message.author.send(helpText);
		/* Media found, playing */
		} else if ( query in soundBites ) {
			connection = await message.member.voice.channel.join();
			const dispatcher = connection.play('./media/sb/' + soundBites[query].source);
			dispatcher.on('finish', () => {
				connection.disconnect();
			});
		/* None found */
		} else {
			message.channel.send('Media not found, try "!sb list" for a list of media')
		}
	},
};
