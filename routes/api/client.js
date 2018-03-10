var express = require('express');
var router = express.Router();
var Client = require('../../models/client');

/* GET users listing. */
router.get('/id/:id', function(req, res, next) {
  var client = new Client();
  client.set({id: req.params.id}).get(function(c) {
  	res.json(c);
  });
});

router.get('/cc/:cc', function(req, res, next) {
	var client = new Client();
	client.set({
		cc: req.params.cc,
	}).get(function(clients) {
		if (!clients || clients.length == 0) res.send(null)
		else res.json(clients[0]);
	})
});

router.get('/pawn/id/:id', function(req,res,next) {
	var client = new Client();
	client.set({
		id : req.params.id,
	}).getPawn(function(products) {
		res.json(products);
	});
});	

router.get('/all',function(req,res,next){
	var client = new Client();
	client.all(function(clients) {
		res.json(clients);
	});
})

router.post('/new',function(req,res,next) {
	var client = new Client();
	client.set({
		'name' : req.body.name,
		'cc' : req.body.cc,
		'phone' : req.body.phone,
	}).save(function(client_id) {
		console.log(client_id);
		res.send(String(client_id));
	})
});

router.put('/update',function(req,res,next) {
	var client = new Client();
	client.set({
		'name' : req.body.name,
		'cc' : req.body.cc,
		'id' : req.body.id,
	}).update(function(client_id) {
		console.log(client_id);
		res.send(String(client_id));
	})
});

module.exports = router;
