var mysql = require('mysql');
var connection = mysql.createConnection(require('../database/config').data);


class DatabaseModel {
	constructor(tbname,attrs_names,associations,dependency) {
		this.attrs_names = attrs_names;
		this.tbname = tbname;
		this.associations = associations;
		this.dependency = dependency

		this.connection = connection;
		attrs_names.push('id','created_at');
	}

	/* 
	   set instance atributes either to create a new database row
	   or update one
	*/
	set(attrs) {
		var keys = this.attrs_names;
		var model_attrs = {};
		Object.keys(attrs).forEach(function(k) {
			if (keys.includes(k)) model_attrs[k] = attrs[k];
		});
		console.log(model_attrs)
		this.attrs = model_attrs;
		return this;
	}

	/*
		update a data entity if the id attr is set
	*/
	update(callback,connection) {
		connection = (connection ? connection : this.connection );
		if (this.attrs.id === undefined) {
			callback(null);
			return;
		}
		var id = this.attrs.id;
		var attrs_keys = Object.keys(this.attrs);
		var attrs = this.attrs;
		delete attrs_keys.id;

		var q = 'UPDATE ' + this.tbname + ' SET ';
		attrs_keys.forEach(function(key){
			q += key + " = ?,";
		});
		q = q.slice(0,-1);

		q += ' WHERE id = ?';

		console.log(q);
		var attrs_vals = attrs_keys.map(function(k) { return attrs[k]; });
		connection.query(q,[...attrs_vals,id],function(err,result){
			if (err) callback(null);
			else callback(id);
		});
	}

	/*
		delete a data entity if the id attr is set
	*/
	delete(callback,connection) {
		connection = (connection ? connection : this.connection );
		if (this.attrs.id === undefined) {
			callback(null);
			return;
		}
		var id = this.attrs.id;
		var q = 'DELETE FROM ' + this.tbname + ' WHERE id = ?';
		connection.query(q,[id],function(err,result) {
			console.log(err);
			callback(null);
		});
	}

	/*
	 save a new entity if the id|created_at attr is not set
	*/
	save(callback,connection) {
		connection = (connection ? connection : this.connection );
		if ('id' in this.attrs || 'created_at' in this.attrs) {
			callback(null);
			return;
		}
		var attrs = this.attrs;
		var attrs_keys = Object.keys(attrs);

		var q = 'INSERT INTO ' + this.tbname + ' (';
		attrs_keys.forEach(function(key){
			q += key + ",";
		});
		q = q.slice(0,-1);
		q += ') VALUES (';

		attrs_keys.forEach(function(key) {
			q += '?,' ;
		});		
		q = q.slice(0,-1) + ')';

		var attrs_vals = attrs_keys.map(function(k) { return attrs[k]; });

		console.log(q)
		console.log(attrs_vals);

		connection.query(q,attrs_vals,function(err,result){
			console.log(err);
			if (err) callback(null);
			else callback(result.insertId);
		});
	}

	get(callback) {
		if (this.attrs === undefined ) {
			callback(null);
			return;
		}
		/* not id given, use where */
		if (this.attrs.id === undefined) {
			var attrs_keys = Object.keys(this.attrs);
			var attrs_vals = attrs_keys.map((k) => { return this.attrs[k]; });

			var where = " WHERE ";
			attrs_keys.forEach(function(k){
				where += " " + k + " = ? AND";
			})
			where = where.slice(0,-3);

			var q = "SELECT * FROM " + this.tbname + where;

			console.log(q);

			connection.query(q,attrs_vals,function(err,rows){
				if (err || !rows ) {
					console.log(err);
					callback(null);
				}
				else callback(rows);
			});
			return;
		}
		var id =  this.attrs.id;

		if (!this.dependency) {
			var q = "SELECT * FROM " + this.tbname + " WHERE id = ?";
			connection.query(q,[id],function(err,rows) {
				if (err || !rows || rows.length == 0) callback(null);
				else callback(rows[0]);
			});
		}
		else {
			// id is the MASTER id
			var q = "SELECT * FROM " + this.tbname
			+ " LEFT JOIN " + this.dependency 
			+ " ON (" + this.tbname + ".id = " + this.tbname + "_id)"
			+ " WHERE " + this.tbname + ".id = ?";

			this.connection.query(q,[id],function(err,rows) {
				if (err || !rows || rows.length == 0) callback(null);
				else callback(rows[0]);
			});	
		}
	}

	all(callback) {
		var q = "SELECT * FROM " + this.tbname;

		this.connection.query(q,function(err,rows) {
			if (err || !rows || rows.length == 0) callback(null);
			else callback(rows);
		});
	}
}



module.exports = DatabaseModel;


