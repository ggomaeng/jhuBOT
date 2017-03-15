/**
 * Created by ggoma on 2017. 3. 2..
 */
'use strict';
const firebase = require('firebase');
const {fetchEntity} = require('../utils');

const findBooks = (session, f) => {
    return ({sessionId, context, entities}) => {
        return new Promise((resolve, reject) => {
            let fbid = session.getFbId(sessionId);``
            console.log('why cant i get entities', entities);
            let buy_sell = fetchEntity(entities, 'buy_sell');
            if(!buy_sell) {
                context.noBuySell = true;
            }

            if(buy_sell.toUpperCase() === 'SELL') {
                context.sellBooks = true;
                delete context.noBuySell;
            }

            if(buy_sell.toUpperCase() === 'BUY') {
                context.buyBooks = true;
                delete context.noBuySell;
            }



            return resolve(context);
        })
    }
};

module.exports = findBooks;