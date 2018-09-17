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
		FROM product
		JOIN (transaction,transaction_pawn,client)
		ON (product.id = transaction.product_id AND transaction.client_id = client.id and transaction.id = transaction_pawn.transaction_id)
		where client.id = ?;
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

	/*
	SELECT product_id as id, types.state, name, inventory_id FROM (
		SELECT pawn.product_id, max(transaction.id) as transaction_id FROM (
			SELECT product.id as product_id, inventory_id, product.name as name, price, execution_date, transaction.id as transaction_id
			FROM product
			JOIN (transaction,transaction_pawn,client)
			ON (product.id = transaction.product_id AND transaction.client_id = client.id and transaction.id = transaction_pawn.transaction_id)
			where client.id = 2
		) as pawn 
		JOIN transaction
		ON (transaction.product_id = pawn.product_id)
		GROUP BY product_id
	) as transactions
	LEFT JOIN
	(
		(
			SELECT "pawn" as state, transaction_id FROM transaction_pawn
		)
			UNION
		(
			SELECT "extension_payment" as state, transaction_id FROM transaction_extension_payment
		)
			UNION
		(
			SELECT "close" as state, transaction_id FROM transaction_close
		)
			UNION
		(
			SELECT "shelf" as state, transaction_id FROM transaction_shelf
		)
			UNION
		(
			SELECT "shelf_to_pawn" as state, transaction_id FROM transaction_shelf_to_pawn
		)
			UNION
		(
			SELECT "sell" as state, transaction_id FROM transaction_sell
		)
	) as types 
	ON (types.transaction_id = transactions.transaction_id)
	JOIN product on (product.id = product_id);
	*/
	getProducts(callback) {
		if (!this.attrs === undefined || (this.attrs.id === undefined)) {
			callback(null);
			return
		}

		var q = "SELECT product_id as id, types.state, name, inventory_id FROM ( "
			+ "SELECT pawn.product_id, max(transaction.id) as transaction_id FROM ( "
				+ "SELECT product.id as product_id, inventory_id, product.name as name, price, execution_date, transaction.id as transaction_id "
				+ "FROM product "
				+ "JOIN (transaction,transaction_pawn,client) "
				+ "ON (product.id = transaction.product_id AND transaction.client_id = client.id and transaction.id = transaction_pawn.transaction_id) "
				+ "where client.id = ? "
			+ ") as pawn  "
			+ "JOIN transaction "
			+ "ON (transaction.product_id = pawn.product_id) "
			+ "GROUP BY product_id "
		+ ") as transactions "
		+ "LEFT JOIN "
		+ "( "
			+ "( "
				+ "SELECT 'pawn' as state, transaction_id FROM transaction_pawn "
			+ ") "
				+ "UNION "
			+ "( "
				+ "SELECT 'extension_payment' as state, transaction_id FROM transaction_extension_payment "
			+ ") "
				+ "UNION "
			+ "( "
				+ "SELECT 'close' as state, transaction_id FROM transaction_close "
			+ ") "
				+ "UNION "
			+ "( "
				+ "SELECT 'shelf' as state, transaction_id FROM transaction_shelf "
			+ ") "
				+ "UNION "
			+ "( "
				+ "SELECT 'shelf_to_pawn' as state, transaction_id FROM transaction_shelf_to_pawn "
			+ ") "
				+ "UNION "
			+ "( "
				+ "SELECT 'sell' as state, transaction_id FROM transaction_sell "
			+ ") "
		+ ") as types  "
		+ "ON (types.transaction_id = transactions.transaction_id) "
		+ "JOIN product on (product.id = product_id) "

		this.connection.query(q,[this.attrs.id],(err,rows) => {
			console.log(err)
			if (err || !rows || rows.length == 0) callback([]);
			else callback(rows);
		});
	}
}

module.exports = Client;