var DatabaseModel = require('./database_model');


class Client extends DatabaseModel {

	constructor() {
		var attr = [
			'name',
			'cc',
			'phone',
		];
		super('client',attr);
		this.attr = attr;
	}
}

module.exports = Client;