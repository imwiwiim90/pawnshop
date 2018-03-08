var express = require('express');
var router = express.Router();
var Product = require('../../models/product');

/* GET users listing. */
router.get('/id/:id', function(req, res, next) {
  var product = new Product();
  product.set({id:req.params.id}).get(function(p) {
  	res.json(p);
  });
});

router.get('/inventory_id/:id', function(req,res,next) {
	var product = new Product();
	product.set({
		'inventory_id' : req.params.id,
	}).get(function(products) {
		if (!products || products.length == 0){
		 res.json(null);
		 return;
		}
		res.json(products[0]);
	});
});

router.get('/shelf', function(req, res, next) {
	var product = new Product();
	product.getInShelf(null,function(products) {
		res.json(products);
	})
});

router.get('/sold',function(req,res,next) {
	var product = new Product();
	product.getSold(null,function(products) {
		res.json(products);
	});
});

router.get('/pawn',function(req,res,next) {
	var product = new Product();
	product.getPawn(null,function(products) {
		console.log(products);
		res.json(products);
	});
});

router.get('/expired',function(req,res,next) {
	var product = new Product();
	product.getExpired(null,function(products) {
		res.json(products);
	});
});

router.get('/history/:id',function(req, res, next) {
	var product = new Product();
	product.getHistory(req.params.id,function(transactions){
		res.json(transactions);
	})
});


module.exports = router;
