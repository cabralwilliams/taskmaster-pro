var tasks = {};

var auditTask = function(taskEl) {
  var rightNow = moment();
  var dueDate = $(taskEl).find("span").text().trim();
  console.log(dueDate);
  var dueDateOb = moment(dueDate, "L").set("hour", 17); //Gets the date-time on the due date
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  if(moment().isAfter(dueDateOb)) {
    //Adds a danger class if the task is overdue
    $(taskEl).addClass("list-group-item-danger");
  } else if (Math.abs(moment().diff(dueDateOb, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }
}

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  //Audit the task
  auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

//Course Solutions
$(".list-group").on("click", "p", function() {
  var text = $(this)
  .text()
  .trim();
  var textInput = $("<textarea>")
  .addClass("form-control")
  .val(text);
  $(this).replaceWith(textInput);
  textInput.trigger("focus");
});

$(".list-group").on("blur","textarea", function() {
  // get the textarea's current value/text
  var text = $(this)
    .val()
    .trim();

  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  tasks[status][index].text = text;
  saveTasks();

  // recreate p element
  var taskP = $("<p>")
  .addClass("m-1")
  .text(text);

  // replace textarea with p element
  $(this).replaceWith(taskP);
});

$(".list-group").on("click", "span", function() {
  // get current text
  var date = $(this).text().trim();

  // create new input element
  var dateInput = $("<input>").attr("type", "text").addClass("form-control").val(date);

  $(this).replaceWith(dateInput);

  // enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose: function() {
      // when calendar is closed, force a "change" event on the `dateInput`
      $(this).trigger("change");
    }
  });

  // automatically bring up the calendar
  dateInput.trigger("focus");
});

$(".list-group").on("change", "input[type='text']", function() {
  var date = $(this).val();
  var taskType = $(this).closest(".list-group").attr("id").replace("list-","");
  var index = $(this).closest(".list-group-item").index();
  tasks[taskType][index].date = date;
  saveTasks();

  //Replace span element
  var newSpan = $("<span>").addClass("badge badge-primary badge-pill").text(date);
  $(this).replaceWith(newSpan);

  // Pass task's <li> element into auditTask() to check new due date
  auditTask($(newSpan).closest(".list-group-item"));
});

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

//My solutions - They worked
/*
var oldTaskDesc = "";
var oldTaskDate = "";
var editingTask = false;
//#list-toDo item was clicked
$("#list-toDo").on("click", "li", function() {
  if(!editingTask) {
    var dateLabel = $("<label>");
    dateLabel.attr("for","taskDateEdit");
    dateLabel.text("Due Date: ");
    oldTaskDate = $(this).children("span").text();
    var textAreaEl1 = $("<textarea>").text(oldTaskDate);
    textAreaEl1.addClass("form-control");
    textAreaEl1.attr("name", "taskDateEdit");
    textAreaEl1.attr("id","taskDateEdit");
    var descLabel = $("<label>");
    descLabel.attr("for","descEdit");
    descLabel.text("Task Description: ");
    oldTaskDesc = $(this).children("p").text();
    var textAreaEl2 = $("<textarea>").text(oldTaskDesc);
    textAreaEl2.addClass("form-control");
    textAreaEl2.attr("name","descEdit");
    textAreaEl2.attr("id","descEdit");
    var buttonEl = $("<button>").addClass("btn btn-primary").attr("onclick","editTask('toDo')");
    buttonEl.text("Edit Task");
    $(this).children("span").remove();
    $(this).children("p").remove();
    $(this).append(dateLabel);
    $(this).append(textAreaEl1);
    $(this).append(descLabel);
    $(this).append(textAreaEl2);
    $(this).append(buttonEl);
    textAreaEl2.trigger("focus");
    console.log(oldTaskDate);
    console.log(oldTaskDesc);
    console.log(this);
    editingTask = true;
  }
});

var editTask = function(inputKey) {
  var taskIndex = -1;
  var arr = tasks[inputKey];
  do {
    taskIndex++;
  } while(arr[taskIndex].text !== oldTaskDesc || arr[taskIndex].date !== oldTaskDate);
  tasks[inputKey][taskIndex].text = $("#descEdit").val();
  tasks[inputKey][taskIndex].date = $("#taskDateEdit").val();
  $("#list-" + inputKey).html("");
  tasks[inputKey].forEach(function(task) {
    createTask(task.text,task.date,inputKey);
  });
  saveTasks();
  editingTask = false;
}
*/




// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
    $(this).addClass("dropover");
    $(".bottom-trash").addClass("bottom-trash-drag");
    console.log("activate", this);
  },
  deactivate: function(event) {
    $(this).removeClass("dropover");
    $(".bottom-trash").removeClass("bottom-trash-drag");
    console.log("deactivate", this);
  },
  over: function(event) {
    $(event.target).addClass("dropover-active");
    console.log("over", event.target);
  },
  out: function(event) {
    $(event.target).removeClass("dropover-active");
    console.log("out", event.target);
  },
  update: function(event) {
    // array to store the task data in
    var tempArr = [];

    // loop over current set of children in sortable list
    $(this).children().each(function() {
      var text = $(this)
        .find("p")
        .text()
        .trim();

      var date = $(this)
        .find("span")
        .text()
        .trim();

      tempArr.push({text: text, date: date});
    });

    // trim down list's ID to match object property
    var arrName = $(this)
    .attr("id")
    .replace("list-", "");

    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();

    console.log(tempArr);
  }
});

$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    $(".bottom-trash").removeClass("bottom-trash-active");
    console.log("drop");
    ui.draggable.remove();
  },
  over: function(event, ui) {
    $(".bottom-trash").addClass("bottom-trash-active");
    console.log("over");
  },
  out: function(event, ui) {
    $(".bottom-trash").removeClass("bottom-trash-active");
    console.log("out");
  }
});

$("#modalDueDate").datepicker({
  //Prevents selecting dates in the past? Yes - forces due date of at least one day from now
  minDate: 1
});

setInterval($(".card .list-group-item").each(function(index, el) {
  auditTask(el);
}), 30*60*1000);