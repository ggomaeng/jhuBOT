/**
 * Created by ggoma on 2017. 2. 24..
 */
'use strict';
let moment = require('moment-timezone');
const firebase = require('firebase');
const {fetchEntity} = require('../utils');
const time_zone = "America/New_York";

const checkRides = (session, f) => {
    return ({sessionId, context, entities}) => {
        return new Promise((resolve, reject) => {
            //Fetch and extract entities
            let departure = fetchEntity(entities, 'departure');
            let arrival = fetchEntity(entities, 'arrival');
            let datetime = fetchEntity(entities, 'datetime');
            // console.log(entities);

            // console.log(`${departure} to ${arrival} at ${datetime}`);

            if(departure && arrival) {
                context.departure = departure;
                context.arrival = arrival;
                delete context.missingLocation;
            } else {
                context.missingLocation = true;
            }

            if(datetime) {
                context.datetime = datetime;
                delete context.missingTime;
            } else {
                context.missingTime = true;
            }



            if(context.arrival && context.departure && context.datetime) {
                delete context.noResult;
                delete context.missingLocation;
                delete context.missingTime;
                delete context.askAdd;
                let fbid = session.getFbId(sessionId);
                f.txt(fbid, `Give me a moment while I search for other people who are leaving from ${context.departure} to ${context.arrival} at ${moment.tz(context.datetime, time_zone).format('dddd, MMMM Do, h:mm a')}.`);

                let request = firebase.database().ref(`${context.departure}/${context.arrival}`);
                request.once('value')
                    .then((snapshot) => {
                        let obj = snapshot.val();
                        let result = [];
                        if(obj) {
                            Object.keys(obj).map((key) => {
                                let start = moment.tz(obj[key].datetime, time_zone);
                                let end = moment.tz(context.datetime, time_zone);
                                let diff = start.diff(end, 'minutes');
                                console.log('difference is:', diff);
                                if(Math.abs(diff) <=  60) {
                                    result.push(obj[key]);
                                }
                            });

                            //why is it undefined
                            // console.log(result);
                            if(result && result.length > 0) {
                                // console.log(result);


                                console.log('reporting?');
                                let elements = result.map(item => {
                                    return {
                                        title: `${item.info.first_name} ${item.info.last_name}`,
                                        image_url: `${item.info.profile_pic}`,
                                        subtitle: `${moment.tz(item.datetime, time_zone).format('dddd, MMMM Do, h:mm a')}`,
                                        buttons: [
                                            {
                                                type: "phone_number",
                                                title: "Call",
                                                payload: item.phone_number
                                            }
                                        ]
                                    }
                                });
                                f.txt(fbid, `Here are some people who are leaving around that time!`)
                                    .then(() => {
                                        f.generic(fbid, elements)
                                            .then(() => {
                                                // delete context.noResult;
                                                // delete context.missingLocation;
                                                // delete context.missingTime;
                                                context.askAdd = true;
                                                console.log('1');
                                                return resolve(context);
                                            })
                                    })

                            } else {
                                context.noResult = true;
                                console.log('2');
                                return resolve(context);
                            }
                        } else {
                            context.noResult = true;
                            console.log('3');
                            return resolve(context);
                        }
                    })
            } else {
                console.log('4');
                return resolve(context);
            }


        })
    }
};

module.exports = checkRides;