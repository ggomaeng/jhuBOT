'use strict';
const config = require('./config');
// create an API server
const Restify = require('restify');
const server = Restify.createServer({
	name: 'Bot'
});
const PORT = process.env.PORT || 3000;

// FBeamer
const FBeamer = require('./fbeamer');
const f = new FBeamer(config.FB);
const firebase = require('firebase');
firebase.initializeApp(config.FIREBASE);

server.use(Restify.jsonp());
server.use(Restify.bodyParser());
// server.use((req, res, next) => f.verifySignature(req, res, next));

const session = require('./session');
const firebaseHelper = require('./firebase')(session, f);
const actions = require('./actions')(session, f, firebaseHelper);



// WIT.AI
const Wit = require('node-wit').Wit;
const wit = new Wit({
	accessToken: config.WIT_ACCESS_TOKEN,
	actions
});

// Register the webhooks
server.get('/', (req, res, next) => {
	f.registerHook(req, res);
	return next();
});

// Handle incoming
server.post('/', (req, res, next) => {
	f.incoming(req, res, msg => {
		const {
			sender,
			postback,
			message
		} = msg;


		// console.log(postback.payload);


		if(postback && !postback.payload.includes("menu")){
			console.log('im here');
			// console.log('am i even being called');
			// console.log(JSON.parse(postback.payload));
			const {departure, arrival, id} = JSON.parse(postback.payload);
			// console.log('postback received:', id);
            let sessionId = session.init(sender);
			cancelRide(departure, arrival, id, sessionId);
		}

		if((message && message.text) || (postback && postback.payload.includes("menu"))) {
			// console.log(message.text, 'received', 'sender:', sender);
			let sessionId = session.init(sender);
			let {context} = session.get(sessionId);
			let messageTxt = postback ? postback.payload.split(':')[1] : message.text;
			wit.runActions(sessionId, messageTxt, context)
				.then(ctx => {
					//delete if conversation ended
					ctx.jobDone ? session.delete(sessionId) : session.update(sessionId, ctx);
			})
				.catch(e => console.log(`Error ${e}`));

		}

	});

	return next();
});

//persistent

f.showPersistent([
    {
        type: "postback",
        title: "My Rides",
        payload: "menu:my rides"
    },
	{
        type: "web_url",
        title: "Buy Sung Woo a Drink!",
        url: "http://venmo.com/Sung-Park-18"
    }
]);

// Subscribe
f.subscribe();

server.listen(PORT, () => console.log(`Bot running on port ${PORT}`));

