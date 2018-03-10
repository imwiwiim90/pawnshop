$(document).ready(function(){

	$('table').stickyTableHeaders();
	$('table').stickyTableHeaders({scrollableArea: $('#main-container')});


	var base_path = window.location.protocol + '//' + window.location.hostname + (window.location.port? ':' + window.location.port : '');

	var api_path = {
		sold : '/api/product/sold',
		pawn : '/api/product/pawn',
		shelf : '/api/product/shelf',
		expired : '/api/product/expired',
		client : '/api/client/all'
	}
	var key_to_name = {
		'sold' : [
			['inventory_id','ID'],
			['name','Producto'],
			['price','Precio'],
			['execution_date','Fecha'],
		],
		'pawn' : [
			['inventory_id','ID'],
			['name','Producto'],
			['price','Precio'],
			['execution_date','Fecha'],
		],
		'shelf' : [
			['inventory_id','ID'],
			['name','Producto'],
			['execution_date','Fecha'],
		],
		'expired' : [
			['inventory_id','ID'],
			['name','Producto'],
			['payments','Pagos'],
			['debt','Deuda (meses)'],
			['begin_date','Fecha de empeño'],
		],
		'client' : [
			['cc','Cédula'],
			['name','Nombre'],
			['phone','Teléfono'],
		]
	}

	var key_search = {
		'client' : [
			['cc','cc'],
			['name','nombre'],
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
	function getTableData(type) {
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

			fillTable(data,key_to_name[type],_class);

		});
	}
	/*
		headers
			[ [key_name,table_title] ]
	*/
	var curr_headers;
	var curr_class;
	function fillTable(data,headers,_class) {
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
				if (k == 'name' && _class == 'client') {
					dat = capFirstLetterWord(dat);
				}
				var td = $('<td>' + dat + '</td>');
				if (key_color[k]) td.addClass('font-' + key_color[k]);
				tr.append(td);
			});
			tbody.append(tr);
		})

	}

	$('#main-table thead').on('click','th',function(){
		var reverse = 1;

		if ($(this).hasClass('order-th')) {
			reverse = -1;
			$('.order-th').removeClass('order-th');
		} else $(this).addClass('order-th');


		var key = $(this).attr('_class_key');
		table_data.sort(function(a,b) {
			if (a[key] < b[key]) return -1*reverse;
			if (a[key] > b[key]) return 1*reverse;
			return 0;
		})

		

		fillTable(table_data);
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
			var query = $(this).val();
			var filtered = table_data.filter((item) => item[key].indexOf(query) != -1 );
			console.log(query);
			if (!filtered) filtered = [];
			fillTable(filtered);
		});
	}

	getTableData('pawn');

	$('.tbopt').on('click',function() {
		var li = $(this);
		var tbopt = li.attr('tbopt');
		getTableData(tbopt);
		if (tbopt == 'pawn' || tbopt == 'expired') $('#sub-menu').show();
		else $('#sub-menu').hide();
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
	

});