let ballWall;
let activeColorIndex = "0";
let colorLibrary;
let colorPicker;
let buttons = [];
let history;

let catalogIndex = 0;

function setup() {
  let canvas = createCanvas(960, 600);
  canvas.parent("applet");

  colorLibrary = new ColorLibrary(50, 380);
  ballWall = new BallWall(0, 0);
  colorPicker = new ColorPicker(600, 450);
  history = new History();

  //
  ballWall.importLayout(designCatalog[catalogIndex]);
  colorLibrary.updateBallCount(ballWall.countBallColors());
  history.insertHistory(ballWall.exportLayout());
  buttons.push(new CanvasButton(width - 80, height - 30, ">"));
  buttons.push(new CanvasButton(width - 200, height - 30, "<"));
  buttons.push(new CanvasButton(width - 150, height - 250, "undo"));
  buttons.push(new CanvasButton(width - 40, height - 250, "redo"));
  // makeButton(">", createVector(width-100,height-30), nextCatalogIndex)
  // makeButton("<", createVector(800,500), prevCatalogIndex)

  // let str = "";

  //   for(let i=1;i<designCatalog.length;i++){
  // str +='"'+ballWall.generateContractedKey(designCatalog[i])+'",';

  // }
  // console.log(str)
}

function draw() {
  background(255);
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].display();
  }
  ballWall.drawBalls();
  colorPicker.display();
  colorLibrary.displayData();
  fill(0);
  textAlign(CENTER, CENTER);
  text(catalogIndex + "/" + (designCatalog.length - 1), width - 140, height - 30);
  text("Design Catalog:", width - 340, height - 30);

  if (mouseIsPressed) {
    ballWall.checkClick();
    colorLibrary.updateBallCount(ballWall.countBallColors());
  }
}

function mouseClicked() {
  if (ballWall.checkClick()) {
  }
  colorPicker.checkClick();
  colorLibrary.updateBallCount(ballWall.countBallColors());
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].checkClick();
  }
}

function mouseReleased() {
  console.log(ballWall.checkClick());
  if (ballWall.checkClick()) {
  }
}

class CanvasButton {
  constructor(x, y, label, fnc) {
    this.pos = createVector(x, y);
    this.label = label;
    this.textSize = 32;
    textSize(this.textSize);
    this.buttonWidth = textWidth(this.label);
    this.padding = 10;
    this.callBack = fnc;
  }

  display() {
    textAlign(CENTER, CENTER);

    stroke(0);
    fill(250);
    strokeWeight(1);
    rectMode(CENTER);
    rect(this.pos.x, this.pos.y, this.buttonWidth + this.padding, textSize());
    fill(0);
    noStroke();
    text(this.label, this.pos.x, this.pos.y);
    textAlign(LEFT, CENTER);
  }

  checkClick() {
    // console.log("hello")
    if (mouseX > this.pos.x - this.buttonWidth / 2 - this.padding / 2 && mouseX < this.pos.x + this.buttonWidth / 2 + this.padding / 2 && mouseY > this.pos.y - textSize() / 2 && mouseY < this.pos.y + textSize() / 2) {
      if (this.label == "<") {
        catalogIndex--;
        if (catalogIndex < 0) catalogIndex = designCatalog.length - 1;
        ballWall.importLayout(designCatalog[catalogIndex]);
      }
      if (this.label == ">") {
        catalogIndex = (catalogIndex + 1) % designCatalog.length;
        ballWall.importLayout(designCatalog[catalogIndex]);
      }
      if (this.label == "undo") {
        history.index--;
        if (history.index <= 0) history.index = 0;
        ballWall.importLayout(history.getKeyByIndex(history.index));
    console.log(history.index, history.data.length)

      }

      if (this.label == "redo") {
        history.index++;
        if (history.index >= history.data.length - 1) history.index = history.data.length - 1;
        ballWall.importLayout(history.getKeyByIndex(history.index));
    console.log(history.index, history.data.length)

      }
    }
  }
}

function nextCatalogIndex() {
  catalogIndex = (catalogIndex + 1) % designCatalog.length;
  console.log(catalogIndex, "/" + (designCatalog.length - 1));
  ballWall.importLayout(designCatalog[catalogIndex]);
}
function prevCatalogIndex() {
  catalogIndex += 1 % designCatalog.length;
}

function saveDesign() {
  let key = ballWall.exportLayout();
  // plugDataIntoTextArea(key)
  const writer = createWriter("BallWall_keyCode-" + month() + day() + year() + hour() + minute() + second() + ".txt");
  writer.print("-Palace Social- \n Copy and paste the keyCode below into the web app to see the ball wall design: \n\n");
  writer.print(key);
  writer.close();
  writer.clear();
}

function loadDesign() {
  // plugDataIntoTextArea(getDataFromTextArea());
  ballWall.importLayout(getDataFromTextArea());
  document.getElementById("textInput").firstChild.value = "";
}

function makeButton(label, pos, callBack) {
  buttons.push(createButton(label));
  buttons[buttons.length - 1].position(pos.x, pos.y);
  buttons[buttons.length - 1].mousePressed(callBack);
}

function plugDataIntoTextArea(d) {
  let inputField = document.getElementById("textInput").firstChild;
  inputField.value = d;
}

function getDataFromTextArea() {
  let inputField = document.getElementById("textInput").firstChild;
  return escapeHtml(inputField.value);
}

class ColorLibrary {
  constructor(x, y) {
    this.location = createVector(x, y);
    this.data = [];
    this.alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    this.prepareColorLibrary();
  }

  prepareColorLibrary() {
    let loadColors = [
      [86, 158, 165, 255, "light blue", 457],
      [0, 107, 118, 255, "dark blue", 32],
      [255, 196, 0, 255, "yellow", 141],
      [241, 147, 120, 255, "pink", 40],
      [224, 65, 43, 255, "orange", 53],
      [99, 132, 105, 255, "green", 45],
      //add new colors to the end of this list only
    ];
    //load into object library easier to read
    for (let i = 0; i < loadColors.length; i++) {
      this.data.push({ index: i, alphaIndex: this.alphabet[i], color: color(loadColors[i][0], loadColors[i][1], loadColors[i][2], loadColors[i][3]), name: loadColors[i][4], max: loadColors[i][5], ballCount: 0 });
    }
    // console.log(this.data)
  }

  updateBallCount(arr) {
    for (let i = 0; i < arr.length; i++) {
      this.data[i].ballCount = arr[i];
    }
    // console.log(this.data)
  }
  getColor(i) {
    // console.log(i)
    return this.data[i].color;
  }

  getIndexByAlphaIndex(ai) {
    for (let i = 0; i < this.data.length; i++) {
      if (ai == this.data[i].alphaIndex) {
        return this.data[i].index;
      }
    }
  }

  getAlphaIndexByIndex(i) {
    // console.log(i)
    return this.data[i].alphaIndex;
  }

  displayData() {
    let fontSize = 32;
    textSize(fontSize);
    fill(0);
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i].ballCount > this.data[i].max) fill(255, 0, 0);
      if (this.data[i].ballCount == this.data[i].max) fill(0, 150, 0);
      if (this.data[i].ballCount < this.data[i].max) fill(100, 100, 100);
      text(this.data[i].name + " : " + this.data[i].ballCount + " / " + this.data[i].max, this.location.x, this.location.y + i * fontSize);
    }
  }
}

class ColorPicker {
  constructor(x = 0, y = 0) {
    this.swatches = [];
    this.swatchSize = 20;
    this.prepareSwatches(x, y);
    this.pos = createVector(x, y);
  }

  prepareSwatches(x, y) {
    for (let i = 0; i < colorLibrary.data.length; i++) {
      this.swatches.push(new Ball(i, 0, this.swatchSize));
      this.swatches[this.swatches.length - 1].setTranslate(x, y);
      this.swatches[this.swatches.length - 1].colorIndex = i;
      this.swatches[this.swatches.length - 1].isSwatch = true;
    }
  }

  display() {
    fill(0);
    text("Color Picker", this.pos.x, this.pos.y - this.swatchSize);
    for (let i = 0; i < this.swatches.length; i++) {
      this.swatches[i].display();
      // console.log(this.swatches[i].location);
    }
  }

  checkClick() {
    for (let i = 0; i < this.swatches.length; i++) {
      this.swatches[i].checkClick();
    }
  }
}

class BallWall {
  constructor(x = 0, y = 0) {
    this.balls = [];
    this.ballSize = 20;
    this.prepareBalls(x, y);
  }

  prepareBalls(x, y) {
    for (let i = 0; i < 16; i++) {
      for (let j = 0; j < 48; j++) {
        this.balls.push(new Ball(j, i, this.ballSize));
        // this.balls[this.balls.length - 1].setTranslate(x, y);
      }
    }
  }

  drawBalls() {
    for (let i = 0; i < this.balls.length; i++) {
      this.balls[i].display();
    }
  }

  checkClick() {
    // let ballWasClicked = false;
    for (let i = 0; i < this.balls.length; i++) {
      if (this.balls[i].checkClick()) {
        return true;
      }
    }
    return false;
  }

  solidColorFill() {
    for (let i = 0; i < this.balls.length; i++) {
      this.balls[i].this.colorIndex = activeColorIndex;
    }
  }

  countBallColors() {
    let v = [];
    for (let i = 0; i < colorLibrary.data.length; i++) {
      v.push(0); //start counters at 0
    }

    for (let i = 0; i < this.balls.length; i++) {
      v[this.balls[i].colorIndex]++;
    }

    // console.log(v);
    // updateColorsLibraryBallCount(v);
    return v;
  }

  exportLayout() {
    let key = this.generateKey();
    return this.generateContractedKey(key);
  }

  importLayout(str) {
    str = str.trim();
    // plugDataIntoTextArea(str);
    str = this.expandKey(str);
    let data = split(str, ",");
    // console.log(data)
    for (let i = 0; i < this.balls.length; i++) {
      if (i < data.length) {
        this.balls[i].colorIndex = data[i];
      } else {
        this.balls[i].colorIndex = 0;
      }
    }
    colorLibrary.updateBallCount(ballWall.countBallColors());
  }

  generateKey() {
    let key = "";
    for (let i = 0; i < this.balls.length; i++) {
      key += this.balls[i].colorIndex + ",";
    }
    return key;
  }

  generateContractedKey(key) {
    // let key = this.generateKey();
    //convert colorIndex to alphaIndex values
    let alphaKey = "";
    for (let i = 0; i < key.length; i++) {
      if (Number.isInteger(parseInt(key[i]))) {
        alphaKey += colorLibrary.getAlphaIndexByIndex(parseInt(key[i]));
      } else {
        alphaKey += ",";
      }
    }
    alphaKey = alphaKey.replace(/,/gi, ""); //remove the commas
    //convert to alpha-numeric format
    let alphaNumeric = "";
    let current = alphaKey[0];
    let count = 0;
    for (let i = 0; i <= alphaKey.length; i++) {
      // console.log(current, alphaKey[i]);
      if (alphaKey[i] == current) {
        count++;
      }
      if (alphaKey[i] != current) {
        alphaNumeric += current + "" + count;
        current = alphaKey[i];
        count = 1;
      }
    }
    return alphaNumeric;
  }

  expandKey(str) {
    // console.log(str);
    let dataSplit = str.match(/[a-z]+|[^a-z]+/gi);
    let expand = "";
    for (let i = 0; i < dataSplit.length; i += 2) {
      let colorIndex = colorLibrary.getIndexByAlphaIndex(dataSplit[i]);
      for (let j = 0; j < dataSplit[i + 1]; j++) {
        expand += colorIndex + ",";
      }
    }
    return expand;
  }
}

class Ball {
  constructor(x, y, s) {
    this.ballSize = s;
    this.location = createVector(x * this.ballSize + this.ballSize / 2, y * this.ballSize + this.ballSize / 2);
    this.colorIndex = floor(random(0, colorLibrary.data.length));
    this.color_name = "";
    this.isSwatch = false;
    this.translate = createVector(0, 0);
  }

  setTranslate(x, y) {
    this.translate = createVector(x, y);
  }
  setColorIndex(v) {
    this.colorIndex = v;
  }

  display(padX = 0, padY = 0) {
    noStroke();
    fill(colorLibrary.getColor(this.colorIndex));
    circle(this.location.x + this.translate.x, this.location.y + this.translate.y, this.ballSize);
    if (this.isSwatch && this.colorIndex == activeColorIndex) {
      fill(0);
      circle(this.location.x + this.translate.x, this.location.y + this.translate.y, this.ballSize / 2);
    }
  }

  checkClick() {
    if (dist(mouseX, mouseY, this.location.x + this.translate.x, this.location.y + this.translate.y) < this.ballSize / 2) {
      // console.log("ballclicked");
      // if (countColor() < color_limits[active_color]) {
      if (this.isSwatch == true) {
        activeColorIndex = this.colorIndex;
      } else {
        if (this.colorIndex == activeColorIndex) {
          //do nothing
        } else {
          this.colorIndex = activeColorIndex;
          history.checkForChanges();
        }

        // plugDataIntoTextArea(ballWall.exportLayout());
      }
      // }
      // if (this.colorIndex > 5) this.colorIndex = 0;
      return true;
    }
  }
}

class History {
  constructor() {
    this.data = [];
    this.index = 0;
    this.historyStorage = 100;
  }

  insertHistory(val) {
    console.log(this.index, this.data.length)
    if (this.index < this.data.length-1 ) {
      //the index is simewhere in the middle of the history chain
      this.clearForwardFromIndex(this.index);
    }
    if (!val) {
      val = ballWall.exportLayout();
    }
    if (this.data.length > this.historyStorage) {
      this.data.shift();
    }
    this.data.push(val);
    this.index = this.data.length - 1;
    
  }

  checkForChanges() {
    let currentState = ballWall.exportLayout();
    if (currentState == this.data[this.data.length - 1]) {
      //state is the same
      //no action needed
    } else {
      //state changed
      this.insertHistory(currentState);
    }
    // console.log(this.data);
  }

  getKeyByIndex(i) {
    return this.data[i];
  }

  clearHistory() {
    thisdata = [];
  }

  clearForwardFromIndex(i) {
    this.data.splice(i+1);
    this.index = this.data.length-1
  }
}

function escapeHtml(string) {
  let entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;",
  };
  return String(string).replace(/[&<>"'`=\/]/g, function (s) {
    return entityMap[s];
  });
}

console.log(escapeHtml("   Hello <p></p> `//"));
// function add() {

//   //Create an input type dynamically.
//   var element = document.createElement("input");

//   //Create Labels
//   var label = document.createElement("Label");
//   label.innerHTML = "New Label";

//   //Assign different attributes to the element.
//   element.setAttribute("type", "text");
//   element.setAttribute("value", "");
//   element.setAttribute("name", "Test Name");
//   element.setAttribute("style", "width:200px");

//   label.setAttribute("style", "font-weight:normal");

//   // 'foobar' is the div id, where new fields are to be added
//   var foo = document.getElementById("fooBar");

//   //Append the element in page (in span).
//   foo.appendChild(label);
//   foo.appendChild(element);
//   }
