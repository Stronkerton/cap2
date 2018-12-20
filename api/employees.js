const express = require('express');
const employeeRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

employeeRouter.param('employeeId', (req, res, next, employeeId) => {
    const sql = 'SELECT * FROM Employee WHERE id = $employeeId';
    const values = {
        $employeeId: employeeId
    };
    db.get(sql, values, (err, row) => {
        if (err) {
            next(err);
          }
        else if (row) {
            req.employee = row
            next();
          } 
        else {
            res.status(404).send();
          }
    });
});

employeeRouter.get('/', (req, res, next) => {
    const sql = 'SELECT * FROM Employee WHERE is_current_employee = 1';
    db.all(sql, (err, rows) => {
        if (err) {
            next(err);
        } else {
            res.status(200).send({ employees: rows });
        }
    });
});

employeeRouter.post('/', (req, res, next) => {
    const name = req.body.employee.name,
    position = req.body.employee.position,
    wage = req.body.employee.wage,
    is_current_employee = req.body.employee.is_current_employee | 1;

    if (!name || !position || !wage) {
        res.status(400).send();
    }
    else {
        const sql = 'INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $is_current_employee)';
        const values = {
            $name: name,
            $position: position,
            $wage: wage,
            $is_current_employee: is_current_employee
        };
        db.run(sql, values, function(err, row) {
            if (err) {
                console.log(err);
            }
            else {
                fetchNew = `SELECT * FROM Employee WHERE id = ${this.lastID}`;
                db.get(fetchNew, (err, row) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        res.status(201).send({ employee: row });
                    }
                })
            }
        });
    }
});

employeeRouter.get('/:employeeId', (req, res, next) => {
    res.status(200).send({ employee: req.employee });
});



module.exports = employeeRouter;