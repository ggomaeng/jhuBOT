/**
 * Created by ggoma on 2017. 3. 16..
 */

'use strict';
let moment = require('moment-timezone');
const firebase = require('firebase');
const {fetchEntity} = require('../utils');

const buyBooks = (session, f) => {
    return ({sessionId, context, entities}) => {
        return new Promise((resolve, reject) => {
            let fbid = session.getFbId(sessionId);
            let isbn = fetchEntity(entities, 'phone_number');

            if(isbn) {
                let bookResult = [];
                f.txt(fbid, `Searching for the book!`)
                    .then(() => {
                        firebase.database().ref(`books/${isbn.replace(/-/g, '')}`).once('value', books => {
                            books.forEach(book => {
                                bookResult.push(book.val());
                            });
                        })
                            .then(() => {
                                if(bookResult && bookResult.length == 0) {
                                    f.txt(fbid, `I couldn't find any books :/`);
                                    return resolve(context);
                                } else {
                                    let elements = bookResult.map(item => {
                                        let {bookInfo, info, phone_number} = item;
                                        return {
                                            title: `${bookInfo.title}`,
                                            image_url: `${bookInfo.image_url}`,
                                            subtitle: `Listed by: ${info.first_name} ${info.last_name}`,
                                            buttons: [
                                                {
                                                    type: "phone_number",
                                                    title: "Contact",
                                                    payload: phone_number
                                                }
                                            ]
                                        }
                                    });
                                    f.txt(fbid, `Here's what I found!`)
                                        .then(() => {
                                            f.generic(fbid, elements)
                                                .then(() => {
                                                    return resolve(context);
                                                })
                                        })
                                }
                            })
                            .catch((e) => {
                                console.log(e);
                            });
                    });

            } else {
                f.txt(fbid, `I didn't understand that.`);
                // return resolve(context);
            }


        })
    }
};

module.exports = buyBooks;