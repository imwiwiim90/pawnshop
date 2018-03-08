$(document).ready(function(){
	var base_path = window.location.protocol + '//' + window.location.hostname + (window.location.port? ':' + window.location.port : '');
	var api_path  = {
		'product_inventory_id' : '/api/product/inventory_id/',
		'new_transaction' : '/api/transaction/{type}/new',
		'client_cc' : '/api/client/cc/',
		'new_client' : '/api/client/new',
	};
	var current_product = null;

	// THE ALL MIGHTY TRANSACTION
	var transaction = {};
	var product = {};
	var client  = {};


	/* error view */
	var error_msg = {
		'id-not-found' : 'El id ingresado no esta asociado a ningún producto, intente con otro número',
		'pawn-invalid-id' : 'El id ingresado ya pertenece a algun producto',
		'not-pawn' : 'El producto no se encuentra en empeño',
		'not-shelf' : 'El producto no se encuentra en vitrina',
		'unknown' : 'Se ha producido un error desconocido en el sistema',
	}
	var nextMsgError = '';
	function setMsgError(msg_name) {
		nextMsgError = error_msg[msg_name]
	}
	/* end error view */

	var transaction_names = {
		'shelf' : 'Saca',
		'sell' : 'Venta',
		'extension_payment' : 'Prórroga',
		'shelf_to_pawn' : 'Venta a empeño',
		'pawn' : 'Empeño',
	}
	var dynamicContainerViews = {
		'error' : {
			retrieved:false,
			title : 'Error',
			callback : function() {
				console.log(nextMsgError)
				$('#msg-error').html(nextMsgError);
			},
			accept : defaultCancelCallback,
		},
		'product_info' : {
			retrieved: false,
			title : null,
			callback : function() {
				$('#id-product-title span').html(current_product.inventory_id);
				$('#product-name').html(current_product.name);
				$('#product-description').html(current_product.description);
			},
			accept : function() {
				transaction.product_id = current_product.id;
				if (current_transaction == 'shelf' || current_transaction == 'shelf_to_pawn')
					setDynamicContainer('get_execution_date');
				if (current_transaction == 'sell')
					setDynamicContainer('sell');
				if (current_transaction == 'extension_payment')
					setDynamicContainer('extension_payment');

			},
		},
		'get_execution_date' :{
			retrieved: false,
			title : null,
			accept : function() {
				transaction.execution_date = $('#inpt-execution-date').val();
				uploadTransaction(current_transaction,(id) => {
					if (isNaN(parseInt(id))) {
						setMsgError('unknown');
						setDynamicContainer('error');
						return
					}
					setDynamicContainer('success');
				});
			}
		},
		'first' : {
			retrieved: true,
			title : $('#title').html(),
			html : $('#dynamic-container').html(),
			callback : function () {
				$('#product-id').on('input',inputNumeric);
			},
			accept : function () {
				setSelectedTransaction();
				getProductByInventoryId($('#product-id').val(),function(_product){
					product = _product;
					if (current_transaction == 'pawn') {
						if (product) {
							setMsgError('pawn-invalid-id');
							setDynamicContainer('error');
						} else {
							product = {
								inventory_id : $('#product-id').val(),
							};
							setDynamicContainer('search_client');
						}
					}
					else if (!product) {
						setMsgError('id-not-found');
						setDynamicContainer('error');
					} 	
					else if (current_transaction == 'shelf' && product.state != 0) {
						setMsgError('not-pawn');
						setDynamicContainer('error');
					}
					else if (current_transaction == 'sell' && product.state != 1) {
						setMsgError('not-shelf');
						setDynamicContainer('error');
					}
					else if (current_transaction == 'extension_payment' && product.state != 0) {
						setMsgError('not-pawn');
						setDynamicContainer('error');
					}
					else if (current_transaction == 'shelf_to_pawn' && product.state != 1) {
						setMsgError('not-shelf');
						setDynamicContainer('error');
					}
					/* SUCCESS */
					else {
						current_product = product;
						setDynamicContainer('product_info',dynamicContainerViews.product_info.callback);
					}

				});
			},
			cancel : redirectMainPage,
		},
		'success' : {
			retrieved: false,
			title : 'Transacción exitosa',
			accept : redirectMainPage,
		},
		'sell' : {
			retrieved: false,
			title : null,
			callback : function() {
				$("#inpt-sell-price").on('input',inputPriceOnChange);
			},
			accept : function() {
				transaction.execution_date = $('#inpt-execution-date').val();
				transaction.price = getPriceVal('#inpt-sell-price');
				uploadTransaction('sell',(id) => {
					if (isNaN(parseInt(id))) {
						setMsgError('unknown');
						setDynamicContainer('error');
						return
					}
					setDynamicContainer('success');
				});
			}
		},
		'extension_payment' : {
			retrieved : false,
			title: null,
			callback : function() {
				$("#inpt-extension-payment-price").on('input',inputPriceOnChange);
			},
			accept : function() {
				transaction.execution_date = $('#inpt-execution-date').val();
				transaction.payment = getPriceVal('#inpt-extension-payment-price');
				transaction.number_of_payments = $('#inpt-number-of-payments').val();
				uploadTransaction('extension_payment',(id) => {
					if (isNaN(parseInt(id))) {
						setMsgError('unknown');
						setDynamicContainer('error');
						return
					}
					setDynamicContainer('success');
				});
			}
		},
		'search_client' : {
			retrieved : false,
			title: 'Buscar cliente',
			callback : function() {
				$('#btns-container').hide();
				$('#inpt-cc').on('input',function(e){
					$('#msg-cc-not-found').hide();
					inputNumeric(e);
				})
				$('#btn-search-cc').on('click',function() {
					getClientByCC($('#inpt-cc').val(),function(data) {
						if (!data) {
							$("#msg-cc-not-found").show();
						} else {
							client = data;
							setDynamicContainer('pawn');
						}
					});
				});

				$('#btn-new-client').on('click',function(){
					setDynamicContainer('new_client');
					client.cc = $('#inpt-cc').val();
				});
			},
		},
		'new_client' : {
			retrieved : false,
			title: 'Nuevo Cliente',
			callback : function() {
				if (client.cc) $('#inpt-client-cc').val(client.cc);
			},
			accept : function() {
				var _client = {
					cc: $('#inpt-client-cc').val(),
					name : $('#inpt-client-name').val(),
					phone: $('#inpt-client-phone').val(),
				};
				_client.name = _client.name.toLowerCase();
				getClientByCC(_client.cc,function(c) {
					if (!c) {
						$.ajax({
							url: base_path + api_path.new_client,
							method : 'POST',
							dataType: 'json',
							contentType : 'application/json; charset=utf-8',
							data: JSON.stringify(_client),
						}).done(function(id){
							if (isNaN(parseInt(id))) {
								setMsgError('unknown');
								setDynamicContainer('error');
								return;
							}
							_client.id = id;
							client = _client;
							setDynamicContainer('pawn');
						});
					} else {
						$('#msg-cc-found').show();
					}
				})
				
			}
		},
		'pawn' : {
			retrieved: false,
			title: null,
			callback : function() {
				$("#inpt-product-price").on('input',inputPriceOnChange);
				$('#client-name').html(client.name);
				$('#client-cc').html(client.cc);
			},
			accept : function () {
				transaction.execution_date = $('#inpt-execution-date').val();
				transaction.price = getPriceVal('#inpt-product-price');
				transaction.client_id = client.id;
				product.name = $('#inpt-product-name').val();
				product.description = $('#inpt-product-description').val();
				transaction.product = product
				uploadTransaction('pawn',(id) => {
					if (isNaN(parseInt(id))) {
						setMsgError('unknown');
						setDynamicContainer('error');
						return
					}
					setDynamicContainer('success');
				});
			}
		}
		

	};

	var current_transaction = '';
	function setSelectedTransaction() {
		current_transaction =  $('#transaction-select option:selected').attr('transaction-name');
	}

	function defaultCancelCallback() {
		setDynamicContainer('first');
	}

	function redirectMainPage() {
		window.location.href = base_path;
	}

	function setDynamicContainer(view_name) {
		var	callback = dynamicContainerViews[view_name].callback;
		function after() {
			if (dynamicContainerViews[view_name].title) $('#title').html(dynamicContainerViews[view_name].title);
			else $('#title').html(transaction_names[current_transaction]);
			$("#dynamic-container").html(dynamicContainerViews[view_name].html);
			$('#btns-container').show();
			var accept_callback = dynamicContainerViews[view_name].accept;
			var cancel_callback = dynamicContainerViews[view_name].cancel;
			$('#continue-btn').off('click');  
			if (accept_callback) $('#continue-btn').on('click',accept_callback);

			$('#cancel-btn').off('click');
			if (cancel_callback) $('#cancel-btn').on('click',cancel_callback);
			else $('#cancel-btn').on('click',defaultCancelCallback);
			
			if (callback) callback();
		}
		if (!dynamicContainerViews[view_name].retrieved) {
			$.ajax({
				method : "GET",
				url : base_path + '/views/' + view_name + '.html'
			}).done(function(data){
				dynamicContainerViews[view_name].retrieved = true;
				dynamicContainerViews[view_name].html = data;
				after();
			})
			return;	
		} else after();
	}

	function inputPriceOnChange() {
		var val = $(this).val();
		var numeric_val = '';
		val.split('').forEach((c) => {
			if (numeric_val == '' && c == '0') return;
			if (!isNaN(c) && c != ' ') numeric_val += c;
		});

		var _numeric_val = '';
		var i = 0;
		console.log(numeric_val)
		numeric_val.split('').reverse().forEach(function(c){
			_numeric_val += c
			if (i % 3 == 2) _numeric_val += '.';
			i++;
		})
		_numeric_val = _numeric_val.split('');
		if (i%3 == 0 && i != 0) _numeric_val.splice(-1);
		numeric_val = _numeric_val.reverse().join('');

		if (numeric_val)
		numeric_val = "$ " + numeric_val;
		$(this).val(numeric_val);
	}

	function inputNumeric(e) {
		var $input = $(e.target);
		var val = $input.val();
		var numeric_val = '';
		val.split('').forEach(function(c) {
			if (numeric_val == '' && c == '0') return;
			if (!isNaN(c) && c != ' ') numeric_val += c;
		});
		$input.val(numeric_val);
	}
	function getPriceVal(id) {
		var val = $(id).val();
		var numeric_val = '';
		val.split('').forEach((c) => {
			if (numeric_val == '' && c == '0') return;
			if (!isNaN(c) && c != ' ') numeric_val += c;
		});
		return numeric_val;
	}
	

	function uploadTransaction(type,callback) {
		$.ajax({
			url: base_path + api_path.new_transaction.replace('{type}',type),
			method : 'POST',
			dataType: 'json',
			contentType : 'application/json; charset=utf-8',
			data: JSON.stringify(transaction),
		}).done(callback);
	}


	function getProductByInventoryId(id,callback) {
		$.ajax({
			method: 'GET',
			url : base_path + api_path.product_inventory_id + id
		}).done(callback);
	}

	function getClientByCC(cc,callback) {
		$.ajax({
			method : "GET",
			url : base_path + api_path.client_cc + cc,
		}).done(callback);
	}


	setDynamicContainer('first');

	

});