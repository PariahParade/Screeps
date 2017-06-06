var roleLDMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        //This will effectively cause another miner to spawn, as the spawn
        //engine totals based on how many of a role have their name as
        //sourceSpawn
        if (creep.ticksToLive <= 90) {
            creep.memory.sourceSpawn = '';
        }
        
        
        if (creep.room.name == creep.memory.target) {
            //If the creep doesn't have a node assigned, find an unclaimed node.
            if(!creep.memory.miningNode){
                var sources = creep.room.find(FIND_SOURCES);
                var check=[];
                // Loop through every source. If the id matches a source that a creep has in memory, filter it out
                sources.forEach(function(srs){
                    var tmp = creep.room.find(FIND_MY_CREEPS, {filter: (s) => s.memory.miningNode == srs.id && s.memory.role == 'LDMiner'})

                    if(tmp == ''){
                        creep.memory.miningNode = srs.id;
                    }
                });
            }
            else { // Have node memorized
                var miningNode = Game.getObjectById(creep.memory.miningNode);
                var containerSite = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 1);
                
                
                if (miningNode.energy > 0) { 
                    //Harvest time
                    if (creep.harvest(miningNode) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(miningNode);
        	        }
        	        else { // In range of source. Transfer resources to container.
        	            // Check if we have a container memorized
                        if (!creep.memory.dropOffId || creep.memory.dropOffId == '') {
                            
                            // Find a container near the target source
                            let dropOff = creep.pos.findInRange(FIND_STRUCTURES, 1, {
                               filter: structure => structure.structureType == STRUCTURE_CONTAINER
                            });
                            
                            if (dropOff.length > 0) {
                                creep.memory.dropOffId = dropOff[0].id;
                            }
                            else {
                                creep.memory.dropOffId = 'NoContainer';
                            }
                        }
        	        
        	        
        	            if (_.sum(creep.carry) >= 40 && creep.memory.dropOffId && Game.getObjectById(creep.memory.dropOffId) && Game.getObjectById(creep.memory.dropOffId).hits < 150000) {
        	                //console.log(creep.name + ' one');
                            var errNum = creep.repair(Game.getObjectById(creep.memory.dropOffId));
                        }
                        else if (_.sum(creep.carry) >= 40 && creep.memory.dropOffId) {
                            //console.log(creep.name + ' two');
                            var errnum = creep.transfer(Game.getObjectById(creep.memory.dropOffId), RESOURCE_ENERGY)
                        }
                        else if (_.sum(creep.carry) >= 40 && containerSite.length > 0) {
                            //console.log(creep.name + ' three');
                            var errnum = creep.build(containerSite[0]);
                        }
        	        }
                }
                else { 
                    // Repair/Idle time
                    var dropOffContainer = Game.getObjectById(creep.memory.dropOffId);
                    
                    if (dropOffContainer) {
                        if (creep.carry.energy == 0) {
                            creep.withdraw(dropOffContainer, RESOURCE_ENERGY)
                        }
                        
                        if (dropOffContainer.hits < dropOffContainer.hitsMax) {
                            creep.repair(dropOffContainer);
                        }
                    }
                    // Build our own container
                    else {
                        //console.log('test');
                        var containerSite = creep.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 1);
                        var energyPickup = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 1);
                        
                        //console.log(containerSite + ' , ' + energyPickup);
                        
                        if (energyPickup.length > 0) { creep.pickup(energyPickup[0]); }
                        if (containerSite.length > 0) { creep.build(containerSite[0]); }
                    }
                }
            }
        }
        // Not in room. Get there.
        else { 
            var errnum = creep.moveTo(Game.flags[creep.memory.target], {reusePath: 50});
            //console.log(creep.name + ' ' + errnum);
        }
	}
};

module.exports = roleLDMiner;
