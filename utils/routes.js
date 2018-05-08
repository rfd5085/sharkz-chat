'use strict';

const helper = require('./helper');
const path = require('path');
class Routes{

	constructor(app){

		this.app = app;
	}
	
	appRoutes(){
		this.app.post('/usernameCheck',async (request,response) =>{
			const username = request.body.username;
			if (username === "" || username === undefined || username === null) {
				response.status(412).json({
					error : true,
					message : `username cant be empty.`
				});
			} else {
				const data = await helper.userNameCheck(username.toLowerCase());
				if (data[0]['count'] > 0) {
					response.status(401).json({
						error:true,
						message: 'This username is alreday taken.'
					});
				} else {
					response.status(200).json({
						error:false,
						message: 'This username is available.'
					});
				}
			}
		});		

		

		
		this.app.post('/userSessionCheck', async (request,response) =>{
			const userId = request.body.userId;
			const sessionCheckResponse = {}			
			if (userId == '') {
				sessionCheckResponse.error = true;
	            sessionCheckResponse.message = `User Id cant be empty.`;
	            response.status(412).json(sessionCheckResponse);
			}else{
				const username = await helper.userSessionCheck(userId);
				if (username === null || username === '') {
					sessionCheckResponse.error = true;
					sessionCheckResponse.message = `User is not logged in.`;
					response.status(401).json(sessionCheckResponse);
				}else{
					sessionCheckResponse.error = false;
					sessionCheckResponse.username = username;
					sessionCheckResponse.message = `User logged in.`;
					response.status(200).json(sessionCheckResponse);
				}
	        }
		});
		
		this.app.post('/getMessages',async (request,response) => {
			const userId = request.body.userId;
			const toUserId = request.body.toUserId;
			const messages = {}			
			if (userId === '') {
				messages.error = true;
	            messages.message = `userId cant be empty.`;
	            response.status(200).json(messages);
			}else{
				const result = await helper.getMessages( userId, toUserId);
				if (result ===  null) {
					messages.error = true;
					messages.message = `Internal Server error.`;
					response.status(500).json(messages);
				}else{
					messages.error = false;
					messages.messages = result;
					response.status(200).json(messages);
				}
	        }
		});
		
		this.app.get('*',(request,response) =>{
			response.sendFile(path.join(__dirname + '../../client/views/index.html'));
		});		
	}

	routesConfig(){
		this.appRoutes();
	}
}
module.exports = Routes;