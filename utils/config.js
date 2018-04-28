class Config{
	
	constructor(app){
		app.set('view engine', 'html');

		app.set('views', (__dirname + '/../views'));

		app.use(require('express').static(require('path').join('client')));

	}
}
module.exports = Config;