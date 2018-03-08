// extension_payment
$.ajax({
	url: 'http://localhost:3000/api/transaction/extension_payment/new',
	method: 'POST',
	dataType: 'json',
	contentType: "application/json; charset=utf-8",
	data: JSON.stringify({
		product_id : '6',
		execution_date: '2018-01-25',
		payment : '2000',
		number_of_payments : '2',
	}),
}).done(function(msg){
	console.log(msg);
}).error(function(msg){console.log(msg)});

//pawn
$.ajax({
	url: 'http://localhost:3000/api/transaction/pawn/new',
	method: 'POST',
	dataType: 'json',
	contentType: "application/json; charset=utf-8",
	data: JSON.stringify({
		price : '1000',
		execution_date: '2017-11-24',
		product: {
			'name' : 'Walkman',
			'inventory_id' : '117',
			'description' : 'Estado perfecto',
		},
	}),
}).done(function(msg){
	console.log(msg);
}).error(function(msg){console.log(msg)});

// sell
$.ajax({
	url: 'http://localhost:3000/api/transaction/sell/new',
	method: 'POST',
	data: {
		product_id : '2',
		execution_date: '2018-01-25',
		price: '12000',
	},
}).done(function(msg){
	console.log(msg);
}).error(function(msg){console.log(msg)});

// shelf
$.ajax({
	url: 'http://localhost:3000/api/transaction/shelf/new',
	method: 'POST',
	data: {
		product_id : '1',
		execution_date: '2018-01-25',
	},
}).done(function(msg){
	console.log(msg);
}).error(function(msg){console.log(msg)});

// shelf to pawn
$.ajax({
	url: 'http://localhost:3000/api/transaction/shelf_to_pawn/new',
	method: 'POST',
	data: {
		product_id : '4',
		execution_date: '2018-01-25',
	},
}).done(function(msg){
	console.log(msg);
}).error(function(msg){console.log(msg)});


