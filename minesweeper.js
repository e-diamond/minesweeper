function create2Darray(rows, columns) {
  var arr = [];

  for (var i = 0; i < rows; i++) {
    arr[i] = [];
    for (var j = 0; j < columns; j++) {
      arr[i][j] = null;
    }
  }
  return arr;
}

// set up mines (9s)
function setupMines(mines) {

  // generate random coordinates until all mines are placed
  while (mines > 0) {

    // generate random coordinates
    var y = Math.floor(Math.random()*rows);
    var x = Math.floor(Math.random()*columns);

    // check there is no mine already at this location
    if (grid[y][x].value != 9) {
      grid[y][x].value = 9;
      minearr.push(grid[y][x]);
      mines--;
    }
  }
}

// create table not showing numbers
function hiddenTable(arr) {
  // initialise string to place into <table>
  var output = "";

  for (var i = 0; i < arr.length; i++) {
    output += "<tr>";
    for (var j = 0; j < arr[i].length; j++) {
      output += ("<td id=\"" + i + "_" + j + "\" class=\"cell\" onmouseup=\"played(this.id, event)\"></td>");
    }
    output += "</tr>";
  }
  return output;
}

// start the timer
var timerswitch;
function startTimer() {
  timerswitch = setInterval(updateTimer, 1000);
}

// update the timer each second
function updateTimer() {

  // check if minutes needs to be incremented
  if (seconds < 59) {
    seconds++;
  } else {
    minutes++;
    seconds = 0;
  }

  // formatting
  if (seconds < 10) {
    seconds = "0" + seconds;
  }

  // write timer to screen
  document.getElementById("timer").innerHTML = minutes + ":" + seconds;
}

// find cell index from html id
function identify(id){
  // initialise index vector
  var index = [];

  var seperator = id.indexOf("_");
  index.push(Number(id.slice(0, seperator)));
  index.push(Number(id.slice(seperator+1, id.length)));
  return index;
}

// carry out different methods on click
function played(id, event) {
  if (!timer_running) {
    startTimer();
    timer_running = true;
  }

  // get cell index
  var x = identify(id);

  // check if left or right click
  if (event.button == 0) {
    // reveal on left click
    grid[x[0]][x[1]].reveal();
  }else if (event.button == 2) {
    // flag on right click
    grid[x[0]][x[1]].flag();
  }
}


// update number of flags available
function updateInfo() {
  document.getElementById("mines").innerHTML = "Flags: " + flags;
}

// carries out end of game procedure
function gameEnd(win) {
  game_end = true;
  clearInterval(timerswitch);

  // remove all dynamic attributes
  allcells = document.getElementsByClassName("cell");
  for (var i = 0; i < allcells.length; i++) {
    att = allcells[i].attributes;
    att.removeNamedItem("onmouseup");
  }

  // put text into overlay
  if (win) {
    document.getElementById("overlay").innerHTML = "You Win!";
  } else {
    document.getElementById("overlay").innerHTML = "Game Over";
  }
}

// create Cell object
class Cell {
  constructor(y, x) {
    this.y = y;
    this.x = x;
    this.value = null;
    this.revealed = false;
    this.flag_status = 0;
  }

  // get cell value by counting surrounding mines
  mineCount(){
    // initialise mine count
    var count = 0;

    // skip if mine
    if (this.value != 9) {

      // check surrounding cells
      for (var i = -1; i <= 1; i++) {
        // skip if off board (vertical)
        if (this.y + i < 0 || this.y + i >= rows) {
          continue;
        }
        for (var j = -1; j <= 1; j++){
          // skip if off board (horizontal)
          if (this.x + j < 0 || this.x + j >= columns) {
            continue;
          }
          // increment count if a mine is found
          if (grid[this.y+i][this.x+j].value == 9) {
            count++;
          }
        }
      }
      // update value
      this.value = count;
    }
  }

  // display cell value on grid
  reveal() {
    if (!this.revealed) {

      this.revealed = true;
      var id = this.y + "_" + this.x
      document.getElementById(id).style.backgroundColor = "#e6e6e6";

      // reveal surrounding cells if no adjacent mines
      if (this.value == 0) {
        for (var i = -1; i <= 1; i++) {
          // skip if off board (vertical)
          if (this.y + i < 0 || this.y + i >= rows) {
            continue;
          }
          for (var j = -1; j <= 1; j++){
            // skip if off board (horizontal)
            if (this.x + j < 0 || this.x + j >= columns) {
              continue;
            }
            if (i != 0 || j !=0) {
              grid[this.y+i][this.x+j].reveal()
            }
          }
        }
      }else if (this.value == 9) {
        gameEnd(false);
        document.getElementById(id).innerHTML = "<img src=\"cartoon-sea-mine-clipart.svg\" alt=\"O\">";
      }else {
        document.getElementById(id).innerHTML = this.value;
      }
    }

  }

  flag(){
    if (!this.revealed) {
      // get grid id
      var id = this.y + "_" + this.x
      // get element
      var cell = document.getElementById(id);

      // check flag status of cell
      switch (this.flag_status) {

        case 0:
          if (flags > 0) {
            this.flag_status = (this.flag_status+1) % 3;
            cell.innerHTML = "<img src=\"Antu_flag-red.svg\" alt=\">\">";
            flags--;

            // check for gameEnd
            for (var i = 0; i < minearr.length; i++) {
              if (minearr[i].flag_status != 1) {
                break;
              }
            }
            if (i == mines) {
              gameEnd(true);
            }
          }
          break;

        case 1:
          this.flag_status = (this.flag_status+1) % 3;
          cell.innerHTML = "?";
          flags++;
          break;

        case 2:
          this.flag_status = (this.flag_status+1) % 3;
          cell.firstChild.remove();
          break;
      }

      updateInfo();
    }
  }

}

// get rows and columns
rows = 10;
columns = 10;

// create game board
var grid = create2Darray(rows, columns);
var minearr = [];
var mines = 15;
var flags = mines;
var game_end = false;

// initialise each cell as a new object
for (var i = 0; i < grid.length; i++) {
  for (var j = 0; j < grid[i].length; j++) {
    grid[i][j] = new Cell(i, j);
  }
}

timer_running = false;
minutes = 0;
seconds = 0;

// show info about the game
updateInfo();

// place mines around grid
setupMines(mines);

// update cell values
for (var i = 0; i < grid.length; i++) {
  for (var j = 0; j < grid[i].length; j++) {
    grid[i][j].mineCount();
  }
}

// display hidden table
document.getElementById("table").innerHTML = hiddenTable(grid);
