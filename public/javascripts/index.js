$(document).ready(function(){

	$('table').stickyTableHeaders();
	$('table').stickyTableHeaders({scrollableArea: $('#main-container')});


	var base_path = window.location.protocol + '//' + window.location.hostname + (window.location.port? ':' + window.location.port : '');

	var api_path = {
		sold : '/api/product/sold',
		pawn : '/api/product/pawn',
		shelf : '/api/product/shelf',
		expired : '/api/product/expired',
		client : '/api/client/all',
		closed : '/api/product/closed',
	}
	var key_to_name = {
		'sold' : [
			['inventory_id','ID'],
			['name','Producto'],
			['price','Precio'],
			['execution_date','Fecha'],
			['client','Cliente'],
		],
		'closed' : [
			['inventory_id','ID'],
			['name','Producto'],
			['payment','Pago'],
			['execution_date','Fecha'],
			['client','Cliente'],
		],
		'pawn' : [
			['inventory_id','ID'],
			['name','Producto'],
			['price','Precio'],
			['execution_date','Fecha'],
			['client','Cliente'],
		],
		'shelf' : [
			['inventory_id','ID'],
			['name','Producto'],
			['execution_date','Fecha'],
			['client','Cliente'],
		],
		'expired' : [
			['inventory_id','ID'],
			['name','Producto'],
			['payments','Pagos'],
			['debt','Deuda (meses)'],
			['begin_date','Fecha de empeño'],
			['client','Cliente'],
		],
		'client' : [
			['cc','Cédula'],
			['name','Nombre'],
			['phone','Teléfono'],
		]
	}

	var key_search = {
		'client' : [
			['cc','Cédula'],
			['name','Nombre'],
		],
		'pawn' : [
			['inventory_id','ID'],
			['name','Nombre'],
		],
		'closed': [
			['inventory_id','ID'],
			['name','Nombre'],
		],
		'shelf': [
			['inventory_id','ID'],
			['name','Nombre'],
		],
		'sold': [
			['inventory_id','ID'],
			['name','Nombre'],
			['client','Cliente'],
		],
		'expired' : [
			['inventory_id','ID'],
			['name','Nombre'],
		],
	}

	$('#search-wrapper').hide();

	function capFirstLetterWord(str) {
		return str.replace(/\b\w/g,(l) => (l.toUpperCase()));
	}

	var key_color = {
		'price' : 'green',
		'debt' : 'red',
	}

	var table_data = [];
	function getTableData(type,callback) {
		var _class = 'product';
		if (type == 'client') _class = 'client';
		setSearchBox(key_search[type]);
		$.ajax({
			method : "GET",
			url : base_path + api_path[type],
		}).done(function(data){
			table_data = data;
			if (_class == 'product') {
				table_data.sort(function(a,b) {
					if (a.inventory_id < b.inventory_id) return -1;
					if (a.inventory_id > b.inventory_id) return 1;
					return 0;
				})	
			}

			fillTable(data,key_to_name[type],_class,callback);

		});
	}
	/*
		headers
			[ [key_name,table_title] ]
	*/
	var curr_headers;
	var curr_class;
	function fillTable(data,headers,_class,callback) {
		// header
		if (headers) {
			curr_headers = headers;
			var thead = $('#main-table thead tr');
			thead.html('');
			headers.forEach(function(header) {
				var $th = $('<th>' + header[1] + '</th>');
				$th.attr('_class_key',header[0]);
				thead.append($th);
			});
		} else {
			headers = curr_headers;
		}
		if (!_class) _class = curr_class;
		else curr_class = _class;

		// body
		var tbody = $('#main-table tbody');
		tbody.html('');
		data.forEach(function(i){
			var tr = $('<tr>');
			if (_class) {
				tr.attr('row-type',_class);
				tr.attr('item-id',i.id);
			}
			headers.forEach(function(tuple) {
				var k = tuple[0];
				var dat = i[k];
				if (dat === null) dat = '';
				if (k == 'name' && _class == 'client') {
					dat = capFirstLetterWord(dat);
				}
				var td = $('<td>' + dat + '</td>');
				if (key_color[k]) td.addClass('font-' + key_color[k]);
				tr.append(td);
			});
			tbody.append(tr);
		})

		if (typeof callback === 'function') callback();
 	}

	// Show and hide respective items
	// Calls for data retrieval
	// Save data in session storage
	function setTable(type,callback) { 

		getTableData(type,callback);

		if (type == 'pawn' || type == 'expired') $('#sub-menu').show();
		else $('#sub-menu').hide();

		var mainTableOpts = JSON.parse(sessionStorage.mainTableOpts);
		mainTableOpts.tbopt = type;
		sessionStorage.mainTableOpts = JSON.stringify(mainTableOpts);
	}

	function orderTable(key,reverse) {
		var $th = $('thead th[_class_key='+ key +']');
		if (reverse == undefined) reverse = 1;

		$('.order-th').removeClass('order-th');
		if (reverse == 1) $th.addClass('order-th');

		table_data.sort(function(a,b) {
			if (a[key] < b[key]) return -1*reverse;
			if (a[key] > b[key]) return 1*reverse;
			return 0;
		})

		fillTable(table_data);
		var mainTableOpts = JSON.parse(sessionStorage.mainTableOpts);
		mainTableOpts.order = key;
		mainTableOpts.reverse = reverse;
		sessionStorage.mainTableOpts = JSON.stringify(mainTableOpts);
	}

	$('#main-table thead').on('click','th',function(){

		var reverse = 1;
		if ($(this).hasClass('order-th')) reverse = -1; 

		var key = $(this).attr('_class_key');

		orderTable(key,reverse);
	});
	/*
		keys
			[ [key,name] ]
	*/
	function setSearchBox(keys) {
		var $searchWrapper = $('#search-wrapper');
		if (!keys || keys.length == 0) {
			$searchWrapper.hide();
			return;
		}
		else $searchWrapper.show();

		var $select = $('#search-wrapper select');
		$select.html('');
		keys.forEach(function(tuple) {
			var $option = $('<option>');
			$option.attr('target-key',tuple[0]);
			$option.html(tuple[1]);
			$select.append($option);
		});

		$('#search-wrapper input').on('input', function(){
			var $selected = $('#search-wrapper select option:selected');
			var key = $selected.attr('target-key');
			var query = $(this).val().toLowerCase();
			var filtered = table_data.filter((item) => item[key].toLowerCase().indexOf(query) != -1 );

			if (!filtered) filtered = [];
			fillTable(filtered);
		});
	}

	$('.tbopt').on('click',function() {
		var li = $(this);
		var tbopt = li.attr('tbopt');
		setTable(tbopt);
	});

	$('#btn-new-transaction').on('click',function(){
		window.location.href = base_path + '/new_transaction';
	});


	$('#main-table').on('click','tr',function() {
		var _class = $(this).attr('row-type');
		if (!_class) return;

		if (_class == 'product') {
			window.location.href = base_path + '/product/id/' + $(this).attr('item-id');
		}

		if (_class == 'client') {
			window.location.href = base_path + '/client/id/' + $(this).attr('item-id');
		}
	})


	// SESSION STORAGE
	if (!sessionStorage.mainTableOpts) {
		sessionStorage.mainTableOpts = JSON.stringify({
			tbopt : '',
			order : '',
			reverse: 1,
		});
	} 
	var mainTableOpts = JSON.parse(sessionStorage.mainTableOpts)
	var tbopt = mainTableOpts['tbopt'];
	if (tbopt) {
		$(".tbopt.selected").removeClass('selected');
		$(".tbopt[tbopt="+ tbopt +"]").addClass('selected');
		if (tbopt == 'expired') {
			$('.tbopt[tbopt=pawn]').addClass('selected');
			$('#sub-menu .tbopt[tbopt=pawn]').removeClass('selected');
		}
		setTable(tbopt,function() {
			if (mainTableOpts.order) orderTable(mainTableOpts.order,mainTableOpts.reverse);
		});
	}
	else setTable('pawn'); 	


});