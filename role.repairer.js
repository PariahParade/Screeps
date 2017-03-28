var roleBuilder = require('role.builder');

var roleRepairer = {

    /** @param {Creep} creep **/
    run: function(creep) {

	    if(creep.memory.repairing && creep.carry.energy == 0) {
            creep.memory.repairing = false;
            creep.memory.repairTarget = '';
            creep.say('harvesting');
	    }
	    if(!creep.memory.repairing && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.repairing = true;
	        creep.say('repairing');
	    }

	    if(creep.memory.repairing) {
	        if (!creep.memory.repairTarget || creep.memory.repairTarget == '') {
	            // || Game.getObjectById(creep.memory.repairTarget).hits == Game.getObjectById(creep.memory.repairTarget).hitsMax
	            
	            var damagedStructures = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => structure.hits < structure.hitsMax //&&
                        //structure.hits < 1500000 //&& 
                        //structure.structureType != STRUCTURE_WALL &&
                        //structure.structureType != STRUCTURE_RAMPART
                });
                
                var priorityRepairs = _.filter(damagedStructures, s => s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART);
                var wallsAndRamparts = _.filter(damagedStructures, s => s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART);
                
                //console.log(JSON.stringify(priorityRepairs));
                
                if (priorityRepairs.length > 0) {
                    priorityRepairs.sort(function (a,b) {return ((a.hits/a.hitsMax) - (b.hits/b.hitsMax))});
                    creep.memory.repairTarget = priorityRepairs[0].id;
                }
                else if (wallsAndRamparts.length > 0) {
                    wallsAndRamparts.sort(function (a,b) {return ((a.hits/a.hitsMax) - (b.hits/b.hitsMax))});
                    creep.memory.repairTarget = wallsAndRamparts[0].id;
                }
                else { // nothing to repair
                    creep.memory.repairTarget = '';
                }
	        }
	        else {
	            let repairTarget = Game.getObjectById(creep.memory.repairTarget);
	            if (creep.repair(repairTarget) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(repairTarget, {maxRooms: 1});
                    creep.say('repairing');
                }
                else {
                    if (repairTarget.hits == repairTarget.hitsMax) {
                        creep.memory.repairTarget = '';
                    }
                }
	        }
	        
	        // Nothing to repair. Build if you can. Build falls thru to upgrader.
            if (creep.memory.repairTarget == '') {
                roleBuilder.run(creep);
            }
	    }
	    else {
	        creep.getEnergy(true, true, true, false);
	    }
	}
};

module.exports = roleRepairer;
