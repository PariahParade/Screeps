var roleLongDistanceHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
            creep.say('need nrg');
	    }
	    if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.working = true;
	        creep.say('working');
	    }
        
        if(creep.memory.working == true) {
            // Energy is full. If we're home, lets drop off our stuff
            if (creep.room.name == creep.memory.home) {
                var targetStorage = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_STORAGE);
                    }
                });
                if(targetStorage.length > 0) {
                    if(creep.transfer(targetStorage[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targetStorage[0]);
                        creep.say('LD mv ' + targetStorage[0].structureType);
                    }
                }
            }
            // If we're not home, we need to get there!
            else {
                var exit = creep.room.findExitTo(creep.memory.home);
                creep.moveTo(creep.pos.findClosestByRange(exit));
                creep.say("going home");
            }
        }
        // Not working--Need Energy
	    else {
	        if (creep.room.name == creep.memory.target) {
	            //Pickup any energy that might be dropped around the creep
                var droppedEnergy = creep.pos.findInRange(FIND_DROPPED_ENERGY, 1);
                if (droppedEnergy.length) {
                    creep.say(droppedEnergy[0].energy + "nrg")
                    creep.pickup(droppedEnergy[0]);
                }

                // If we don't have a source in our memory, get one.
	            if (!(creep.memory.sourceId) || creep.memory.sourceId == '0') {
	                var sources = creep.room.find(FIND_SOURCES);
	                
	                // Get a random number so that we get sent to a random source.
	                var randomSource = Math.floor(Math.random() * (sources.length));
	                creep.memory.sourceId = sources[randomSource].id;
	            }
	            
	            //var source = creep.room.find(FIND_SOURCES)[creep.memory.sourceId];
    	        if (creep.harvest(Game.getObjectById(creep.memory.sourceId)) == ERR_NOT_IN_RANGE) {
    	            creep.moveTo(Game.getObjectById(creep.memory.sourceId));
    	            creep.say("mv target");
    	        }
	        }
	        else {
	            var exit = creep.room.findExitTo(creep.memory.target);
                creep.moveTo(creep.pos.findClosestByRange(exit));
                creep.say("chg rooms");
	        }
	    }
	}
};

module.exports = roleLongDistanceHarvester;
