/**
 * Created by ggoma on 2017. 2. 24..
 */
'use strict';
const endConversation = require('./endConversation');
const check = require('./checkRides');
const add = require('./addRide');
const show = require('./showRides');
const find = require('./findBooks');
const sell = require('./sellBooks');
const addB = require('./addBook');
const showB = require('./showBooks');
const buyB = require('./buyBooks');

module.exports = (session, f) => {
    let checkRides = check(session, f);
    let addRide = add(session, f);
    let showRides = show(session, f);
    let findBooks = find(session, f);
    let sellBooks = sell(session, f);
    let addBook = addB(session, f);
    let showBooks = showB(session, f);
    let buyBooks = buyB(session, f);

    const actions = {
        send(request, response) {
            // console.log(request);
            const {sessionId, context, entities} = request;
            const messageTxt = request.text;
            let {fbid} = session.get(sessionId);
            const {text, quickreplies} = response;
            const intent = entities && entities.intent && entities.intent[0];
            console.log("entities:", entities);

            if((intent && intent.value == 'curse') || (entities && Object.keys(entities).length === 0) ||
                (intent && intent.confidence < 0.6)) {
                console.log('i should call simsimi');
                return f.sendSimsimi(messageTxt)
                    .then(response => {
                        f.txt(fbid, response.response);
                    });
            } else {
                return new Promise((resolve, reject) => {
                    if(quickreplies) {
                        let buttons = quickreplies.map(title => {
                            return {
                                title,
                                content_type: "text",
                                payload: "null"
                            }
                        });

                        f.quick(fbid, {
                            text,
                            buttons
                        });
                    } else {
                        f.txt(fbid, text);
                    }
                    return resolve();
                });
            }
        },
        endConversation,
        checkRides,
        addRide,
        showRides,
        findBooks,
        sellBooks,
        addBook,
        showBooks,
        buyBooks
    };

    return actions;
};