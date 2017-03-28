var roleScientist = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.working && _.sum(creep.carry) == 0) {
            creep.memory.working = false;
            creep.say('Need mins');
	    }
	    if(!creep.memory.working && _.sum(creep.carry) == creep.carryCapacity) {
	        creep.memory.working = true;
	        creep.say('Science!', 1);
	    }
	    
	    // Carry haul back before dying. 60 is hardcoded to give enough time;
	    // May need to adjust depending on room. Cached paths will fix this later.
	    //if (creep.ticksToLive < 60 && _.sum(creep.carry) > 10) {
        //    creep.memory.mining = false;
        //}

        if(creep.memory.working) {
            // We have minerals. We need to get back home (maybe) and drop them off
            
            // Hardcode BAD. Fix later.
            if (creep.room.name == 'E87N32') {
                // Find the lab with our mineral type
                
                // Deposit minerals
            }
            else {
                var errnum = creep.moveTo(Game.flags['E87N32'], {reusePath: 15, ignoreCreeps: true});
                //console.log(creep.name + ' ' + errnum);
            }
            
            /*
            var labs = creep.room.find(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_LAB) && structure.energy < (structure.energyCapacity / 2)
                    );
                }
            });
            
            if (towerTargets.length > 0) {
                if (creep.transfer(towerTargets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(towerTargets[0]);
                    creep.say('fill twr');
                }
            }
            else {
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return ((structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_EXTENSION) && structure.energy < structure.energyCapacity);
                    }
                });
                if (targets.length > 0) {
                    if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0]);
                        //console.log(targets[0]);
                        creep.say('fill nrg');
                    }
                }
                else if (creep.room.storage){
                    if (creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.storage);
                        //console.log(targets[0]);
                        creep.say('fill strg');
                    }
                }
            }
*/
	    }
	    else {
	        // Need to gather minerals.
            // Find all the labs that are not full
            var labs = creep.room.find(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_LAB) && structure.mineralAmount < structure.mineralCapacity
                    );
                }
            });
            
            // Find the one that is the least full.
            labs.sort(function(a, b){return a.mineralAmount - b.mineralAmount});
            
            // Figure out its mineral type.
            var labMineral = labs[0].mineralType;
            // If the lab is empty, it won't have a mineral type. Look at the flag.
            if (!labMineral) {
                let found = creep.room.lookForAt(LOOK_FLAGS, labs[0]);
                labMineral = found[0].name;
            }
            
            // Find this mineral
            for (let searchRoom in Game.rooms) {
                let targetRoom = Game.rooms[searchRoom];
                
                if (targetRoom.storage[labMineral] > 0) {
                    creep.memory.roomWithStorage = targetRoom.roomName;
                }
                
            }
            
            var targetRoom = Game.rooms[creep.memory.roomWithStorage];
            
            // If we're not there, go there.
            if (targetRoom && creep.pos.roomName != targetRoom.name) {
                creep.moveTo(targetRoom)
            }
            // If we're there, go to storage and withdraw.
            else if (creep.pos.roomName == targetRoom.name) {
                if (creep.withdraw(targetRoom.storage, labMineral) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.rooms[targetRoom].storage)
            }
	    }
	}
};

module.exports = roleScientist;
