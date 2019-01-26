var express = require('express');
var router = express.Router();
var Client = require('../../models/client');

/* GET home page. */
router.get('/id/:id', function(req, res, next) {
  res.render('client',{
  	auth: req.isAuthenticated(),
  });
});

router.get('/edit/:id', function(req,res,next) {

	var client_attrs = [
				{
					key: 'name',
					name: 'nombre',
					type: 'string',
				},
				{
					key: 'cc',
					name: 'cédula',
					type: 'number',
				},
				{
					key: 'phone',
					name: 'teléfono',
					type: 'number'
				},
	];

	var client = new Client();
	client.set({id:req.params.id}).get(function(client) {
		res.render('edit',{ 
			_class: {
				name: 'cliente',
				attrs: client_attrs
			},
			url: '/api/client/update',
			obj: client,
  			auth: req.isAuthenticated(),
		});
	});
	
});

module.exports = router;