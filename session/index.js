/**
 * Created by ggoma on 2017. 2. 24..
 */
'use strict';
const {findById} = require('../utils');
const crypto = require('crypto');
const sessionStore = new Map();
const session = {
    init(id) {
        //find a session object by fbid
        let sessionId = findById(id, sessionStore);
        if(sessionId) {
            return sessionId;
        } else {
            //make new sessionId
            let newSessionId = crypto.randomBytes(12).toString('hex');
            let obj = {
                fbid: id,
                context: {}
            };

            sessionStore.set(newSessionId, obj);
            return newSessionId;
        }
    },

    get(sessionId) {
        return sessionStore.get(sessionId);
    },

    getFbId(sessionId) {
        return sessionStore.get(sessionId).fbid;
    },

    update(sessionId, context) {
        let obj = sessionStore.get(sessionId);
        obj.context = context;
        return sessionStore.set(sessionId, obj);
    },

    delete(sessionId) {
        return sessionStore.delete(sessionId);
    }
};

module.exports = session;