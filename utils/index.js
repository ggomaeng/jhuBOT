/**
 * Created by ggoma on 2017. 2. 24..
 */
'use strict';

const findById = (fbid, sessionStore) => {
    for(let [key, value] of sessionStore) {
        return value.fbid === fbid ? key : null;
    }
};

const fetchEntity = (entities, entity) => {
    const val = entities && entities[entity] &&
            Array.isArray(entities[entity]) &&
            entities[entity].length > 0 &&
            entities[entity][0].value;

    if(!val) {
        return null;
    } else {
        return typeof val === 'object' ? val.value : val;
    }
}

module.exports = {
    findById,
    fetchEntity
}