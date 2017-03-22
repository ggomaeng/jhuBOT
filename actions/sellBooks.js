/**
 * Created by ggoma on 2017. 3. 16..
 */

'use strict';
const firebase = require('firebase');
const {fetchEntity} = require('../utils');

const sellBooks = (session, f) => {
    return ({sessionId, context, entities}) => {
        return new Promise((resolve, reject) => {
            let fbid = session.getFbId(sessionId);
            let isbn = fetchEntity(entities, 'phone_number');

            //9781118302798

            console.log('inside sellbooks');

            if(isbn) {
                console.log('selling isbn:', isbn.replace(/-/g, ''));
                f.txt(fbid, "Give me one moment while I search Google for the book :)");
                f.fetchBookFromGoogle(isbn.replace(/-/g, ''))
                    .then((result) => {
                        let {items} = result;
                        if(!items) {
                            delete context.bookExists;
                            delete context.bookInfo;
                            context.noBookExists = true;
                            return resolve(context);
                        } else {
                            let book = items[0];
                            let {title, subtitle, authors, description, imageLinks} = book.volumeInfo;
                            console.log(title, subtitle, authors, description, imageLinks);
                            let author = authors && authors.length > 0 ? authors[0] : '';

                            let element = [{
                                title: `${title} ${author !== '' ? 'by ' + author : ''}`,
                                image_url: `${imageLinks.thumbnail}`,
                                subtitle: `${description}`,
                            }];

                            f.generic(fbid, element)
                                .then(() => {
                                    f.txt(fbid, `I found this!`)
                                        .then(() => {
                                            delete context.noBookExists;
                                            context.bookExists = true;
                                            context.bookInfo = {
                                                isbn,
                                                title: `${title} by ${author}`,
                                                image_url: `${imageLinks.thumbnail}`,
                                                subtitle: `${subtitle}`,                                            };
                                            return resolve(context);
                                        });
                                });

                        }
                    })
            }
        })
    }
};

module.exports = sellBooks;