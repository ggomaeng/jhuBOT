'use strict';
const request = require('request');
const crypto = require('crypto');

class FBeamer {
	constructor(config) {
	    // console.log(config);
		try {
			if(!config || config.PAGE_ACCESS_TOKEN === undefined || config.VERIFY_TOKEN === undefined || config.APP_SECRET === undefined
            || config.SIMSIMI === undefined) {
				throw new Error("Unable to access tokens!");
			} else {
				this.PAGE_ACCESS_TOKEN = config.PAGE_ACCESS_TOKEN;
				this.VERIFY_TOKEN = config.VERIFY_TOKEN;
				this.APP_SECRET = config.APP_SECRET;
				this.SIMSIMI = config.SIMSIMI;
			}
		} catch(e) {
			console.log(e);
		}
	}

	registerHook(req, res) {
		// If req.query.hub.mode is 'subscribe'
		// and if req.query.hub.verify_token is the same as this.VERIFY_TOKEN
		// then send back an HTTP status 200 and req.query.hub.challenge
		let {
			mode, 
			verify_token, 
			challenge
		} = req.query.hub;

		if(mode === 'subscribe' && verify_token === this.VERIFY_TOKEN) {
			return res.end(challenge);
		} else {
			console.log("Could not register webhook!");
			return res.status(403).end();
		}
	}

	verifySignature(req, res, next) {
		if(req.method === 'POST') {
			let signature = req.headers['x-hub-signature'];
			try {
				if(!signature) {
					throw new Error("Signature missing!");
				} else {
					let hash = crypto.createHmac('sha1', this.APP_SECRET).update(JSON.stringify(req.body)).digest('hex');
					try {
						if(hash !== signature.split("=")[1]) {
							throw new Error("Invalid Signature");
						} 
					} catch(e) {
							res.send(500, e);
						}
				}
			} catch(e) {
				res.send(500, e);
			}
		} 

		return next();

	}

	getUserInfo(fbid) {
        return new Promise((resolve, reject) => {
            // Create an HTTP POST request
            request({
                uri: `https://graph.facebook.com/v2.6/${fbid}?fields=first_name,last_name,profile_pic`,
                qs: {
                    access_token: this.PAGE_ACCESS_TOKEN
                },
                method: 'GET',
            }, (error, response, body) => {
                if(!error && response.statusCode === 200) {
                    resolve(JSON.parse(body));
                } else {
                    reject(error);
                }
            });
        });

	}

	subscribe() {
		request({
			uri: 'https://graph.facebook.com/v2.6/me/subscribed_apps',
			qs: {
				access_token: this.PAGE_ACCESS_TOKEN
			},
			method: 'POST'
		}, (error, response, body) => {
			if(!error && JSON.parse(body).success) {
				console.log("Subscribed to the page!");
			} else {
				console.log(error);
			}
		});
	}

	incoming(req, res, cb) {
		// Extract the body of the POST request
		let data = req.body;
		if(data.object === 'page') {
			// Iterate through the page entry Array
			data.entry.forEach(pageObj => {
				// Iterate through the messaging Array
				pageObj.messaging.forEach(msgEvent => {
					let messageObj = {
						sender: msgEvent.sender.id,
						timeOfMessage: msgEvent.timestamp,
						message: msgEvent.message || undefined,
						postback: msgEvent.postback || undefined 
					}
					
					cb(messageObj);
				});
			});
		}
		res.send(200);
	}

	sendMessage(payload) {
		return new Promise((resolve, reject) => {
			// Create an HTTP POST request
			request({
				uri: 'https://graph.facebook.com/v2.6/me/messages',
				qs: {
					access_token: this.PAGE_ACCESS_TOKEN
				},
				method: 'POST',
				json: payload
			}, (error, response, body) => {
				if(!error && response.statusCode === 200) {
					resolve({
						messageId: body.message_id
					});
				} else {
					reject(error);
				}
			});
		});
	}

	sendSimsimi(text) {
	    console.log('simsimi received', text);
	    let lang = "en";
	    let filter = 1.0;
	    let PROD = 'http://api.simsimi.com/request.p';
	    let DEV = 'http://sandbox.api.simsimi.com/request.p';
        return new Promise((resolve, reject) => {
            request({
                uri: `${PROD}?key=${this.SIMSIMI}&lc=${lang}&ft=${filter}&text=${text}`,
                method: 'GET'
            }, (error, response, body) => {
                if(!error && response.statusCode === 200) {
                    console.log(body);
                    resolve(JSON.parse(body));
                    // resolve();
                } else {
                    reject(error);
                }
            });
        })
    }

	// Send a text message
	txt(id, text) {
		let obj = {
			recipient: {
				id
			},
			message: {
				text
			}
		}

		return this.sendMessage(obj)
			.catch(error => console.log(error));
	}

	generic(id, elements) {
	    let obj = {
	        recipient: {
	            id
            },
            message: {
	            attachment: {
	                type: 'template',
                    payload: {
	                    template_type: 'generic',
                        elements: elements
                    }
                }
            }
        }
        return this.sendMessage(obj)
            .catch(error => console.log(error));
    }

    showPersistent(payload) {
	    let obj = {
	        setting_type: "call_to_actions",
            thread_state: "existing_thread",
            call_to_actions: payload
        };

        request({
            uri: 'https://graph.facebook.com/v2.6/me/thread_settings',
            qs: {
                access_token: this.PAGE_ACCESS_TOKEN
            },
            method: 'POST',
            json: obj,
        }, (error, response) => {
	        if(error) {
	            console.log(error);
            }
        })
    }

    quick(id, data) {
	    let obj = {
	        recipient: {
	            id
            },
            message: {
                text: data.text,
                quick_replies: data.buttons
            }
        };

        return this.sendMessage(obj)
            .catch(error => console.log(error));
    }

    button(id, data) {
	    let obj = {
	        recipient: {
	            id
            },
            message: {
	            attachment: {
	                type: "template",
                    payload: {
	                    template_type: "button",
                        text: data.text,
                        buttons: data.buttons
                    }
                }

            }
        };

        return this.sendMessage(obj)
            .catch(error => console.log(error));
    }

    list(id, data) {
	    let obj = {
	        recipient: {
	            id
            },
            message: {
	            attachment: {
	                type: 'template',
                    payload: {
	                    template_type: 'list',
                        text: data.text
                    }
                }
            }
        }

    }

	// Send an image message
	img(id, url) {
		let obj = {
			recipient: {
				id
			},
			message: {
				attachment: {
					type: 'image',
					payload: {
						url
					}
				}
			}
		}

		this.sendMessage(obj)
			.catch(error => console.log(error));
	}

}

module.exports = FBeamer;