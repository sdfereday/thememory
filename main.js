require(['chance', 'ramda'], function (Chance, Ramda) {

	var chance = new Chance();

    var ShapeClick = function() {

      var self = this;

      // Top, Right, Bottom, Left
      this.combos = [1, 2, 4, 8];
      // An array to hold the right combination
      this.memoryQueue = [];
      // The current level
      this.level = 1;
      // The complexity level, for testing we'll keep it by level number
      this.complexity = this.level;
      // Time given between shape changes (changes with complexity if needed)
      this.timeGiven = 500;
      // Element stuff
      this.mainShape = null;
      this.currentShapeIndex = 0;
      this.toggle = -1;
      this.userMode = false;
      this.animInProgress = false;

      this.floater = null;
      this.score = document.getElementById("score");

      var top = document.getElementById("top-region"),
      right = document.getElementById("right-region"),
      bottom = document.getElementById("bottom-region"),
      left = document.getElementById("left-region");

      top.addEventListener("click", function() {
        self.onUserInput(1, 0);
      });

      right.addEventListener("click", function() {
        self.onUserInput(2, 1);
      });

      bottom.addEventListener("click", function() {
        self.onUserInput(4, 2);
      });

      left.addEventListener("click", function() {
        self.onUserInput(8, 3);
      });

      this.elements = [top, right, bottom, left];

      return this;

    };

    ShapeClick.prototype.hideElements = function() {

        this.elements.forEach(function(el){
            
            el.style.opacity = 0;

            if(el.id === 'top-region')
                el.style.top = -99 + 'px';

            if(el.id === 'bottom-region')
                el.style.bottom = -99 + 'px';

            if(el.id === 'right-region')
                el.style.right = -99 + 'px';

            if(el.id === 'left-region')
                el.style.left = -99 + 'px';
            
        });

        if(this.floater)
            this.floater.className = "not-floating";

    };

    ShapeClick.prototype.showElements = function() {

        this.elements.forEach(function(el){

            el.style.opacity = 1;

            if(el.id === 'top-region')
                el.style.top = 0 + 'px';

            if(el.id === 'bottom-region')
                el.style.bottom = 0 + 'px';

            if(el.id === 'right-region')
                el.style.right = 0 + 'px';

            if(el.id === 'left-region')
                el.style.left = 0 + 'px';
            
        });

        if(this.floater)
            this.floater.className = "floating";

    };

    ShapeClick.prototype.onUserInput = function(type, idx) {

      if (!this.userMode)
        return;

      if(this.animInProgress)
        return;

      var self = this;
      var selectedShapeType = this.combos[idx];
      var correctShapeType = this.memoryQueue[this.currentShapeIndex];

      // Apply the class to visualize
      switch (selectedShapeType) {
        case 1:
          this.mainShape.className = "top";
          break;
        case 2:
          this.mainShape.className = "right";
          break;
        case 4:
          this.mainShape.className = "bottom";
          break;
        case 8:
          this.mainShape.className = "left";
          break;
        default:
            console.warn("No eligible shape found.");
            return;
      }

    // Since it's only one, it shouldn't be too much of a hit
    this.animInProgress = true;
      setTimeout(function() {
        self.mainShape.className = "blank"; // To move
        // I know, to improve.
        setTimeout(function(){
            self.checkIfRight(selectedShapeType, correctShapeType);
            self.animInProgress = false;
        }, 200);
      }, 500);

    };

    ShapeClick.prototype.checkIfRight = function(selectedShapeType, correctShapeType) {

        var self = this;

      // Resets everything and starts again 
      if (selectedShapeType !== correctShapeType) {

        this.score.innerHTML = "";
        this.currentShapeIndex = 0;
        this.userMode = false;
        this.level = 1;
        this.memoryQueue.length = 0;
        this.shapeContainer.className = "wrong"; // Div container would be best.

        this.mainShape.innerHTML = "> - <";
        this.mainShape.className = "blank wiggle";
        
        setTimeout(function(){
          self.shapeContainer.className = "";
          self.makeQueue();
        }, 500);     

        return;

      } else {

        // Move to the next one
        this.currentShapeIndex += 1;

      }

      // Made it through all of them correctly
      if (this.currentShapeIndex > this.memoryQueue.length - 1) {

        this.score.innerHTML = "";
        for(var i = 0; i < this.level; i++) {
            this.score.innerHTML += "<span class='heart'>&hearts;</span>";
        }

        this.level += 1;
        this.currentShapeIndex = 0;
        this.userMode = false;
        this.memoryQueue.length = 0;

        this.mainShape.innerHTML = "^ - ^";
        this.shapeContainer.className = "correct";

        this.mainShape.className = "blank bounce";

        // And one last time out to start the next queue. :P
        setTimeout(function(){
        
            self.shapeContainer.className = "";
            self.makeQueue();

        }, 500);

        return;

      }

    };

    ShapeClick.prototype.start = function(shapeId, containerId, floaterId) {

      var self = this;

      this.mainShape = document.getElementById(shapeId);
      this.shapeContainer = document.getElementById(containerId);
      this.floater = document.getElementById(floaterId);

      this.shapeContainer.style.opacity = 1;

      this.memoryQueue.length = 0;
      this.userMode = false;

      if (this.mainShape)
        setTimeout(function(){
          self.shapeContainer.className = "";
          self.makeQueue();
        }, 500);

    }

    ShapeClick.prototype.makeQueue = function() {

      var self = this;

      // Queue complexity increase for each level.
      this.memoryQueue.length = 0;

      /*
      Chance generates a random integer from the types of combos we can have.
      For each level, it increases these by each number (you can tweak this)
      */
      for (var i = 0; i < this.level; i++) {
        var randInt = chance.integer({
          min: 0,
          max: this.combos.length - 1
        });
        this.memoryQueue.push(this.combos[randInt]);
      }

      if (this.memoryQueue.length > 0) {
        this.mainShape.innerHTML = "^ - ^";
        this.hideElements();
        this.visualize();
      }

    };

    ShapeClick.prototype.visualize = function() {

      var self = this;

      if (this.currentShapeIndex > this.memoryQueue.length) {
        this.currentShapeIndex = 0;
        return;
      }

      this.mainShape.className = "blank";

      // Make sure timeout is long enough to accommdate css animation.
      // After queue generated, visualizes it for the user
      var currentShapeType = this.memoryQueue[this.currentShapeIndex];

      this.toggle *= -1;

      if (this.toggle < 0)
        currentShapeType = 0;

      // Apply the class to visualize
      switch (currentShapeType) {
        case 1:
          this.mainShape.className = "top";
          this.currentShapeIndex += 1;
          break;
        case 2:
          this.mainShape.className = "right";
          this.currentShapeIndex += 1;
          break;
        case 4:
          this.mainShape.className = "bottom";
          this.currentShapeIndex += 1;
          break;
        case 8:
          this.mainShape.className = "left";
          this.currentShapeIndex += 1;
          break;
        case 0:
          this.mainShape.className = "blank";
          break;
        default:
          this.currentShapeIndex = 0;
          this.userMode = true;
          this.showElements();
          return;
      }

      // On tick - http://creativejs.com/resources/requestanimationframe/
      setTimeout(function() {
        requestAnimationFrame(function() {
          self.visualize();
        });
        // Drawing code goes here
      }, this.timeGiven);

    }

    // Start her up
    var s = new ShapeClick();
    var startup = document.getElementById("title");

    startup.onclick = function(e) {

      s.hideElements();

      setTimeout(function(){
        s.start("shape", "shape-container", "floater");
        startup.style.display = "none";
      }, 500); // Matches css fadeout.

      startup.className += " fadeOut";

      return false;

    }


});