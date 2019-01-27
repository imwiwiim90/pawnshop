var DatabaseModel = require('./database_model');
var mysql = require('mysql');
var mysqlPool  = mysql.createPool(require('../database/config').pool);

/*pool.getConnection(function(err, connection) {
    connection.query( 'SELECT something FROM sometable', function(err, rows) {

      console.log(pool._freeConnections.indexOf(connection)); // -1

      connection.release();

      console.log(pool._freeConnections.indexOf(connection)); // 0

   });
});*/

class Transaction extends DatabaseModel {

	constructor(child_tbname,child_attrs_names) {
		var tbname = 'transaction';
		var attrs_names = [
			'product_id',
			'client_id',
			'execution_date',
		];
		child_tbname = tbname + '_' + child_tbname;
		super(tbname,attrs_names,{},child_tbname);

		this.child_tbname = child_tbname;
		this.child_attrs_names = child_attrs_names;

		this.Product = require('./product');
	}

	query_failed(connection,callback) {
		connection.rollback();
		connection.release();
		callback(null);
	}
	
	/* prev is a function called when the transaction is created */
	save(callback,prev) {
		if (this.after_product_state === undefined) return callback(null);

		var transaction = this;
		mysqlPool.getConnection((err,connection) => {
		if (err) return callback(null);
		connection.beginTransaction((err) => {
			if (err) return transaction.query_failed(connection,callback);

			if (!prev) prev = function(connection,callback) { callback(); }

			prev(connection, () => {
				if (this.attrs.product_id === undefined) return transaction.query_failed(connection,callback);
				var attrs_all = transaction.attrs;
				var super_tbname = transaction.tbname;

				var super_attrs = {};
				transaction.attrs_names.forEach(function(k) {
					if (attrs_all[k])
						super_attrs[k] = attrs_all[k];
				});
				var child_attrs = {};
				transaction.child_attrs_names.forEach(function(k) {
					if (k in transaction.child_attrs)
						child_attrs[k] = transaction.child_attrs[k];
				});

				transaction.attrs = super_attrs;
				// transaction parent
				super.save((id) => {
					if (id === null) {
						transaction.attrs = attrs_all;
						return transaction.query_failed(connection,callback);
					}

					transaction.tbname = transaction.child_tbname;
					child_attrs[super_tbname + '_id'] = id;
					transaction.attrs  = child_attrs;

					// transaction child
					super.save((id) => {
						transaction.tbname = super_tbname;
						transaction.attrs = attrs_all;

						if (id === null) 
							return transaction.query_failed(connection,callback);
						var product = new transaction.Product();
						product.set({
							id : transaction.attrs.product_id,
							state: transaction.after_product_state,
						}).update((product_id) => {
							if (product_id === null) return transaction.query_failed(connection,callback);
							connection.commit(function(err) {
								if (err) 
									return transaction.query_failed(connection,callback);
								connection.release();
								callback(id);
							});
						},connection);
					},connection);
				},connection);
			});

			
			

		});
		});
	}

	set(attrs) {
		super.set(attrs);
		var child_attrs = {};
		var keys = this.child_attrs_names;
		Object.keys(attrs).forEach(function(k) {
			if (keys.includes(k)) child_attrs[k] = attrs[k];
		});
		this.child_attrs = child_attrs;
		return this;
	}

	get(callback) {
		var q = "SELECT * FROM " + this.tbname
		+ " JOIN " + this.child_tbname
		+ " ON (" + this.tbname + ".id = " + this.tbname + "_id)";

		var where = " WHERE ";
		var attrs = {};
		for (var k in this.attrs) 
			attrs[k] = this.attrs[k];
		for (var k in this.child_attrs)
			attrs[k] = this.child_attrs[k];

		var attrs_keys = Object.keys(attrs);
		var attrs_vals = attrs_keys.map((k) => this.attrs[k])

		attrs_keys.forEach((k) => {
			if (k == 'id') k = this.tbname + '.id';
			where += ' ' + k + ' = ? AND';
		});
		where = where.slice(0,-3);

		q += where;

		console.log(q);

		this.connection.query(q,attrs_vals,function(err,rows) {
			if (err || !rows) callback(null);
			else callback(rows);
		})
	}
}

class Pawn extends Transaction {
	constructor() {
		var attr = [
			'price'
		];
		super('pawn',attr);
		this.attr = attr;
		this.after_product_state = 0;
	}

	save(callback) {
		super.save(
			(id) => callback(id),
			(connection,_callback) => {
				this.product.save((id) => {
					if (!isNaN(id)) this.attrs.product_id = id;
					_callback();
				},connection);
			}
		);
	}

	set(attrs) {

		super.set(attrs);
		if (attrs.product) {
			this.product = new this.Product();
			this.product.set(attrs.product);
		}
		return this;
	}

}

class Shelf extends Transaction {
	constructor() {
		var attr = [
		];
		super('shelf',attr);
		this.attr = attr;
		this.after_product_state = 1;
	}
}

class ExtensionPayment extends Transaction {
	constructor() {
		var attr = [
			"payment",
			"number_of_payments",
		];
		super('extension_payment',attr);
		this.attr = attr;
		this.after_product_state = 0;
	}
}

class Sell extends Transaction {
	constructor() {
		var attr = [
			"price",
		];
		super('sell',attr);
		this.attr = attr;
		this.after_product_state = 2;
	}
}

class ShelfToPawn extends Transaction {
	constructor() {
		var attr = [];
		super('shelf_to_pawn',attr);
		this.attr = attr;
		this.after_product_state = 0;
	}
}

class Close extends Transaction {
	constructor() {
		var attr = [
			"payment",
		];
		super('close',attr);
		this.attr = attr;
		this.after_product_state = 3;
	}
}

class Purchase extends Transaction {
	constructor() {
		var attr = [
			"price",
		];
		super('purchase',attr);
		this.attr = attr;
		this.after_product_state = 1;
	}

	save(callback) {
		super.save(
			(id) => callback(id),
			(connection,_callback) => {
				this.product.save((id) => {
					if (!isNaN(id)) this.attrs.product_id = id;
					_callback();
				},connection);
			}
		);
	}

	set(attrs) {

		super.set(attrs);
		if (attrs.product) {
			this.product = new this.Product();
			this.product.set(attrs.product);
		}
		return this;
	}

}

exports.Sell = Sell;
exports.Shelf = Shelf;
exports.ExtensionPayment = ExtensionPayment;
exports.Pawn = Pawn;
exports.ShelfToPawn = ShelfToPawn;
exports.Close = Close;
exports.Purchase = Purchase;