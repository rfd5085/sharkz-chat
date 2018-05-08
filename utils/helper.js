'user strict';
const DB = require('./db');

class Helper{
	
	constructor(app){
		this.db = DB;
	}

	async userNameCheck (username){
		return await this.db.query(`SELECT count(tag) as count FROM users WHERE LOWER(tag) = ?`, `${username}`);
	}


	async loginUser(params){
		try {
			return await this.db.query(`SELECT id FROM users WHERE LOWER(tag) = ? AND password = ?`, [params.username,params.password]);
		} catch (error) {
			return null;
		}
	}

	async userSessionCheck(userId){
		try {
			const result = await this.db.query(`SELECT online,tag FROM users WHERE id = ? AND online = ?`, [userId,'Y']);
			if(result !== null){
				return result[0]['username'];
			}else{
				return null;
			}
		} catch (error) {
			return null;
		}
	}

	async addSocketId(userId, userSocketId){
		try {
			return await this.db.query(`UPDATE users SET socketid = ?, online= ? WHERE id = ?`, [userSocketId,'Y',userId]);
		} catch (error) {
			console.log(error);
			return null;
		}
	}

	async usernameChecker (username){
		var checkForUser = null;
		checkForUser = await this.db.query(`SELECT tag FROM users WHERE tag = ?`, [username]);

		var check = JSON.stringify(checkForUser)
		if(check.length == 2){
			return false;
		}else{
			return true;
		}
	}

	async deleteChat (params){
		var chats = [];
		var i = 0;



		for(i; i<params.chats.length; i++){
			if(params.deleteId !== params.chats[i]){
				chats.push(params.chats[i]);
			}
		}
		chats.toString();

	await this.db.query(`Update users set open_chats = ? where id = ?`, [chats, params.fromUserId]);

	}

	async addChat(params){
		try {
			var to_user_id = await this.db.query('SELECT id FROM users WHERE tag = ?', [params.toUserId]);
			var resultArray = Object.values(JSON.parse(JSON.stringify(to_user_id)))
			var id = parseInt(resultArray[0].id);
			var i = 0;
			var chatExists = false;
			var stringToAdd;
			var chatString;
			var chats = [];

			var stringToAdd2;
			var chatString2;
			var chats2 = [];
			

			var myObj = await this.db.query(`SELECT open_chats FROM users WHERE id = ?`, [params.fromUserId]);
			var chatsArray = Object.values(JSON.parse(JSON.stringify(myObj)))
			var chatString = chatsArray[0].open_chats;

			if(chatString !== null){

				chats = chatString.split(",").map(Number);

  				for(i = 0; i<chats.length; i++){
  					if(chats[i] == id){
  						chatExists = true;
  						break;
  					}
  				}

  				if(chatExists != true){
				stringToAdd = chatString + "," + id;
				await this.db.query(`UPDATE users SET open_chats = ? WHERE id =?`, [stringToAdd, params.fromUserId]);
				}

			}else{

				await this.db.query(`UPDATE users SET open_chats = ? WHERE id =?`, [id, params.fromUserId]);

			}


			chatExists = false;
			myObj = await this.db.query(`SELECT open_chats FROM users WHERE id = ?`, [id]);
			chatsArray = Object.values(JSON.parse(JSON.stringify(myObj)))
			chatString2 = chatsArray[0].open_chats;

			if(chatString2 !== null){

				chats2 = chatString2.split(",").map(Number);

  				for(i = 0; i<chats2.length; i++){
  					if(chats2[i] == params.fromUserId){
  						chatExists = true;
  						break;
  					}
  				}

  				if(chatExists != true){
				stringToAdd2 = chatString2 + "," + params.fromUserId;
				await this.db.query(`UPDATE users SET open_chats = ? WHERE id =?`, [stringToAdd2, id]);
				}

			}else{

				await this.db.query(`UPDATE users SET open_chats = ? WHERE id =?`, [params.fromUserId, id]);

			}

	
		} catch (error) {
			console.log(error);
			return null;
		}

	}

	async getChats(userId){
				
			var i = 0;
			var chats = [];


		try {

			var myObj = await this.db.query(`SELECT open_chats FROM users WHERE id = ?`, [userId]);
			var chatsArray = Object.values(JSON.parse(JSON.stringify(myObj)))
			var chatString = chatsArray[0].open_chats;

			if(chatString !== null){

				chats = chatString.split(",").map(Number);
  				

			}			

				return chats;

			}catch (error) {
			return null;
		}


	}

	async isUserLoggedOut(userSocketId){
		try {
			return await this.db.query(`SELECT online FROM users WHERE socketid = ?`, [userSocketId]);
		} catch (error) {
			return null;
		}
	}

	async logoutUser(userSocketId){
		return await this.db.query(`UPDATE users SET socketid = ?, online= ? WHERE socketid = ?`, ['','N',userSocketId]);
	}


getUserInfo(userId, userSocketId, chats){
		var userinfo = {};
try {
			
				userinfo = this.db.query(`SELECT id,tag,online,socketid FROM users WHERE id = ?`, [userId]);
				return userinfo;
			}catch (error) {
			return null;
		}
	
	}


getChatList(userId, userSocketId, chats){
		
	var sqlStatement = 'SELECT id,tag AS username,online,socketid FROM users WHERE ';
	var i = 0;

	if(chats.length !== 0){

	for(i; i<chats.length; i++){
		sqlStatement = sqlStatement + "id = " + chats[i];
		if(i<chats.length -1){
			sqlStatement = sqlStatement + " OR ";
		}
	}

		try {
			return Promise.all([
				this.db.query(`SELECT id,tag AS username,online,socketid FROM users WHERE id = ?`, [userId]),
				this.db.query(sqlStatement)
			]).then( (response) => {
				return {
					userinfo : response[0].length > 0 ? response[0][0] : response[0],
					chatlist : response[1]
				};
			}).catch( (error) => {
				console.warn(error);
				return (null);
			});
		} catch (error) {
			console.warn(error);
			return null;
		}
	}else{
		return null;
	}
	}


	async insertMessages(params){
		try {

			return await this.db.query(
				"INSERT INTO messages (`from_user_id`,`to_user_id`,`message`) values (?,?,?)",
				[params.fromUserId, params.toUserId, params.message]
			);
		} catch (error) {
			console.warn(error);
			return null;
		}		
	}

	async getMessages(userId, toUserId){
		try {
			return await this.db.query(
				`SELECT id,from_user_id as fromUserId,to_user_id as toUserId,message FROM messages WHERE 
					(from_user_id = ? AND to_user_id = ? )
					OR
					(from_user_id = ? AND to_user_id = ? )	ORDER BY id ASC				
				`,
				[userId, toUserId, toUserId, userId]
			);
		} catch (error) {
			console.warn(error);
			return null;
		}
	}
}
module.exports = new Helper();