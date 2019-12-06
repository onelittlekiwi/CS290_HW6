var express = require("express");
var mysql = require("./dbcon.js");

var app = express();
var handlebars = require("express-handlebars").create({
  defaultLayout: "main"
});

function toDateValue(date) {
  if (!date || !date.toISOString) {
    return "";
  }
  return date.toISOString().split("T")[0];
}

function getFormattedDate(date) {
  if (!date || !(date instanceof Date)) {
    return "";
  }
  var year = date.getFullYear();
  var month = date.getMonth()+1;
  if (month < 10) {
    month = "0" + month;
  } 
  var day = date.getDate();
  if (day < 10) {
    day = "0" + day;
  }
  return month + "-" + day + "-" + year;
}

app.use("/public", express.static("public"));

app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");
app.set("port", 14958);

app.get("/reset-table", function(req, res, next) {
  var context = {};
  mysql.pool.query("DROP TABLE IF EXISTS workouts", function(err) {
    var createString =
      "CREATE TABLE workouts(" +
      "id INT PRIMARY KEY AUTO_INCREMENT," +
      "name VARCHAR(255) NOT NULL," +
      "reps INT," +
      "weight INT," +
      "date DATE," +
      "unit BOOLEAN)";
    mysql.pool.query(createString, function(err) {
      res.render("home", context);
    });
  });
});

app.get("/", function(req, res, next) {
  var context = {};
  mysql.pool.query("SELECT * FROM workouts", function(err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
    var params = [];
    for (var i = 0; i < rows.length; i++) {
      var addItem = {
        "id": rows[i].id,
        "name": rows[i].name,
        "reps": rows[i].reps,
        "weight": rows[i].weight,
        "date": getFormattedDate(rows[i].date),
        "unit": null};
      if (rows[i].unit == 1) {
        addItem["unit"] = "lbs";
      } else if (rows[i].unit == 0) {
        addItem["unit"] = "kg";
      }
      params.push(addItem);
    }
    context.results = params;
    res.render("home", context);
  });
});

app.get("/insert", function(req, res, next) {
  var context = {};
  mysql.pool.query(
    "INSERT INTO workouts (`name`, `reps`, `weight`, `date`, `unit`) VALUES (?, ?, ?, ?, ?)",
    [
      req.query.name,
      req.query.reps,
      req.query.weight,
      req.query.date,
      req.query.unit
    ],
    function(err, result) {
      if (err) {
        next(err);
        return;
      }
      context.inserted = result.insertId;
      res.send(JSON.stringify(context));
    }
  );
});

app.get("/delete", function(req, res, next) {
  var context = {};
  mysql.pool.query("DELETE FROM workouts WHERE id=?", [req.query.id], function(err, next) {
    if (err) {
      next(err);
      return;
    }
    res.send();
  });
});

app.get("/edit", function(req, res, next) {
  var context = {};
  mysql.pool.query(
    "SELECT * FROM workouts WHERE id=?",
    [req.query.id],
    function(err, result) {
      if (err) {
        next(err);
        return;
      }
      if (result.length === 1) {
        var editEvent = {
          "id": result[0].id,
          "name": result[0].name,
          "reps": result[0].reps,
          "weight": result[0].weight,
          "date": toDateValue(result[0].date),
          "unit": result[0].unit,
          "lbsChecked": null,
          "kgChecked": null};
        if (result[0].unit == true) {
          editEvent["lbsChecked"] = "checked";
        } else if (result[0].unit == false) {
          editEvent["kgChecked"] = "checked";
        } 
        context.results = editEvent; 
        res.render("editEvent", context);
      }
    });
});

app.get("/editEvent", function(req, res, next) {
  var context = {};
  mysql.pool.query("UPDATE workouts SET name=?, reps=?, weight=?, date=?, unit=? WHERE id=?", 
    [req.query.name, 
    req.query.reps, 
    req.query.weight, 
    req.query.date, 
    req.query.unit,
    req.query.id], 
    function(err, result) {
      if (err) {
        next(err);
        return;
      }
    mysql.pool.query("SELECT * FROM workouts", function(err, rows, fields) {
      if (err) {
        next(err);
        return;
      }
      var params = [];
      for (var i = 0; i < rows.length; i++) {
        var addItem = {
          "id": rows[i].id,
          "name": rows[i].name,
          "reps": rows[i].reps,
          "weight": rows[i].weight,
          "date": getFormattedDate(rows[i].date),
          "unit": null};
        if (rows[i].unit == 1) {
          addItem["unit"] = "lbs";
        } else if (rows[i].unit == 0) {
          addItem["unit"] = "kg";
        }
        params.push(addItem);
      }
      context.results = params;
      res.render("home", context);
    });
  });
});

app.use(function(req, res) {
  res.status(404);
  res.render("404");
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.type("plain/text");
  res.status(500);
  res.render("500");
});

app.listen(app.get("port"), function() {
  console.log(
    "Express started on http://flip3.engr.oregonstate.edu:" +
      app.get("port") +
      "; press Ctrl-C to terminate."
  );
});