
var UNIVERSE = (function(UNIVERSE) {

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
        this.mass = force;
    }

    Field.prototype.render = function(ctx) {
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(this.x, this.y, 2, 2);
    }



    function Particle(x, y, velocity) {
        this.mass = 1;

        this.red = 0xFF;
        this.green = 0xFF;
        this.blue = 0xFF;

        this.y = y;
        this.x = x;

        this.velocity = velocity;

        this.updateVector = new Vector();
    }


    Particle.prototype.render = function(width, height, data) {
        var base = (~~this.x * 4) + (~~this.y * (width * 4));

        data[base] = this.red;
        data[base + 1] = this.green;
        data[base + 2] = this.blue;
        data[base + 3] = 0xFF;
    }


    function Universe(canvas, ctx, fields, emitters, particles) {
        this.MAX_PARTICLES = 5000;
        this.CANVAS_WIDTH = canvas.width;
        this.CANVAS_HEIGHT = canvas.height;
        this.HALF_WIDTH = this.CANVAS_WIDTH / 2;
        this.HALF_HEIGHT = this.CANVAS_HEIGHT / 2;

        this.particles_1 = particles;
        this.particles_2 = [];

        this.current_particles = this.particles_1;

        this.fields = fields;
        this.emitters = emitters;

        this.lastRender = 0;

        this.canvas = canvas;
        this.ctx = ctx;
    }
    
    
    function updateParticleNewtonian(fields, particle) {
        var distanceToField,
        force,
        updateVector = new Vector();

        for (var i = 0; i < fields.length; i++) {

            updateVector.setFromPoints(particle.x, particle.y, fields[i].x, fields[i].y);

            distanceToField = updateVector.length();

            // From Newton's laws of gravity.
            force = 6.67384 * ((particle.mass * fields[i].mass) / (distanceToField * distanceToField));

            updateVector.normalize();

            particle.velocity.x = particle.velocity.x + (updateVector.x * force);
            particle.velocity.y = particle.velocity.y + (updateVector.y * force);
        };

        particle.x = particle.x + particle.velocity.x;
        particle.y = particle.y + particle.velocity.y;

        return this.inBounds(particle);
    }


    function updateParticleSimple(fields, particle) {
        var vector = new Vector();

        for (var i = 0; i < fields.length; i++) {

          vector.setFromPoints(particle.x, particle.y, fields[i].x, fields[i].y);
          vector.normalize();

          particle.velocity.x = particle.velocity.x + (vector.x * fields[i].force);
          particle.velocity.y = particle.velocity.y + (vector.y * fields[i].force);
        };

        particle.x = particle.x + particle.velocity.x;
        particle.y = particle.y + particle.velocity.y;

        return this.inBounds(particle);
    }
    
    Universe.prototype.inBounds = function(particle) {
        return !(particle.x < 0 || particle.x > this.CANVAS_WIDTH) || (particle.y < 0 || particle.y > this.CANVAS_HEIGHT);
    }

    Universe.prototype.updateParticle = updateParticleSimple;

    Universe.prototype.update = function() {
        var old_particles,
        particle,
        alive,
        imageData;

        // Swap particle arrays.
        old_particles = this.current_particles,
        this.current_particles = (this.current_particles === this.particles_1) ? this.particles_2: this.particles_1;


        // Set drawing parameters.
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
        this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        imageData = this.ctx.getImageData(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);


        while (old_particles.length > 0) {
            particle = old_particles.shift();
            alive = this.updateParticle(this.fields, particle);
            if (alive) {
                this.current_particles.push(particle);
                particle.render(this.CANVAS_WIDTH, this.CANVAS_HEIGHT, imageData.data);
            }
        }

        this.ctx.putImageData(imageData, 0, 0);

        this.ctx.fillStyle = "#FF0000";
        
        for (var i = 0; i < this.fields.length; i++) {
            this.fields[i].render(this.ctx);
        }

        for (var i = 0; i < this.emitters.length; i++) {
            this.emitters[i].render(this.ctx);
        }

        var emitted = [];

        while (this.emitters.length > 0 && this.emitters[0].canEmit(this.MAX_PARTICLES, this.current_particles.length)) {
            this.current_particles.push.apply(this.current_particles, this.emitters[0].createParticles());
            emitted.push(this.emitters.shift());
        }
        this.emitters.push.apply(this.emitters, emitted);
    }




    function Emitter() {}

    Emitter.prototype.init = function(x, y, angle, rate, spread, force) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.rate = rate;
        this.force = force;

        this.spread;
        this.numToEmit;
        this.halfSpread;

        this.setSpread(spread);
    }


    Emitter.prototype.setSpread = function(spread) {
        this.spread = spread;
        this.numToEmit = ~~ ((this.spread / 2 * Math.PI) * 5);
        this.halfSpread = this.spread / 2;
    }


    Emitter.prototype.canEmit = function(max, current) {
        return this.numToEmit < max - current;
    }


    Emitter.prototype.createParticles = function(max, current) {
        var xVel,
        yVel,
        newParticles = [];

        for (var i = 0; i < this.numToEmit; i++) {
            xVel = Math.cos((this.angle - this.halfSpread) + (i / this.numToEmit) * this.spread) * this.force,
            yVel = Math.sin((this.angle - this.halfSpread) + (i / this.numToEmit) * this.spread) * this.force;
            newParticles.push(new Particle(this.x, this.y, new Vector(xVel, yVel)));
        };
        return newParticles
    }


    Emitter.prototype.render = function(ctx) {
        ctx.fillStyle = ctx.strokeStyle = "rgba(0, 255, 0, 0.0)";

        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, Math.PI * 2, false);
        ctx.stroke();

        ctx.save();

        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle - this.halfSpread);

        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, this.spread, false);
        ctx.lineTo(0, 0);
        ctx.stroke();
        ctx.fill();

        ctx.restore();
    }




    function JitteryEmitter() {}

    JitteryEmitter.prototype = new Emitter();

    JitteryEmitter.prototype.constructor = Emitter;

    JitteryEmitter.prototype.init = function(x, y, angle, rate, spread, force) {
        Emitter.prototype.init.call(this, x, y, angle, rate, spread, force);
    }

    JitteryEmitter.prototype.createParticles = function(max, current) {
        var xVel,
        yVel,
        newParticles = [],
        adjustedAngle;

        for (var i = 0; i < this.numToEmit; i++) {
            adjustedAngle = this.angle - this.halfSpread + this.spread * Math.random();
            xVel = Math.cos(adjustedAngle) * this.force,
            yVel = Math.sin(adjustedAngle) * this.force;
            newParticles.push(new Particle(this.x, this.y, new Vector(xVel, yVel)));
        };
        return newParticles
    }


    // Expose classes on the UNIVERSE object.
    UNIVERSE.Vector = Vector;
    UNIVERSE.Field = Field;
    UNIVERSE.Particle = Particle;
    UNIVERSE.Universe = Universe;
    UNIVERSE.Emitter = Emitter;
    UNIVERSE.JitteryEmitter = JitteryEmitter;

    return UNIVERSE;

})(UNIVERSE || {});