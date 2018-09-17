$(document).ready(function() {
	var app_url = window.location.protocol + '//' + window.location.hostname + (window.location.port? ':' + window.location.port : '');

	// get client id
	var local_path = window.location.pathname;
	var local_path_id_i = local_path.lastIndexOf('/');
	var client_id = local_path.substr(local_path_id_i+1,local_path.length);

	// client data
	$.ajax({
		url : app_url + '/api/client/id/' + client_id,
		method : 'GET',

	}).done(function(client){
		$('#client-name').html(client.name);
		$('#client-cc').html(client.cc);
		$('#client-phone').html(client.phone);

		if (!client.phone) 
			$('#client-phone-wrapper').hide();
	})

	function fillTable(data) {
		$cont = $('#products');
		$cont.html('');

		var product_keys = ['inventory_id','name','state']
		var product_state = {
			'pawn': 'Empeño',
			'extension_payment': 'Empeño',
			'close': 'Cerrado',
			'shelf': 'En venta',
			'shelf_to_pawn': 'Empeño',
			'sell': 'Vendido',
		}
		data.forEach((product) => {
			console.log(product)
			var pcont = $('<div class="product-item">');
			pcont.attr('product_id',product.id);
			product_keys.forEach((k) => {
				if (k == 'state') {
					var state = product[k];
					var class_ = 'font-green';
					if (state == 'sell' || state == 'close') class_ = 'font-red';
					var ktag = $(`<p class=${class_}>`);
					ktag.html(product_state[product[k]])
					pcont.append(ktag);
				}
				else if (k != 'id') {
					var ktag = $('<p>');
					ktag.html(product[k]);
					pcont.append(ktag);
				}
			});
			$cont.append(pcont)
		});
	}

	products_pawn = [];
	$.ajax({
		url : app_url + '/api/client/products/id/' + client_id,
		method: 'GET',
	}).done(function(data) {
		fillTable(data);
	});

	$('#products').on('click','.product-item',function(){
		var pID = $(this).attr('product_id');
		window.location.href = app_url + '/product/id/' + pID;
	})

	$('#btn-edit').on('click',function(){
		window.location.href = '/client/edit/' + client_id;
	});
})