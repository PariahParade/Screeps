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
    transporter: require('role.transporter'),
    guardian: require('role.guardian'),
    longDistanceBuilder: require('role.longDistanceBuilder'),
    soldier: require('role.soldier'),
    fenceguard: require('role.fenceguard'),
    extractor: require('role.extractor'),
    scout: require('role.scout'),
    hauler: require('role.hauler'),
    soldier: require('role.soldier')
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
            console.log("Error in creep.runRole: " + this.name + ": " + this.memory.role + " errorMsg: "  + err.message + ". " + err.stack);
        }
    }

/** @function
    @param {bool} useContainer
    @param {bool} useStorage */
Creep.prototype.getEnergy =
    function(useContainer, useStorage, ableToHarvest, useLink) {
        var availableEnergy = [];
       
       //TODO: Make all this crap a switch statement?
       
       if (useLink) {
            let link = this.pos.findInRange(FIND_MY_STRUCTURES, 1, {
                filter: structure => structure.structureType == STRUCTURE_LINK && structure.energy > 0
            });
            //console.log(link);
            if (link.length > 0) {
                useStorage = false;
                useContainer = false;
                ableToHarvest = false;
                if(this.withdraw(link[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                	//this.moveTo(link[0]);
                	this.say("mv link");
                }
            }
        }
       
        if (useStorage) {
            if (this.room.storage){
                if (this.room.storage.store[RESOURCE_ENERGY] > 100) {
                    useContainer = false;
                    ableToHarvest = false;
                    if (this.withdraw(this.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        this.moveTo(this.room.storage, {noPathFinding: true});
                        // Perform pathfinding only if we have enough CPU
                        if(Game.cpu.tickLimit - Game.cpu.getUsed() > 20) {
                            this.moveTo(this.room.storage);
                        }
                        this.say("mv strg");
                    }
                
                }
            }
        }

        if (useContainer) {
            if (!this.memory.storedContainer || this.memory.storedContainer == '') {
                let container = this.room.find(FIND_STRUCTURES, {
                    filter: structure => structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 20
                });
                
                container.sort(function (a,b) {return (b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY])});
                
                if (container.length > 0){
                    this.memory.storedContainer = container[0].id;                    
                }
                else {
                    //Logic fall-through: creep will harvest
                }
            } else {
                let storedContainer = Game.getObjectById(this.memory.storedContainer);
                
                if (this.withdraw(storedContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    ableToHarvest = false;
                    this.moveTo(storedContainer, {noPathFinding: true});
                    // Perform pathfinding only if we have enough CPU
                    if(Game.cpu.tickLimit - Game.cpu.getUsed() > 20) {
                        this.moveTo(storedContainer);
                    }
                    this.say("mv ctnr");
                }
                // If this container is empty, memorize a new one
                if (storedContainer.store[RESOURCE_ENERGY] < 20) {
                    this.memory.storedContainer = '';
                    //console.log(this.name + ' memorizing new container cuz old was empty.');
                }
            }
        }
        

        if (ableToHarvest) {
            // If we don't have a source in our memory, get one.
            if (!(this.memory.sourceId) || this.memory.sourceId == '0') {
                var sources = this.room.find(FIND_SOURCES);
                
                // Get a random number so that we get sent to a random source.
                var randomSource = Math.floor(Math.random() * (sources.length));
                this.memory.sourceId = sources[randomSource].id;
            }
            else if (this.harvest(Game.getObjectById(this.memory.sourceId)) == ERR_NOT_IN_RANGE) {
	            var harvestSource = Game.getObjectById(this.memory.sourceId);
	            
	            this.moveTo(harvestSource, {noPathFinding: true})

	            // Perform pathfinding only if we have enough CPU
                if(Game.cpu.tickLimit - Game.cpu.getUsed() > 20) {
                    this.moveTo(harvestSource);
                }
                
	            this.say("mv source");
	        }
	        else if(Game.getObjectById(this.memory.sourceId).energy == 0 && Game.getObjectById(this.memory.sourceId).ticksToRegeneration > 20) {
	            this.memory.sourceId = '0';
	        }
	        
	        //Pickup any energy that might be dropped around the creep
            var droppedEnergy = this.pos.findClosestByRange(FIND_DROPPED_ENERGY, {
                filter: (droppedEnergy) => {
                    droppedEnergy.resourceType === RESOURCE_ENERGY &&
                    droppedEnergy.amount >= 100;
                }
            });
            
            
            if (droppedEnergy) {
                if (this.pickup(droppedEnergy) == ERR_NOT_IN_RANGE) {
                    this.moveTo(droppedEnergy, {noPathFinding: true})
                
                    // Perform pathfinding only if we have enough CPU
                    if(Game.cpu.tickLimit - Game.cpu.getUsed() > 20) {
                        this.moveTo(droppedEnergy);
                    }
                }
                else {
                    this.say(droppedEnergy.energy + "nrg")
                }
            }
	        
        }
        
    };
