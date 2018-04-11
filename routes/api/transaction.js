var express = require('express');
var router = express.Router();

var ExtensionPayment = require('../../models/transaction').ExtensionPayment;
var Pawn = require('../../models/transaction').Pawn;
var Sell = require('../../models/transaction').Sell;
var Close = require('../../models/transaction').Close;
var Shelf = require('../../models/transaction').Shelf;
var ShelfToPawn = require('../../models/transaction').ShelfToPawn;

/* GET users listing. */
router.get('/pawn/id/:id', function(req, res, next) {
  var pawn = new Pawn();
  pawn.set({id: req.params.id}).get(function(p) {
  	res.json(p);
  });
});

router.get('/pawn/product_id/:id', function(req, res, next) {
	var pawn = new Pawn();
	pawn.set({product_id: req.params.id}).get(function(pawns){
		if (pawns.length >= 1) res.json(pawns[0]);
		else res.json(null);
	})
});

router.post('/extension_payment/new', function(req, res, next){
	var extensionPayment = new ExtensionPayment();
	extensionPayment.set(req.body).save(function(id) {
		res.send(String(id));
	})
});

router.post('/pawn/new',function(req, res, next){
	var pawn = new Pawn();
	pawn.set(req.body).save(function(id){
		res.send(String(id));
	});
});

router.post('/sell/new', function(req, res, next){
	var sell = new Sell();
	sell.set(req.body).save(function(id){
		res.send(String(id));
	});
});

router.post('/close/new', function(req, res, nex) {
	var close = new Close();
	close.set(req.body).save(function(id) {
		res.send(String(id));
	})
});

router.post('/shelf/new',function(req, res, next){
	var shelf = new Shelf();
	shelf.set(req.body).save(function(id){
		res.send(String(id));
	});
});

router.post('/shelf_to_pawn/new',function(req, res, next){
	var shelfToPawn = new ShelfToPawn();
	shelfToPawn.set(req.body).save(function(id){
		res.send(String(id));
	});
});

router.delete('/id/:id');






module.exports = router;