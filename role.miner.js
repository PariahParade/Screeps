var roleMiner = {

    run: function(creep) {

        // If room level is below 3, we have to move stuff back to spawn/ext
        /*
        if (!creep.memory.harvester) {
            if (creep.room.controller.level < 3) {
                creep.memory.harvester = true;
            }
            else {
                creep.memory.harvester = false;
            }
        }
*/
        if(!(creep.memory.mining) && creep.carry.energy == 0) {
            creep.memory.mining = true;
            creep.say('I mine gud');
	    }
	    
        if(creep.memory.mining && creep.memory.harvester && creep.carry.energy == creep.carryCapacity) {
            creep.memory.mining = false;
            //creep.memory.inPosition = false;
            creep.say('Delivery');
        }
	    
        //This will effectively cause another miner to spawn, as the spawn
        //engine totals based on how many of a role have their name as
        //sourceSpawn
        if (creep.ticksToLive <= 60) {
            creep.memory.sourceSpawn = '';
        }
	    
        if(creep.memory.mining) {
            creep.say('mine');
	        
            //If the creep doesn't have a node assigned, find an unclaimed node.
            if(!creep.memory.miningNode){
                var sources = creep.room.find(FIND_SOURCES);
                var check=[];
                // Loop through every source. If the id matches a source that a creep has in memory, filter it out
                sources.forEach(function(srs){
                    var tmp = creep.room.find(FIND_MY_CREEPS, {filter: (s) => s.memory.miningNode == srs.id && s.memory.role == 'miner'})

                    if(tmp == ''){
                        creep.memory.miningNode = srs.id;
                    }
                });
            }
            
            let miningNode = Game.getObjectById(creep.memory.miningNode);
            
            if (creep.harvest(miningNode) == ERR_NOT_IN_RANGE) {
                //console.log(creep.name + " moving to source: " + miningNode);
                creep.moveTo(miningNode);
            }
            else {  
                // Once in range and mining, we should drop off our resources
                // To nearby links or containers.
                //console.log(creep.name + ' ' + _.sum(creep.carry));
                if (_.sum(creep.carry) >= 40) {
                    
                    // Check if we have a link/container memorized
                    if (!creep.memory.dropOffId) {
                        
                        // Find a link/container near us
                        let dropOff = creep.pos.findInRange(FIND_STRUCTURES, 1, {
                           filter: structure => structure.energy < structure.energyCapacity || _.sum(structure.store) < structure.storeCapacity
                        });
                        
                        var links = _.filter(dropOff, s => s.structureType === STRUCTURE_LINK);
                        
                        // If it exists, memorize it. Favor links.
                        if (links.length > 0) {
                            creep.memory.dropOffId = links[0].id;
                        }
                        else if (dropOff.length > 0) {
                            creep.memory.dropOffId = dropOff[0].id;
                        }
                        //No link/container. Don't run this find/check again.
                        else { 
                            creep.memory.dropOffId = 'nothing';
                        }
                    }
                    // We have a link memorized, drop off the resources
                    else {
                        var errnum = creep.transfer(Game.getObjectById(creep.memory.dropOffId), RESOURCE_ENERGY)
                        if (errnum == ERR_FULL) {
                            creep.memory.dropOffId = '';
                        }
                    }
                }
            } //End harvest-in-range
        } // End mining = true
        // We're in the early stages of a room, and the miner needs to bring energy back.
        // Miners are never harvesters. Evaluate whether to delete this
        else { 
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_EXTENSION) && structure.energy < structure.energyCapacity);
                }
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {noPathFinding: true})
                
                    // Perform pathfinding only if we have enough CPU
                    if(Game.cpu.tickLimit - Game.cpu.getUsed() > 20) {
                        creep.moveTo(targets[0]);
                    }
                }
            }
        }
        
	} // End run
};

module.exports = roleMiner;
