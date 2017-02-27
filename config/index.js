'use strict';
if(process.env.NODE_ENV === 'production') {
	module.exports = {
		"WIT_ACCESS_TOKEN": process.env.WIT_ACCESS_TOKEN,
		"FB": {
			"PAGE_ACCESS_TOKEN": process.env.PAGE_ACCESS_TOKEN,
			"VERIFY_TOKEN": process.env.VERIFY_TOKEN,
			"APP_SECRET": process.env.APP_SECRET,
            "SIMSIMI": process.env.SIMSIMI
		},
		"FIREBASE": {
			apiKey: process.env.FIREBASE_API_KEY,
			databaseURL: process.env.FIREBASE_DATABASE
		}
	}
} else {
	module.exports = require('./development.json');
}