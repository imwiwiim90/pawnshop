delete from product where product.id not in (
	select min(id) from (select * from product) p group by inventory_id
);
ALTER TABLE product ADD CONSTRAINT addUniqueConstraintToP UNIQUE (inventory_id);
/*
ALTER TABLE product DROP INDEX addUniqueConstraintToP;
*/