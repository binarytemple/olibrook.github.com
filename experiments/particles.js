



/*
 * Global varibles.
 */
var CANVAS_WIDTH,
    CANVAS_HEIGHT,
    HALF_WIDTH,
    HALF_HEIGHT,
    canvas,
    ctx,
    time,
    timeDiff,
    lastRender,
    universe;

function init() {
  CANVAS_WIDTH = window.innerWidth;
  CANVAS_HEIGHT = window.innerHeight;
  HALF_WIDTH = window.innerWidth / 2;
  HALF_HEIGHT = window.innerHeight / 2;

  canvas = document.createElement('canvas'),
  ctx = canvas.getContext('2d'),
  document.body.appendChild(canvas);

  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  lastRender = time = (new Date()).getTime();

  universe = new OB.Universe(canvas, ctx);
  timeSlice();
}


function timeSlice() {
  time = (new Date()).getTime();
  timeDiff = time - lastRender;
  lastRender = time;

  universe.update(timeDiff);
  requestAnimFrame(timeSlice);
}



var OB = (function(OB) {


      function Vector(x, y) {
        this.x = x;
        this.y = y;
      }


      Vector.prototype.setFromPoints = function(x1, y1, x2, y2) {
        this.x = x2 - x1;
        this.y = y2 - y1;
      }


      Vector.prototype.length = function() {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
      }


      Vector.prototype.normalize = function() {
        var length = this.length(),
            ratio;

        if (length !== 0) {
          ratio = 1 / length;
          this.x = this.x * ratio
          this.y = this.y * ratio;
        }
        else {
          this.x = this.y = 0;
        }
      }


      function Field(x, y, force) {
        this.x = x;
        this.y = y;
        this.force = force;
      }


      function Particle(x, y, velocity) {

        this.red   = 0xFF;
        this.green = 0xFF;
        this.blue  = 0xFF;

        this.y = y;
        this.x = x;

        this.velocity = velocity;
      }


      Particle.prototype.update = function(diff, fields) {
          var seconds = diff / 1000,
              vector = new Vector();

          for (var i = 0; i < fields.length; i++) {

            vector.setFromPoints(this.x, this.y, fields[i].x, fields[i].y);
            vector.normalize();

            this.velocity.x = this.velocity.x + (vector.x * fields[i].force);
            this.velocity.y = this.velocity.y + (vector.y * fields[i].force);
          };

          this.x = this.x + (this.velocity.x); // * seconds);
          this.y = this.y + (this.velocity.y); // * seconds);
      }


      /*
       * Render the particle using the raw bitmap data for the canvas.
       */
      Particle.prototype.render = function(width, height, data) {
        var base = (~~this.x * 4) + (~~this.y * (width * 4));

        data[base] = this.red;
        data[base + 1] = this.green;
        data[base + 2] = this.blue;
        data[base + 3] = 0xFF;
      }


      function Universe(canvas, ctx) {
        this.MAX_PARTICLES = 1000;

        this.particles = [];
        this.fields = [];
        this.emitters = [];

        this.lastRender = 0;

        this.canvas = canvas;
        this.ctx = ctx;

        // for (var i = 0; i < this.MAX_PARTICLES; i++) {
          // var p = new Particle(Math.random() * CANVAS_WIDTH, Math.random() * CANVAS_HEIGHT, new Vector(0, 0));
          // this.particles.push(p);
        // };

        // this.emitters.push(new Emitter(700, 300, 2 * Math.PI, 0, 0, 2));
        this.emitters.push(new Emitter(HALF_WIDTH, HALF_HEIGHT, 2 * Math.PI, 0, Math.PI, 2));


        this.fields.push(new Field(HALF_WIDTH - 300, HALF_HEIGHT, 0.1));
        this.fields.push(new Field(HALF_WIDTH + 300, HALF_HEIGHT, 0.1));
      }


      Universe.prototype.update = function(timeDiff) {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
        this.ctx.fillRect (0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        var imageData = this.ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        for(var i=0; i < this.particles.length; i++) {
          this.particles[i].update(timeDiff, this.fields);
          this.particles[i].render(CANVAS_WIDTH, CANVAS_HEIGHT, imageData.data);
        }

        this.ctx.putImageData(imageData, 0 ,0);

        this.ctx.fillStyle = "#FF0000";
        for(var i=0; i < this.fields.length; i++) {
          this.ctx.fillRect(this.fields[i].x, this.fields[i].y, 2, 2);
        }

        for (var i = 0; i < this.emitters.length; i++) {
          this.particles = this.particles.concat(this.emitters[i].createParticles());
        };

      }


      function Emitter(x, y, angle, rate, spread, force) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.rate = rate;
        this.spread = spread;
        this.force = force;
      }


      Emitter.prototype.createParticles = function() {
        var xVel,
            yVel,
            numToEmit = ~~ ((this.spread / 2 * Math.PI) * 10);
            halfSpread = this.spread / 2,
            newParticles = [];

        // Emit 36 particles at most, when spread is set to (2 * Math.PI)
        for (var i = 0; i < numToEmit; i++) {
          xVel = Math.cos((this.angle - halfSpread) + (i/numToEmit) * this.spread) * this.force,
          yVel = Math.sin((this.angle - halfSpread) + (i/numToEmit) * this.spread) * this.force;
          newParticles.push(new Particle(this.x, this.y, new Vector(xVel, yVel)));
        };
        return newParticles
      }


      OB.Vector = Vector;
      OB.Field = Field;
      OB.Particle = Particle;
      OB.Universe = Universe;
      OB.Emitter = Emitter;

  return OB;

})(OB || {});

