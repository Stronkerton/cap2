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

employeeRouter.param('timesheetId', (req, res, next, timesheetId) => {
    const sql = 'SELECT * FROM Timesheet WHERE id = $timesheetId';
    const values = {
        $timesheetId: timesheetId
    };
    db.get(sql, values, (err, row) => {
        if (err) {
            next(err);
          }
        else if (row) {
            req.timesheet = row
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
    wage = req.body.employee.wage;

    if (!name || !position || !wage) {
        res.status(400).send();
    }
    else {
        const sql = 'INSERT INTO Employee (name, position, wage) VALUES ($name, $position, $wage)';
        const values = {
            $name: name,
            $position: position,
            $wage: wage
        };
        db.run(sql, values, function(err, row) {
            if (err) {
                next(err);
            }
            else {
                const fetchNew = `SELECT * FROM Employee WHERE id = ${this.lastID}`;
                db.get(fetchNew, (err, row) => {
                    if (err) {
                        next(err);
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

employeeRouter.put('/:employeeId', (req, res, next) => {
    const name = req.body.employee.name,
    position = req.body.employee.position,
    wage = req.body.employee.wage;

    if (!name || !position || !wage) {
        res.status(400).send();
    }
    else {
        const sql = 'UPDATE Employee SET name = $name, position = $position, wage = $wage';
        const values = {
            $name: name,
            $position: position,
            $wage: wage
        };
        db.run(sql, values, (err, row) => {
            if (err) {
                next(err);
            }
            else {
                fetchSql = 'SELECT * FROM Employee WHERE id = $id';
                fetchValues = {
                    $id: req.employee.id
                };
                db.get(fetchSql, fetchValues, (err, row) => {
                    if (err) {
                        next(err);
                    }
                    else {
                        res.status(200).send({ employee: row });
                    }
                });
            }
        });
    }
});

employeeRouter.delete('/:employeeId', (req, res, next) => {
    const sql = 'UPDATE Employee SET is_current_employee = 0 WHERE id = $id';
    const values = {
        $id: req.employee.id
    };
    db.run(sql, values, (err, row) => {
        if (err) {
            next(err);
        }
        else {
            const fetchSql = 'SELECT * FROM Employee WHERE id = $id';
            const fetchValues = {
                $id: req.employee.id
            };
            db.get(fetchSql, fetchValues, (err, row) => {
                if (err) {
                    next(err);
                }
                else {
                    res.status(200).send({ employee: row });
                }
            });
        }
    });
});

employeeRouter.get('/:employeeId/timesheets', (req, res, next) => {
    const sql = 'SELECT * FROM Timesheet WHERE employee_id = $id';
    const values = {
        $id: req.employee.id
    };
    db.all(sql, values, (err, rows) => {
        if (err) {
            next(err);
        }
        else {
            res.status(200).send({ timesheets: rows});
        }
    });
});

employeeRouter.post('/:employeeId/timesheets', (req, res, next) => {
    const hours = req.body.timesheet.hours,
    rate = req.body.timesheet.rate,
    date = req.body.timesheet.date;
    if (!hours || !rate || !date) {
        res.status(400).send();
    }
    else {
        const sql = 'INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employee_id)';
        const values = {
            $hours: hours,
            $rate: rate,
            $date: date,
            $employee_id: req.employee.id
        };
        db.run(sql, values, function(err, row) {
            if (err) {
                next(err);
            }
            else {
                const fetchNew = `SELECT * FROM Timesheet WHERE id = ${this.lastID}`;
                db.get(fetchNew, (err, row) => {
                    if (err) {
                        next(err);
                    }
                    else {
                        res.status(201).send({ timesheet: row });
                    }
                });
            }
        });
    }
});

employeeRouter.put('/:employeeId/timesheets/:timesheetId', (req, res, next) => {
    const hours = req.body.timesheet.hours,
    rate = req.body.timesheet.rate,
    date = req.body.timesheet.date;
    if (!hours || !rate || !date) {
        res.status(400).send();
    }
    else {
        const sql = 'UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date WHERE id = $id';
        const values = {
            $hours: hours,
            $rate: rate,
            $date: date,
            $id: req.timesheet.id
        };
        db.run(sql, values, (err, row) => {
            if (err) {
                next(err);
            }
            else {
                const fetchSql = 'SELECT * FROM Timesheet WHERE id = $id';
                const fetchValues = {
                    $id: req.timesheet.id
                };
                db.get(fetchSql, fetchValues, (err, row) => {
                    if (err) {
                        next(err);
                    }
                    else {
                        res.status(200).send({ timesheet: row });
                    }
                });
            }
        });
    }
});

employeeRouter.delete('/:employeeId/timesheets/:timesheetId', (req, res, next) => {
    const sql = 'DELETE FROM Timesheet WHERE id = $id';
    const values = {
        $id: req.timesheet.id
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

module.exports = employeeRouter;