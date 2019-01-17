var DatabaseModel = require('./database_model');


class User extends DatabaseModel {

	constructor() {
		var attr = [
			'username',
			'password',
		];
		super('user',attr);
		this.attr = attr;
	}
	
}

module.exports = User;