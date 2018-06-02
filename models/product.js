var DatabaseModel = require('./database_model');

/* 
	----- state -----
	0 -> pawn
	1 -> shelf
	2 -> sold
	3 -> closed
*/

class Product extends DatabaseModel {

	constructor() {
		var attr = [
			'inventory_id',
			'name',
			'description',
			'state',
		];
		super('product',attr,{});
		this.attr = attr;
	}

	getInShelf(limits,callback) {
		var q = "SELECT name, max(execution_date) as execution_date, inventory_id, "+ this.tbname +".id" 
		+ " FROM " + this.tbname + " LEFT JOIN transaction ON (product.id = product_id)"
		+ " WHERE product.state = 1"
		+ " GROUP BY product.id ORDER BY execution_date DESC";
		this.connection.query(q,function(err,rows) {
			if (err || !rows || rows.length == 0) callback(null);
			else callback(rows);
		});
	}
	getSold(limits,callback) {
		var q = "SELECT name, execution_date, inventory_id, price, "+ this.tbname +".id"  
		+ " FROM " + this.tbname + " JOIN (transaction,transaction_sell) ON (product.id = product_id AND transaction.id = transaction_sell.transaction_id)"
		+ " WHERE product.state = 2"
		+ " ORDER BY execution_date DESC";
		this.connection.query(q,function(err,rows) {
			if (err || !rows || rows.length == 0) callback([]);
			else callback(rows);
		});
	}

	/*
	SELECT name, execution_date, payment, inventory_id
	FROM [product] JOIN ([transaction,transaction_close]) ON (product.id = product_id AND transaction.id = transaction_close.transaction_id)
	WHERE product.state = 3
	ORDER BY execution_date DESC
	*/
	getClosed(limits,callback) {
		var q = " SELECT name, execution_date, payment, inventory_id, " + this.tbname + ".id"
		+ " FROM " + this.tbname + " JOIN (transaction,transaction_close) ON (product.id = product_id AND transaction.id = transaction_close.transaction_id)"
		+ " WHERE product.state = 3"
		+ " ORDER BY execution_date DESC";
		this.connection.query(q,function(err,rows) {
			if (err || !rows || rows.length == 0) callback([]);
			else callback(rows);
		});
	}

	getPawn(limits,callback) {
		var q = "SELECT name, execution_date, price, inventory_id, " + this.tbname + ".id as id " 
		+ " FROM " + this.tbname + " JOIN (transaction,transaction_pawn) ON (product.id = product_id AND transaction.id = transaction_pawn.transaction_id)"
		+ " WHERE product.state = 0"
		+ " ORDER BY execution_date DESC";
		this.connection.query(q,function(err,rows) {
			console.log(err);
			if (err || !rows || rows.length == 0) callback([]);
			else callback(rows);
		});
	}

	getExpired(limits,callback) {
		var q = "SELECT * , (TIMESTAMPDIFF(MONTH,begin_date,NOW()) - payments) as debt FROM ( " +
					"SELECT id ,IFNULL(payments,0) as payments FROM (" +
						"SELECT product.id as id, SUM(number_of_payments) as payments " +
						"FROM product LEFT JOIN (transaction,transaction_extension_payment) " +
						"ON (product.id = transaction.product_id AND transaction.id = transaction_extension_payment.transaction_id ) " +
						"WHERE product.state = 0 " +
						"GROUP BY product.id " +
					") as nop" +
				") as number_of_payments JOIN " +
				"( " +
					"SELECT product.id as id ,inventory_id ,name, min(execution_date) as begin_date " +
					"FROM product INNER JOIN (transaction) " +
					"ON (product.id = product_id) " +
					"WHERE product.state = 0 " +
					"GROUP BY product.id " +
				") as product_begin_date " +
				"ON (number_of_payments.id = product_begin_date.id) " +
				"HAVING debt > 0 " +
				"ORDER BY debt DESC " ;
		this.connection.query(q,function(err,rows) {
			if (err || !rows || rows.length == 0) {
				console.log(err)
				callback([]);
			}
			else callback(rows);
		});
	}

	getHistory(product_id,callback) {

		var transactions = [];

		var transactionClasses = [
			require('./transaction').ExtensionPayment,
			require('./transaction').Pawn,
			require('./transaction').Sell,
			require('./transaction').Shelf,
			require('./transaction').ShelfToPawn,
			require('./transaction').Close,
		];
		var transactionNames = [
			'extension_payment',
			'pawn',
			'sell',
			'shelf',
			'shelf_to_pawn',
			'close',
		]
		// recursive call through all classes
		function getItems(i) {
			if (i == transactionClasses.length) {
				transactions.sort((a,b) => a.created_at < b.created_at);
				transactions.sort((a,b) => a.execution_date < b.execution_date);
				callback(transactions);
				return;
			}
			var transactionClass = new transactionClasses[i]();
			transactionClass.set({
				product_id : product_id,
			}).get(function(_transactions){
				transactions = transactions.concat(_transactions.map((item)=>{
					item.type = transactionNames[i];
					return item;
				}));
				getItems(i+1);
			});
		}
		getItems(0);
	}

	client(callback) {
		if (this.attrs === undefined || this.attrs.id === undefined) {
			callback(null);
			return;
		}

		var pid = this.attrs.id;
		var q = " SELECT client.id as id, client.name as name" 
		+ " FROM transaction JOIN (transaction_pawn,product,client)"
		+ " ON (transaction_pawn.transaction_id = transaction.id AND transaction.product_id = product.id AND transaction.client_id = client.id)"
		+ " WHERE product.id = ?";

		this.connection.query(q,[pid],function(err,rows){
			if (err || !rows || rows.length == 0) callback(null);
			else callback(rows[0]);
		});
	}


	/* 
	SELECT * FROM
		(SELECT transaction.id ,'pawn' as 'type' from transaction JOIN transaction_pawn on (transaction.id = transaction_pawn.transaction_id))
		UNION
		(SELECT transaction.id ,'extension_payment' as 'type' from transaction JOIN transaction_extension_payment on (transaction.id = transaction_extension_payment.transaction_id))
		UNION
		(SELECT transaction.id ,'sell' as 'type' from transaction JOIN transaction_sell on (transaction.id = transaction_sell.transaction_id))
		UNION
		(SELECT transaction.id ,'shelf' as 'type' from transaction JOIN transaction_shelf on (transaction.id = transaction_shelf.transaction_id))
		UNION
		(SELECT transaction.id ,'shelf_to_pawn' as 'type' from transaction JOIN transaction_shelf_to_pawn on (transaction.id = transaction_shelf_to_pawn.transaction_id))
	WHERE id = ?;


	SELECT * FROM ( (SELECT transaction.id ,'pawn' as 'type' from transaction JOIN transaction_pawn on (transaction.id = transaction_pawn.transaction_id)) UNION (SELECT transaction.id ,'extension_payment' as 'type' from transaction JOIN transaction_extension_payment on (transaction.id = transaction_extension_payment.transaction_id)) UNION (SELECT transaction.id ,'sell' as 'type' from transaction JOIN transaction_sell on (transaction.id = transaction_sell.transaction_id)) UNION (SELECT transaction.id ,'shelf' as 'type' from transaction JOIN transaction_shelf on (transaction.id = transaction_shelf.transaction_id)) UNION (SELECT transaction.id ,'shelf_to_pawn' as 'type' from transaction JOIN transaction_shelf_to_pawn on (transaction.id = transaction_shelf_to_pawn.transaction_id))) AS TB1 WHERE id = 22
	*/
	deleteLastTransaction(callback) {
		if (!this.attrs === undefined || (this.attrs.id === undefined)) {
			callback(false);
			return;
		}
		this.connection.beginTransaction((err) => {
			if (err) {
				connection.rollback();
				connection.release();
				callback(false);
				return
			}

			// get last 2 transactions
			var product_id = this.attrs.id;
			var q = 'SELECT *, transaction.id as transaction_id FROM transaction LEFT JOIN (product) ON (transaction.product_id = product.id) WHERE product.id = ? ORDER BY transaction.created_at DESC, execution_date DESC LIMIT 2'
			this.connection.query(q,[product_id],(err,rows) => {
				if (err || !rows || rows.length == 0) {
					connection.rollback();
					connection.release();
					callback(false);
					return
				}
				var transaction_id = rows[0].transaction_id;

				// delete
				var q = 'DELETE FROM transaction WHERE id = ' + transaction_id;
				this.connection.query(q,(err) => {
					if (err) {
						connection.rollback();
						callback(false);
						return
					}
					var q = "SELECT * FROM ("
						+ " (SELECT transaction.id ,'pawn' as 'type' from transaction JOIN transaction_pawn on (transaction.id = transaction_pawn.transaction_id))"
						+ " UNION"
						+ " (SELECT transaction.id ,'extension_payment' as 'type' from transaction JOIN transaction_extension_payment on (transaction.id = transaction_extension_payment.transaction_id))"
						+ " UNION"
						+ " (SELECT transaction.id ,'sell' as 'type' from transaction JOIN transaction_sell on (transaction.id = transaction_sell.transaction_id))"
						+ " UNION"
						+ " (SELECT transaction.id ,'shelf' as 'type' from transaction JOIN transaction_shelf on (transaction.id = transaction_shelf.transaction_id))"
						+ " UNION"
						+ " (SELECT transaction.id ,'shelf_to_pawn' as 'type' from transaction JOIN transaction_shelf_to_pawn on (transaction.id = transaction_shelf_to_pawn.transaction_id))"
					+ ") AS TB1 WHERE id = ?";

					this.connection.query(q,[rows[1].transaction_id], (err,rows) => {

						if (err || !rows || rows.length == 0) {
							this.connection.rollback();
							callback(false);
							return
						}
						var transaction_type = rows[0].type;
						var new_state = 0;
						if (transaction_type == 'extension_payment' || transaction_type == 'pawn' || transaction_type == 'shelf_to_pawn')
								new_state = 0; // pawn
						if (transaction_type == 'sell')
								new_state = 2; // sold
						if (transaction_type == 'shelf')
								new_state = 1; // shelf

						this.set({
							id : product_id,
							state: new_state,
						}).update((id) => {
							if (!id) {
								this.connection.rollback();
								callback(false);
								return
							}

							this.connection.commit((err) => {
								if (err)  {
									this.connection.rollback();
									callback(false);
								}
								callback(true);
							});

						});
					})
				});
			});	
		});
		
	}


}


module.exports = Product;