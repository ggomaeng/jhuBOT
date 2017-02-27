/**
 * Created by ggoma on 2017. 2. 27..
 */
'use strict';
let moment = require('moment-timezone');
const firebase = require('firebase');
const time_zone = "America/New_York";

const showRides = (session, f) => {
    return ({sessionId, context, entities}) => {
        return new Promise((resolve, reject) => {
            let fbid = session.getFbId(sessionId);
            let myRides = [];
            console.log('im here!!!!!');
            let dbRef = firebase.database().ref(`/`);
            dbRef.once('value', locations => {
                locations.forEach((departures) => {
                    departures.forEach((arrivals) => {
                        arrivals.forEach((ride) => {
                            // console.log(ride.key);
                            if(ride.val().fbid === fbid) {
                                let obj = ride.val();
                                obj.key = ride.key;
                                myRides.push(obj);
                            }
                        })
                    })
                })
            })
                .then(() => {
                    // console.log(myRides);
                    if(myRides && myRides.length == 0) {
                        f.txt(fbid, "You have no planned rides!");
                    } else {
                        myRides.map((item) => {
                            let {departure, arrival, datetime, key} = item;
                            // console.log(item);
                            let data = {
                                text: `${departure} to ${arrival} on ${moment.tz(datetime, time_zone).format('dddd, MMMM Do, h:mm a')}`,
                                buttons: [{
                                    type: 'postback',
                                    title: 'Cancel Ride',
                                    payload: `{"departure":"${departure}", "arrival":"${arrival}", "id": "${key}"}`
                                }]
                            };

                            f.button(fbid, data);
                        });
                    }
                    return resolve(context);
                });


        })
    }
};

module.exports = showRides;