/**
 * Created by ggoma on 2017. 2. 25..
 */
/**
 * Created by ggoma on 2017. 2. 24..
 */
'use strict';
let moment = require('moment');
const firebase = require('firebase');
const {fetchEntity} = require('../utils');

const addRide = (session, f) => {
    return ({sessionId, context, entities}) => {
        return new Promise((resolve, reject) => {
            // console.log(entities);
            // console.log(`adding ${context.departure} to ${context.arrival} at ${context.datetime}`);
            let fbid = session.getFbId(sessionId);
            let phone_number = fetchEntity(entities, 'phone_number');
            if(phone_number) {
                context.yesNumber = true;
                delete context.noNumber;
            } else {
                context.noNumber = true;
            }

            if(phone_number){
                f.getUserInfo(session.getFbId(sessionId))
                    .then((response) => {
                        return firebase.database().ref(`${context.departure}/${context.arrival}`).push({
                            fbid,
                            phone_number,
                            departure: context.departure,
                            arrival: context.arrival,
                            info: response,
                            datetime: context.datetime
                        });
                    })
                    .catch((e) => {
                        console.error(e);
                        f.txt(fbid, e);
                    });
            }
            //return resolve
            return resolve(context);
        })
    }
};

module.exports = addRide;