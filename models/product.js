var DatabaseModel = require('./database_model');

/* 
	----- state -----
	0 -> pawn
	1 -> shelf
	2 -> sold
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
		console.log(q);
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
		console.log(q);
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
		console.log(q);
		this.connection.query(q,function(err,rows) {
			console.log(err);
			if (err || !rows || rows.length == 0) callback([]);
			else callback(rows);
		});
	}

	getExpired(limits,callback) {
		var q = "SELECT * , (TIMESTAMPDIFF(MONTH,begin_date,NOW()) - payments) as debt FROM ( "
					+ "SELECT product.id as id, SUM(number_of_payments) as payments "
					+ "FROM product JOIN (transaction,transaction_extension_payment) "
					+ "ON (product.id = transaction.product_id AND transaction.id = transaction_extension_payment.transaction_id ) "
					+ "WHERE product.state = 0 "
					+ "GROUP BY product.id "
				+ ") as number_of_payments JOIN "
				+ "("
					+ "SELECT product.id as id ,inventory_id ,name, min(execution_date) as begin_date "
					+ "FROM product INNER JOIN (transaction) "
					+ "ON (product.id = product_id) "
					+ "WHERE product.state = 0 "
					+ "GROUP BY product.id "
				+ ") as product_begin_date "
				+ "ON (number_of_payments.id = product_begin_date.id) "
				+ "ORDER BY debt DESC";
		console.log(q);
		this.connection.query(q,function(err,rows) {
			if (err || !rows || rows.length == 0) callback([]);
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
		];
		var transactionNames = [
			'extension_payment',
			'pawn',
			'sell',
			'shelf',
			'shelf_to_pawn',
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


}


module.exports = Product;