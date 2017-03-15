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
            // console.log('selling isbn:', isbn.replace(/-/g, ''));
            //9781118302798

            if(isbn) {
                f.txt(fbid, "Give me one moment while I search Google for the book :)");
                f.fetchBookFromGoogle(isbn.replace(/-/g, ''))
                    .then((result) => {
                        let {items} = result;
                        if(!items) {
                            f.txt(fbid, `I couldn't find anything :/`);
                        } else {
                            let book = items[0];
                            let {title, subtitle, authors, description, imageLinks} = book.volumeInfo;
                            console.log(title, subtitle, authors, description, imageLinks);
                            let author = authors && authors.length > 0 && authors.length > 1 ? authors.reduce((previous, current) => {
                                return previous === '' ? current : previous + ' and ' + current;
                            }, '') : author;


                            let element = [{
                                title: `${title} by ${author}`,
                                image_url: `${imageLinks.smallThumbnail}`,
                                subtitle: `${subtitle}`,
                            }];

                            f.generic(fbid, element)
                                .then(() => {
                                    f.txt(fbid, `Your book has been added to the list!`);
                                });

                        }
                    })
            } else {
                //ask for isbn again
            }



            return resolve(context);
        })
    }
};

module.exports = sellBooks;