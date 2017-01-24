var roles = {
    harvester: require('role.harvester'),
    upgrader: require('role.upgrader'),
    builder: require('role.builder'),
    repairer: require('role.repairer'),
    waller: require('role.waller'),
    longDistanceHarvester: require('role.longDistanceHarvester'),
    scout: require('role.scout'),
    claimer: require('role.claimer'),
    miner: require('role.miner'),
    transporter: require('role.transporter')
}

/*
var roleMinimums = {
    harvester: 3,
    builder: 3,
    repairers: 1,
    wallers: 2,
    upgraders: 8,
    miners: 2,
    longDistanceHarvesters: 2,
    scouts: 1,
    claimers: 1
}
*/

Creep.prototype.runRole =
    function() {
        try {
            //console.log(this.name + ": " + this.memory.role);
            roles[this.memory.role].run(this);
        }
        catch (err) {
            console.log("Error in creep.runRole: " + this.memory.role + " errorMsg: "  + err.message);
        }
    }

/** @function
    @param {bool} useContainer */
Creep.prototype.getEnergy =
    function(useContainer) {
        //Pickup any energy that might be dropped around the creep
        var droppedEnergy = this.pos.findInRange(FIND_DROPPED_ENERGY, 1);
        if (droppedEnergy.length) {
            //console.log(this.name + "found " + droppedEnergy[0].energy + " energy to pick up.");
            this.say(droppedEnergy[0].energy + "nrg")
            this.pickup(droppedEnergy[0]);
        }

        if (useContainer) {
            if (!this.memory.storedContainer) {
                let container = this.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: structure => structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 50
                });
                if (container){
                    this.memory.storedContainer = container.id;                    
                }
                else {
                    creep.say("nrg short");
                }
            } else {
                console.log("test container");
                if (this.withdraw(Game.getObjectById(this.memory.storedContainer), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    this.moveTo(Game.getObjectById(this.memory.storedContainer));
                    this.say("need nrg");
                }

            }
        }
    };
