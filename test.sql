 SELECT product_id as id, types.state, name, inventory_id FROM (
	SELECT pawn.product_id, max(transaction.id) as transaction_id FROM (
		SELECT product.id as product_id, inventory_id, product.name as name, price, execution_date, transaction.id as transaction_id
		FROM product
		JOIN (transaction,transaction_pawn,client)
		ON (product.id = transaction.product_id AND transaction.client_id = client.id and transaction.id = transaction_pawn.transaction_id)
		where client.id = 2
	) as pawn 
	JOIN transaction
	ON (transaction.product_id = pawn.product_id)
	GROUP BY product_id
) as transactions
LEFT JOIN
(
	(
		SELECT 'pawn' as state, transaction_id FROM transaction_pawn
	)
		UNION
	(
		SELECT "extension_payment" as state, transaction_id FROM transaction_extension_payment
	)
		UNION
	(
		SELECT "close" as state, transaction_id FROM transaction_close
	)
		UNION
	(
		SELECT "shelf" as state, transaction_id FROM transaction_shelf
	)
		UNION
	(
		SELECT "shelf_to_pawn" as state, transaction_id FROM transaction_shelf_to_pawn
	)
		UNION
	(
		SELECT "sell" as state, transaction_id FROM transaction_sell
	)
) as types 
ON (types.transaction_id = transactions.transaction_id)
JOIN product on (product.id = product_id);

/*SELECT transactions.id as id, inventory_id, name, execution_date, type, transactions.transaction_id
FROM (SELECT product.id as id, inventory_id, product.name as name, execution_date, transaction.id as transaction_id
FROM product
JOIN (transaction,client)
ON (product.id = transaction.product_id AND transaction.client_id = client.id)
where client.id = 6) as transactions
LEFT JOIN
(
	(
		SELECT "pawn" as type, transaction_id FROM transaction_pawn
	)
		UNION
	(
		SELECT "extension_payment" as type, transaction_id FROM transaction_extension_payment
	)
		UNION
	(
		SELECT "shelf" as type, transaction_id FROM transaction_shelf
	)
		UNION
	(
		SELECT "shelf_to_pawn" as type, transaction_id FROM transaction_shelf_to_pawn
	)
) as types on (types.transaction_id = transactions.transaction_id);
*/