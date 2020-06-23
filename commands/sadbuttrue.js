const { JSDOM }  = require( 'jsdom' );
const { window } = new JSDOM( '' );
const $ = require('jquery')(window);

const { thesaurusToken } = require('../config.json');

function queryThesaurus(word) {
	let queryObj = {
		'key': thesaurusToken,
		'word': word,
		'language': 'en_US',
		'output': 'json'
	}
	let url = 'https://thesaurus.altervista.org/thesaurus/v1?';

	for (let [key, value] of Object.entries(queryObj)) {
		url += key + '=' + value + '&';
	}

	url = url.slice(0, -1);

	return new Promise(resolve => {
		$.ajax({
			url: url,
			success: function (data) {
				let ret = [];
				for (let key in data.response) {
					let synonymList = data.response[key].list.synonyms.split('|');
					for (index in synonymList) {
						let synonym = synonymList[index];
						if (synonym[synonym.length-1] == ')') {
							ret.push(synonym.slice(0,synonym.indexOf(' ')));
						} else {
							ret.push(synonym);
						}
					}
				}
				resolve(ret);
			}
		});		
	})
}

module.exports = {
	name: 'sadbuttrue',
	description: 'Says sad, but true in many wonderful ways',
	async execute(message, args) {
		let urlQuery = `https://thesaurus.altervista.org/thesaurus/v1?key={thesaurusToken}word`
		let sadList  = await queryThesaurus('sad');
		let trueList = await queryThesaurus('true');

		message.channel.send(sadList[Math.floor(Math.random() * sadList.length)] + ', but ' + trueList[Math.floor(Math.random() * trueList.length)]);
	},
};