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

		data.forEach((product) => {
			console.log(product)
			var pcont = $('<div class="product-item">');
			pcont.attr('product_id',product.id);
			for (k in product)
				if (k != 'id') {
					var ktag = $('<p>');
					ktag.html(product[k]);
					pcont.append(ktag);
				}
			$cont.append(pcont)
		});
	}

	products_pawn = [];
	$.ajax({
		url : app_url + '/api/client/pawn/id/' + client_id,
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