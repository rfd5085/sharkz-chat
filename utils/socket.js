'use strict';

const path = require('path');
const helper = require('./helper');

class Socket{

    constructor(socket){
        this.io = socket;
    }
    
    socketEvents(){

        this.io.on('connection', (socket) => {

            socket.on('chat-list', async (userId) => {



               let chatListResponse = {};

                if (userId === '' && (typeof userId !== 'string' || typeof userId !== 'number')) {

                    chatListResponse.error = true;
                    chatListResponse.message = `User does not exits.`;
                    
                    this.io.emit('chat-list-response',chatListResponse);
                }else{
                    var chats = await helper.getChats(userId);
                    const result = await helper.getChatList(userId, socket.id, chats);
                    const userInfo = await helper.getUserInfo(userId);

                    if(result != null){
                    this.io.to(socket.id).emit('chat-list-response', {
                        error: result !== null ? false : true,
                        singleUser: false,
                        chatList: result.chatlist
                    });
                


                    socket.broadcast.emit('chat-list-response', {
                        error: result !== null ? false : true,
                        singleUser: true,
                        chatList: userInfo
                    });
                }
                }
            });


            socket.on('open-chats', async (data) => {
                    var fromchats = await helper.getChats(data.fromUserId);
                    var tochats = await helper.getChats(data.toUserId);
                    const sqlResult = await helper.addChat({
                        fromUserId: data.fromUserId,
                        toUserId: data.toUserId,
                        fromchats: fromchats,
                        tochats: tochats
                    });
            });

            socket.on('delete-chat', async (data) => {
                    var chats = await helper.getChats(data.fromUserId);
                    const sqlResult = await helper.deleteChat({
                        fromUserId: data.fromUserId,
                        deleteId: data.deleteId,
                        chats: chats
                    });
            });

            socket.on('username-check', async (data) => {

                var check = await helper.usernameChecker(data);
                               
                    let checkResponse = {};
                    checkResponse.error = check;

                    this.io.emit('username-check-response',checkResponse);
            });




            socket.on('add-message', async (data) => {
                
                if (data.message === '') {
                    
                    this.io.to(socket.id).emit(`add-message-response`,`Message cant be empty`); 

                }else if(data.fromUserId === ''){
                    
                    this.io.to(socket.id).emit(`add-message-response`,`Unexpected error, Login again.`); 

                }else if(data.toUserId === ''){
                    
                    this.io.to(socket.id).emit(`add-message-response`,`Select a user to chat.`); 

                }else{                    
                    let toSocketId = data.toSocketId;
                    const sqlResult = await helper.insertMessages({
                        fromUserId: data.fromUserId,
                        toUserId: data.toUserId,
                        message: data.message
                    });
                    this.io.to(toSocketId).emit(`add-message-response`, data); 
                }               
            });



            socket.on('disconnect',async ()=>{
                const isLoggedOut = await helper.logoutUser(socket.id);
                setTimeout(async ()=>{
                    const isLoggedOut = await helper.isUserLoggedOut(socket.id);
                    if (isLoggedOut && isLoggedOut !== null) {
                        socket.broadcast.emit('chat-list-response', {
                            error: false,
                            userDisconnected: true,
                            socketId: socket.id
                        });
                    }
                },1000);
            });

        });

    }
    
    socketConfig(){

        this.io.use( async (socket, next) => {
            let userId = socket.request._query['userId'];
            let userSocketId = socket.id;          
            const response = await helper.addSocketId( userId, userSocketId);
            if(response &&  response !== null){
                next();
            }else{
                console.error(`Socket connection failed, for  user Id ${userId}.`);
            }
        });

        this.socketEvents();
    }
}
module.exports = Socket;
