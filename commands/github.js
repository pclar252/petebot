module.exports = {
	name: 'github',
	description: 'Link to the github source',
	async execute(message, args) {
		message.channel.send('Source code found here: https://github.com/pclar252/petebot')
	},
};
