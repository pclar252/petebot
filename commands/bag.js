const fs = require('fs');
const soundBites = fs.readdirSync( './media/bag' ).filter(file => file.endsWith('.mp3'));

module.exports = {
	name: 'bag',
	description: 'Its in the bag!',
	async execute(message, args) {
		const connection = await message.member.voice.channel.join();
		let file = soundBites[Math.floor(Math.random() * soundBites.length)];
		const dispatcher = connection.play('./media/bag/' + file);
	},
};
