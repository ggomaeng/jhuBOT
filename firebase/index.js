/**
 * Created by ggoma on 2017. 2. 24..
 */
const firebase = require('firebase');
const moment = require('moment');

module.exports = (session, f) => {
    fetchRides = (sessionId, context, departure, arrival, datetime) => {
        return new Promise((resolve, reject) => {
            let result = [];
            let fbid = session.getFbId(sessionId);

            f.txt(fbid, `Give me a moment while I search for other people who are leaving from ${departure} to ${arrival} at ${moment(datetime).format('dddd, MMMM Do, h:mm a')}.`)
                .then(() => {
                    console.log('retrieving data');
                    let request = firebase.database().ref(`${departure}/${arrival}`).once('child_added')
                        .then( snapshot => {
                            console.log('WORK');
                            let obj = snapshot.val();
                            let start = moment(obj.datetime);
                            let end = moment(datetime);
                            let diff = start.diff(end, 'minutes');
                            //filter the data
                            console.log('difference is:', diff);
                            if(Math.abs(diff) <=  60) {
                                result.push(obj);
                            }
                        })
                        .then(() => {
                            console.log('i am here!');
                            if(result.length == 0) {
                                //create a new one
                                console.log('creating new one?');
                                context.noResult = true;
                                // return;
                                resolve(false);
                            }

                            if(result && result.length > 0) {
                                // console.log(result);
                                delete context.noResult;
                                delete context.missingLocation;
                                delete context.missingTime;
                                context.jobDone = true;
                                console.log('reporting?');
                                let elements = result.map(item => {
                                    return {
                                        title: `${item.info.first_name} ${item.info.last_name}`,
                                        image_url: `${item.info.profile_pic}`,
                                        subtitle: `${moment(item.datetime).format('dddd, MMMM Do, h:mm a')}`,
                                        buttons: [
                                            {
                                                type: "phone_number",
                                                title: "Call",
                                                payload: item.phone_number
                                            }
                                        ]
                                    }
                                });
                                f.generic(fbid, elements);
                                resolve(true)

                            }
                        })
                        .catch((e) => {
                            console.log('fetching failed');
                            console.log(e)
                        });

                    console.log(request);

                });
            //retrieve first, then check if any exists within a time frame
            // ${moment(datetime).format('dddd, MMMM Do, h:mm a')}


        })
    };

    cancelRide = (departure, arrival, id, sessionId) => {
        console.log('im called');
        let fbid = session.getFbId(sessionId);
        let ref = firebase.database().ref(`${departure}/${arrival}/${id}`);
        // console.log(ref);
        ref.once('value', snapshot => {
            if(snapshot.val()) {
                ref.remove()
                    .then(() => {
                        f.txt(fbid, "I've removed the ride! :)");
                    })
            } else {
                f.txt(fbid, "I've already removed that ride!");
            }
        });
    };

    cancelBook = (key, isbn, fbid) => {
        console.log('removing with', key, fbid);
        let ref = firebase.database().ref(`users/${fbid}/books/${key}`);
        ref.once('value', snapshot => {
            if(snapshot.val()) {
                let updates = {};
                updates[`users/${fbid}/books/${key}`] = null;
                updates[`books/${isbn}/${key}`] = null;
                firebase.database().ref().update(updates)
                    .then(() => {
                        f.txt(fbid, "I've removed the book from the list! :)");
                    });
            } else {
                f.txt(fbid, "I've already removed that book!");
            }
        });
    }
};