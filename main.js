/* 
 * Simple Hardware-esque Discrete-Event Simulation, 
 * in modern(ish) JavaScript. 
 */

var Heap = require("collections/heap");


class Event {
    /* Event "class" 
     * Mostly a two-tuple or structure of 
     * (a) A `task` (function-object) to be run, and 
     * (b) A simulated `time` to run it at */
    constructor (time, task) {
        this.time = time;
        this.task = task;
    }
}

class Model {
    /* 
     * A Simple System-Model, 
     * Using the sorts of event-driven constructs common in Verilog or VHDL, 
     * But calling `sim.add_event` instead of using special syntax. 
     */
    constructor () {
        // This "this binding" can go away if using arrow-function-enabled Javascript
        this.kickStart = this.kickStart.bind(this);
        this.keepGoing = this.keepGoing.bind(this);
        
        // Create our Sim object.  This would be "behind the scenes" in a dedicated HDL. 
        this.sim = new Sim();
        this.sim.add_event(new Event(0, this.kickStart));
    }
    kickStart () {
        console.log(this.sim.time.toString() + " KICK STARTING!");
        const e = new Event(11, this.keepGoing);
        this.sim.add_event(e);
        const e2 = new Event(3, this.keepGoing);
        this.sim.add_event(e2);
    }
    keepGoing () {
        console.log(this.sim.time.toString() + " STILL GOING!");
        const e = new Event(this.sim.time + 10, this.keepGoing);
        this.sim.add_event(e);
    }
}

class Sim {
    /* Discrete-Event Simulation Class */
    constructor () {
        // Our primary attribute is a min-heap, sorted by event-time 
        this.events = new Heap(null, null, function (a, b) {
            return b.time - a.time;
        });
        this.time = 0;
    }
    add_event(e) {
        /* Add new Event `e` */
        this.events.push(e);
    }
    run (tstop) {
        /* Run simulation, up to time `tstop` */
        while(this.events.length) {
            // Grab the next event
            const e = this.events.pop();  
            // If it's after tstop, put it back and bail
            if (e.time > tstop) {
                this.events.push(e);
                break;
            }
            // Run it!
            this.time = e.time;
            e.task(); 
        }
    }
}

// Create our model instance 
const model = new Model();
const sim = model.sim;
// Run for a while
sim.run(40);
// Pause, look around a second
console.log("PAUSED!");
// Now run for a while longer
sim.run(100);

