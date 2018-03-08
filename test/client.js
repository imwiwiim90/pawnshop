$.ajax({
	url: 'http://localhost:3000/api/client/new',
	method: 'POST',
	data: {
		name : 'Eduardo',
		cc : '1020972343',
	},
}).done(function(msg){
	console.log(msg);
});

$.ajax({
	url: 'http://localhost:3000/api/client/update',
	method: 'PUT',
	data: {
		id : '8',
		name : 'Eduardo Jorge',
		cc : '1020972343',
	},
}).done(function(msg){
	console.log(msg);
});