var express = require('express');
var router = express.Router();
var Product = require('../../models/product')

/* GET home page. */
router.get('/id/:id', function(req, res, next) {
  res.render('product',{
  	auth: req.isAuthenticated(),
  });
});

router.get('/edit/:id', function(req,res,next) {
	var product_attrs = [
		{
			key: 'name',
			name: 'nombre',
			type: 'string',
		},
		{
			key: 'description',
			name: 'decripcion',
			type: 'string',
		},
	]

	var product = new Product();
	product.set({id:req.params.id}).get(function(product) {
		res.render('edit', {
			_class: {
				name: 'producto',
				attrs: product_attrs
			},
			url: '/api/product/update',
			obj: product,
  			auth: req.isAuthenticated(),
		})
	})
});

module.exports = router;