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
  
function addExercise(event) {
  var req = new XMLHttpRequest();
  var input = document.getElementById("newExercise");
  var params =
    "name=" +
    input.elements.name.value +
    "&reps=" +
    input.elements.reps.value +
    "&weight=" +
    input.elements.weight.value +
    "&date=" +
    input.elements.date.value;
  if (document.getElementById("lbs").checked === true) {
      params = params + "&unit=1"; 
  } else if (document.getElementById("kg").checked === true) {
      params = params + "&unit=0";
  }
  
  req.onreadystatechange = function() {
    if (req.readyState === 4) {
        var res = JSON.parse(req.responseText);
        var newAddedID = res.inserted;
        var table = document.getElementById("displayTable");
        var row = table.insertRow(-1);
        var nameAdded = document.createElement("td");
        nameAdded.textContent = input.elements.name.value;
        row.appendChild(nameAdded);
        var repsAdded = document.createElement("td");
        repsAdded.textContent = Math.round(Number(input.elements.reps.value || 0));
        row.appendChild(repsAdded);
        var weightAdded = document.createElement("td");
        weightAdded.textContent = Math.round(Number(input.elements.weight.value || 0));
        row.appendChild(weightAdded);
        var dateAdded = document.createElement("td");
        dateAdded.textContent = !input.elements.date.value ? "" : getFormattedDate(new Date(input.elements.date.value.replace("-","/")));
        row.appendChild(dateAdded);
        var unitAdded = document.createElement("td");
        if (input.elements.unit.value === "lbs") {
            unitAdded.textContent = "lbs";
        } else if (input.elements.unit.value === "kg"){
            unitAdded.textContent = "kg";
        }
        row.appendChild(unitAdded);

        var editEvent = document.createElement("td");
        var editEventLink = document.createElement("a");
        editEventLink.setAttribute("href", "/edit?id=" + newAddedID);
        var editButton = document.createElement("input");
        editButton.setAttribute("type", "button")
        editButton.setAttribute("value", "Edit");
        editEventLink.appendChild(editButton);
        editEvent.appendChild(editEventLink);
        row.appendChild(editEvent);

        var deleteEvent = document.createElement("td");
        var deleteButton = document.createElement("input");
        deleteButton.setAttribute("type", "button");
        deleteButton.setAttribute("value", "Delete");
        deleteButton.setAttribute("onClick", "deleteExercise("+newAddedID+")");
        var deleteHidden = document.createElement("input");
        deleteHidden.setAttribute("type", "hidden");
        deleteHidden.setAttribute("id", newAddedID);
        deleteEvent.appendChild(deleteHidden);
        deleteEvent.appendChild(deleteButton);
        row.appendChild(deleteEvent);
        input.reset();
    }
  }  
  var url = "/insert?" + params;
  req.open("GET", url, true);
  req.setRequestHeader("Content-Type", "application/json");
  req.send(url);
  event.preventDefault();
}

function deleteExercise(id) {
    var table = document.getElementById("displayTable");
    var rows = table.rows;
    for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        var rowData = row.getElementsByTagName("td");
        var rowLength = rowData.length;
        var target = rowData[rowLength - 1];
        if (target.children[0].id == id) {
            table.deleteRow(i);
        }
    }
    var req = new XMLHttpRequest();
    var url = "/delete?id=" + id;
    req.open("GET", url, true);
    req.send(url);
}
