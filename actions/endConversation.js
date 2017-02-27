/**
 * Created by ggoma on 2017. 2. 24..
 */
'use strict';

const endConversation = ({sessionId, context, entities}) => {
    return new Promise((resolve, reject) => {
        context.jobDone = true;
        return resolve(context);
    }) ;
};

module.exports = endConversation;