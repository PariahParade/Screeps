var roleTransferer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
	    if(!(creep.memory.fullCarry) && _.sum(creep.carry) == creep.carryCapacity) {
	        creep.memory.fullCarry = true;
	    }
	    
	    // Get to work if about to die
        if (creep.memory.fullCarry && _.sum(creep.carry) == 0) {
            creep.memory.fullCarry = false;
        }
	    
        if(creep.memory.fullCarry) {
            let currentlyCarrying = _.findKey(creep.carry);
            
            if (creep.room.terminal && creep.transfer(creep.room.terminal, currentlyCarrying) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.terminal, {noPathFinding: true});
                // Perform pathfinding only if we have enough CPU
                if(Game.cpu.tickLimit - Game.cpu.getUsed() > 20) {
                    creep.moveTo(creep.room.terminal);
                }
                creep.say('fill term');
            }
	    }
	    // Need to pick crap from storage
	    else {
	        if (creep.room.storage.store.U > 0) {
	            var hasU = true;
	        }
	        
	        var returnCode = hasU  
                    ? creep.withdraw(creep.room.storage, RESOURCE_UTRIUM) 
                    : creep.withdraw(creep.room.storage, RESOURCE_ENERGY);

	        if (returnCode == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.storage);
            }
	    }
	}
};

module.exports = roleTransferer;
