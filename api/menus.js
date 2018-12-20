const express = require('express');
const menuRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuRouter.param('menuId', (req, res, next, menuId) => {
    const sql = 'SELECT * FROM Menu WHERE id = $menuId';
    const values = {
        $menuId: menuId
    };
    db.get(sql, values, (err, row) => {
        if (err) {
            next(err);
          }
        else if (row) {
            req.menu = row;
            next();
          } 
        else {
            res.status(404).send();
          }
    });
});

menuRouter.param('menuItemId', (req, res, next, menuItemId) => {
    const sql = 'SELECT * FROM MenuItem WHERE id = $menuItemId';
    const values = {
        $menuItemId: menuItemId
    };
    db.get(sql, values, (err, row) => {
        if (err) {
            next(err);
          }
        else if (row) {
            req.menuItem = row;
            next();
          } 
        else {
            res.status(404).send();
          }
    });
});

menuRouter.get('/', (req, res, next) => {
    sql = 'SELECT * FROM Menu';
    db.all(sql, (err, rows) => {
        if (err) {
            next(err);
        }
        else {
            res.status(200).send({ menus: rows });
        }
    });
});

menuRouter.post('/', (req, res, next) => {
    const title = req.body.menu.title;
    if (!title) {
        res.status(400).send();
    }
    else {
        const sql = 'INSERT INTO Menu (title) VALUES ($title)';
        const values = {
            $title: title
        };
        db.run(sql, values, function(err, row) {
            if (err) {
                next(err);
            }
            else {
                const fetchNew = `SELECT * FROM Menu WHERE id = ${this.lastID}`;
                db.get(fetchNew, (err, row) => {
                    if (err) {
                        next(err);
                    }
                    else {
                        res.status(201).send({ menu: row });
                    }
                });
            }
        });
    }
});

menuRouter.get('/:menuId', (req, res, next) => {
    res.status(200).send({ menu: req.menu });
});

menuRouter.put('/:menuId', (req, res, next) => {
    const title = req.body.menu.title;
    if (!title) {
        res.status(400).send();
    }
    else {
        const sql = 'UPDATE Menu SET title = $title';
        const values = {
            $title: title
        };
        db.run(sql, values, (err, row) => {
            if (err) {
                next(err);
            }
            else {
                const fetchSql = 'SELECT * FROM Menu WHERE id = $id';
                const fetchValues = {
                    $id: req.menu.id
                };
                db.get(fetchSql, fetchValues, (err, row) => {
                    if (err) {
                        next(err);
                    }
                    else {
                        res.status(200).send({ menu: row });
                    }
                });
            }
        });
    }
});

/*
    Add delete!
*/

menuRouter.get('/:menuId/menu-items', (req, res, next) => {
    const sql = 'SELECT * FROM MenuItem WHERE menu_id = $id';
    const values = {
        $id: req.menu.id
    };
    db.all(sql, values, (err, rows) => {
        if (err) {
            next(err);
        }
        else {
            res.status(200).send({ menuItems: rows });
        }
    });
});

menuRouter.post('/:menuId/menu-items', (req, res, next) => {
    const name = req.body.menuItem.name,
    description = req.body.menuItem.description,
    inventory = req.body.menuItem.inventory,
    price = req.body.menuItem.price;

    if (!name || !description || !inventory || !price) {
        res.status(400).send();
    }
    else {
        const sql = 'INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menu_id)';
        const values = {
            $name: name,
            $description: description,
            $inventory: inventory,
            $price: price,
            $menu_id: req.menu.id
        };
        db.run(sql, values, function (err, row) {
            if (err) {
                next(err);
            }
            else {
                const fetchNew = `SELECT * FROM MenuItem WHERE id = ${this.lastID}`;
                db.get(fetchNew, (err, row) => {
                    if (err) {
                        next(err);
                    }
                    else {
                        res.status(201).send({ menuItem: row });
                    }
                });
            }
        });
    }
});
/*
menuRouter.put('/:menuId/menu-items/:menuItemId', (req, res, next) => {
    const name = req.body.menuItem.name,
    description = req.body.menuItem.description,
    inventory = req.body.menuItem.inventory,
    price = req.body.menuItem.price;

    if (!name || !description || !inventory || !price) {
        res.status(400).send();
    }
    else {
        const sql = 'UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menu_id WHERE id = $id';
        const values = {
            $name: name,
            $description: description,
            $inventory: inventory,
            $price: price,
            $menuId: req.menu.id,
            $id: req.menuItem.id
        };
        db.run(sql, values, (err, row) => {
            if (err) {
                next(err);
            }
            else {
                const fetchNew = 'SELECT * FROM MenuItem WHERE id = $id';
                const fetchValues = {
                    $id: req.menuItem.id
                };
                db.get(fetchNew, fetchValues, (err, row) => {
                    if (err) {
                        next(err);
                    }
                    else {
                        res.status(200).send({ menuItem: row });
                    }
                });
            }
        });
    } 
});
*/

menuRouter.delete('/:menuId/menu-items/:menuItemId', (req, res, next) => {
    const sql = 'DELETE FROM MenuItem WHERE id = $id';
    const values = {
        $id: req.menuItem.id
    };
    db.run(sql, values, (err, row) => {
        if (err) {
            next(err);
        }
        else {
            res.status(204).send();
        }
    });
});

module.exports = menuRouter;