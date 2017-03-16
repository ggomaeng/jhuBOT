/**
 * Created by ggoma on 2017. 3. 16..
 */
/**
 * Created by ggoma on 2017. 2. 27..
 */
'use strict';
let moment = require('moment-timezone');
const firebase = require('firebase');
const time_zone = "America/New_York";

const showBooks = (session, f) => {
    return ({sessionId, context, entities}) => {
        return new Promise((resolve, reject) => {
            let fbid = session.getFbId(sessionId);
            let myBooks = [];

            console.log('i am inside show book');

            firebase.database().ref(`users/${fbid}/books`).once('value', books => {
                books.forEach(book => {
                    myBooks.push(book.val());
                });
            })
                .then(() => {
                    if(myBooks && myBooks.length == 0) {
                        f.txt(fbid, `You have no books listed yet!`);
                    } else {
                        console.log('i should show books now');
                        myBooks.map((item) => {
                            // console.log(item);
                            let {bookInfo, key} = item;
                            let data = {
                                text: `${bookInfo.title}`,
                                buttons: [{
                                    type: 'postback',
                                    title: 'Unlist Book',
                                    payload: `{"key":"${key}", "isbn":"${bookInfo.isbn}", "type":"REMOVE_BOOK"}`
                                }]
                            };

                            f.button(fbid, data);
                        });
                    }

                    return resolve(context);
                })
                .catch((e) => {
                    console.log(e);
                });

        })
    }
};

module.exports = showBooks;