/**
 * Created by ggoma on 2017. 3. 16..
 */

'use strict';
const firebase = require('firebase');
const {fetchEntity} = require('../utils');

const addBook = (session, f) => {
    return ({sessionId, context, entities}) => {
        return new Promise((resolve, reject) => {
            let fbid = session.getFbId(sessionId);
            let phone_number = fetchEntity(entities, 'phone_number');
            console.log("PHONE: ", phone_number, context.bookInfo);

            if(phone_number){
                f.txt(fbid, `Give me one moment while I put you on the list!`);
                f.getUserInfo(session.getFbId(sessionId))
                    .then((response) => {
                        let updates = {};
                        let key = firebase.database().ref(`${fbid}/books`).push().key;

                        let obj = {
                            fbid,
                            key,
                            phone_number,
                            info: response,
                            bookInfo: context.bookInfo
                        };
                        updates[`users/${fbid}/books/${key}`] = obj;
                        updates[`books/${context.bookInfo.isbn}/${key}`] = obj;

                        firebase.database().ref().update(updates)
                            .then(() => {
                                f.txt(fbid, `You're set! :)`)
                                    .then(() => {
                                        return resolve(context);
                                    })
                            })
                    })
                    .catch((e) => {
                        console.error(e);
                        f.txt(fbid, e);
                    });
            } else {
                f.txt(fbid, `I didn't understand your number :/`)
            }
            //return resolve

        })
    }
};

module.exports = addBook;