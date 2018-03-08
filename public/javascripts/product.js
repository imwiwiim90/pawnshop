$(document).ready(function() {
	var app_url = window.location.protocol + '//' + window.location.hostname + (window.location.port? ':' + window.location.port : '');

	// get product id
	var local_path = window.location.pathname;
	var local_path_id_i = local_path.lastIndexOf('/');
	var product_id = local_path.substr(local_path_id_i+1,local_path.length);


	function transactionHTML(transaction) {
		var type_name = {
			'extension_payment': 'prórroga',
			'pawn': 'empeño',
			'sell': 'venta',
			'shelf': 'saca',
			'shelf_to_pawn': 'devuelta a empeño',
		};

		var transaction_body_tag = '';
		if (transaction.type == 'pawn' || transaction.type == 'sell')
			transaction_body_tag = "<span>" + transaction.price + "</span>";
		if (transaction.type == 'extension_payment') 
			transaction_body_tag = 
				  "<span>" + transaction.number_of_payments + "</span>"
				+ "<span>" + transaction.payment + "</span>";

		return "<div class='history-item'>"
			+ "<p class='history-item-title'>"
				+ "<span class='transaction-type'>" + type_name[transaction.type] + "</span>"
				+ "<span class='transaction-date'>" + transaction.execution_date +"</span>"
			+"</p>"
			+ "<p class='history-item-body'>" + transaction_body_tag + "</p>"
		+ "</div>";
	}

	// get product data
	$.ajax({
		method: 'GET',
		url : app_url + '/api/product/id/' + product_id,
	}).done((product) => {
		console.log(product);
		$('#product-name').html(product.name);
		$('#product-inventory-id').html(product.inventory_id);
		$('#product-description').html(product.description);

		var $state;
		if (product.state == 0) $state = $('#state-pawn');
		if (product.state == 1) $state = $('#state-shelf');
		if (product.state == 2) $state = $('#state-sold');
		$state.addClass('highlight');

	});

	// get history
	$.ajax({
		method: 'GET',
		url: app_url + '/api/product/history/' + product_id,
	}).done((transactions) => {
		var $container = $('#product-history');
		$container.html('');
		transactions.forEach((transaction) => {
			console.log('transaction');
			$container.append(transactionHTML(transaction));
		});
	});


});