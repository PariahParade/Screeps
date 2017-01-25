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
    @param {bool} useContainer
    @param {bool} useStorage */
Creep.prototype.getEnergy =
    function(useContainer, useStorage, ableToHarvest) {
        //Pickup any energy that might be dropped around the creep
        var droppedEnergy = this.pos.findClosestByPath(FIND_DROPPED_ENERGY);
        console.log(droppedEnergy.energy);
        if (droppedEnergy > this.energyCapacityAvailable) {
            useStorage == false;
            useContainer == false;
            ableToHarvest == false;
            if (this.pickup(droppedEnergy) == ERR_NOT_IN_RANGE) {
                this.moveTo(droppedEnergy);
            }
            else {
                this.say(droppedEnergy.energy + "nrg")
            }
        }
        
        if (useStorage) {
            if (!this.memory.storedStorage) {
                let targetStorage = this.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: structure => structure.structureType == STRUCTURE_STORAGE
                });
                if (targetStorage){
                    this.memory.storedStorage = targetStorage.id;                    
                }
                else {
                    this.say("no storage!");
                }
            } else {
                if (this.withdraw(Game.getObjectById(this.memory.storedStorage), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    this.moveTo(Game.getObjectById(this.memory.storedStorage));
                    this.say("strg nrg");
                }

            }
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
                    this.say("nrg short");
                }
            } else {
                if (this.withdraw(Game.getObjectById(this.memory.storedContainer), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    this.moveTo(Game.getObjectById(this.memory.storedContainer));
                    this.say("cntnr nrg");
                }

            }
        }
        
        
        //Pickup any energy that might be dropped around the creep
        var droppedEnergy = this.pos.findClosestByPath(FIND_DROPPED_ENERGY);
        //console.log(droppedEnergy);
        if (droppedEnergy) {
            console.log(this.name + " in nrg");
            if (this.pickup(droppedEnergy) == ERR_NOT_IN_RANGE) {
                this.moveTo(droppedEnergy);
            }
            else {
                this.say(droppedEnergy.energy + "nrg")
            }
        }
        
        
        if (ableToHarvest) {
            // Backup in case miners die for some reason
            var source = this.pos.findClosestByPath(FIND_SOURCES);
	        if (this.harvest(source) == ERR_NOT_IN_RANGE) {
	            this.moveTo(source);
	        }
        }
        
        
    };
