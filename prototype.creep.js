require('constants');

var roles = {
    harvester: require('role.harvester'),
    upgrader: require('role.upgrader'),
    builder: require('role.builder'),
    repairer: require('role.repairer'),
    waller: require('role.waller'),
    longDistanceHarvester: require('role.longDistanceHarvester'),
    claimer: require('role.claimer'),
    miner: require('role.miner'),
    guardian: require('role.guardian'),
    longDistanceBuilder: require('role.longDistanceBuilder'),
    soldier: require('role.soldier'),
    fenceguard: require('role.fenceguard'),
    extractor: require('role.extractor'),
    hauler: require('role.hauler'),
    soldier: require('role.soldier'),
    LDMiner: require('role.LDMiner'),
    LDHauler: require('role.LDHauler'),
    scientist: require('role.scientist'),
    transferer: require('role.transferer'),
    medic: require('role.medic'),
    scout: require('role.scout'),
    SKGuard: require('role.SKGuard')
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


Creep.prototype.depositAnything = function(intoTerminal = true) {
    let currentlyCarrying = _.findKey(this.carry);
	        
    // Deposit in terminal if it exists, storage if it does not.
    var depositTarget = this.room.terminal
    if (!depositTarget || depositTarget.store[currentlyCarrying] >= TERMINAL_RESOURCE_MAX) {
        depositTarget = this.room.storage
    }

    if (this.transfer(depositTarget, currentlyCarrying) == ERR_NOT_IN_RANGE) {
        this.moveTo(depositTarget, {reusePath: 10, noPathFinding: true, maxRooms: 1});
        // Perform pathfinding only if we have enough CPU
        if(Game.cpu.tickLimit - Game.cpu.getUsed() > 20) {
            this.moveTo(depositTarget);
        }
    }
 }
 
Creep.prototype.findMiningNode = function(currentRoom, roleName) {
    if (currentRoom == undefined) {
        return;
    }
    var sources = currentRoom.find(FIND_SOURCES);
    var miningNodeId;
    // Loop through every source. If the id matches a source that a creep has in memory, filter it out
    sources.forEach(function(srs){
        var tmp = currentRoom.find(FIND_MY_CREEPS, {filter: (s) => s.memory.miningNode == srs.id && s.memory.role == roleName})

        if(tmp == ''){
            miningNodeId = srs.id;
        }
    });
    
    return miningNodeId;
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
                	//this.say("mv link");
                }
            }
        }
        
        if (useStorage === true) {
            if (this.room.storage){
                //console.log(this.room.name + ' ' + this.room.storage.store[RESOURCE_ENERGY]);
                if (this.room.storage.store[RESOURCE_ENERGY] >= (this.carryCapacity - _.sum(this.carry))) {
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
        
        if (useContainer === true) {
            if (!this.memory.storedContainer || this.memory.storedContainer == '') {
                let containers = this.room.find(FIND_STRUCTURES, {
                    filter: structure => structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 20
                });
                
                //container.sort(function (a,b) {return (b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY])});
                let fullestContainer = _.max(containers, 'store.energy');
                
                //console.log(this.name + ' ' + fullestContainer);
                
                if (fullestContainer){
                    this.memory.storedContainer = fullestContainer.id;                    
                }
                else {
                    //Logic fall-through: creep will harvest
                }
            } 
            else {
                let storedContainer = Game.getObjectById(this.memory.storedContainer);
                
                if (this.withdraw(storedContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    ableToHarvest = false;
                    this.moveTo(storedContainer, {noPathFinding: true});
                    // Perform pathfinding only if we have enough CPU
                    if(Game.cpu.tickLimit - Game.cpu.getUsed() > 20) {
                        this.moveTo(storedContainer);
                    }
                    //this.say("mv ctnr");
                }
                if (!storedContainer) {
                    this.memory.storedContainer = '';
                }
                // If this container is empty, memorize a new one
                if (storedContainer && storedContainer.store[RESOURCE_ENERGY] < 40) {
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
                
	            this.say("hrvst");
	        }
	        else if(Game.getObjectById(this.memory.sourceId) && Game.getObjectById(this.memory.sourceId).energy == 0 && Game.getObjectById(this.memory.sourceId).ticksToRegeneration > 20) {
	            this.memory.sourceId = '0';
	        }
	        
	        //Pickup any resources that might be dropped around the creep
            
	        
        }
        
        
        var droppedResource = this.room.find(FIND_DROPPED_RESOURCES);
        if (droppedResource.length > 0) { //&& droppedResource.amount >= this.carryCapacity - _.sum(this.carry)
            if (this.pickup(droppedResource[0]) == ERR_NOT_IN_RANGE) {
                this.moveTo(droppedResource[0], {noPathFinding: true})
            
                // Perform pathfinding only if we have enough CPU
                if(Game.cpu.tickLimit - Game.cpu.getUsed() > 20) {
                    this.moveTo(droppedResource[0]);
                }
            }
        }
        
        let currentlyCarrying = _.findKey(this.carry);
        if (currentlyCarrying != RESOURCE_ENERGY) {
            this.depositAnything();
        }
        
        
    
    };
