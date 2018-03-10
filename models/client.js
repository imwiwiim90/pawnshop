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
	/*
		SELECT product.id as id, inventory_id, product.name as name, price, execution_date
		FROM PRODUCTS
		JOIN (TRANSACTION,TRANSACTION_PAWN,CLIENT)
		ON (PRODUCTS.id = TRANSACTION.product_id AND TRANSACTION.client_id = CLIENT.id AND TRANSACTION.id = TRANSACTION_PAWN.transaction_id)
		where CLIENT.id = ?
	*/
	getPawn(callback) {
		if (!this.attrs === undefined || (this.attrs.id === undefined)) {
			callback(null);
			return
		}

		var q = "SELECT product.id as id, inventory_id, product.name as name, price, execution_date"
		+ " FROM product"
		+ " JOIN (transaction,transaction_pawn,client)"
		+ " ON (product.id = transaction.product_id AND transaction.client_id = client.id and transaction.id = transaction_pawn.transaction_id)"
		+ " where client.id = ?";

		console.log(q);
		this.connection.query(q,[this.attrs.id],(err,rows) => {
			if (err || !rows || rows.length == 0) callback([]);
			else callback(rows);
		});

	}
}

module.exports = Client;