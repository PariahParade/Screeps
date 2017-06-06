var roleExtractor = {

    run: function(creep) {
        //console.log(_.sum(creep.carry));
	    if(!(creep.memory.mining) && _.sum(creep.carry) == 0) {
            creep.memory.mining = true;
            creep.say('I mine gud');
	    }
	    if(creep.memory.mining && _.sum(creep.carry) == creep.carryCapacity) {
	        creep.memory.mining = false;
	        creep.say('working');
	    }
	    
	    // Carry haul back before dying. 40 is hardcoded to give enough time;
	    // May need to adjust depending on room. Cached paths will fix this later.
	    if (creep.ticksToLive < 60 && _.sum(creep.carry) > 10) {
            creep.memory.mining = false;
        }
	    
	    
	    if(creep.memory.mining) {
	        //creep.say('gimme');
	        
	        //If the creep doesn't have a node assigned, find an unclaimed node.
	        if(!creep.memory.mineralNode){
	            let nodeTarget = creep.room.find(FIND_MINERALS);
                creep.memory.mineralNode = nodeTarget[0].id;
            }
            else {
                let mineralNode = Game.getObjectById(creep.memory.mineralNode);
                let mineralsLeft = mineralNode.mineralAmount;
                
                if (creep.harvest(mineralNode) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(mineralNode, {reusePath: 10, noPathFinding: true, maxRooms: 1});
                    // Perform pathfinding only if we have enough CPU
                    if(Game.cpu.tickLimit - Game.cpu.getUsed() > 20) {
                        creep.moveTo(mineralNode);
                    }
                }
            }
	    }
	    else {
	        let currentlyCarrying = _.findKey(creep.carry);
	        
	        // Deposit in terminal if it exists, storage if it does not.
	        var depositTarget = creep.room.terminal
	        if (!depositTarget || (depositTarget && _.sum(depositTarget.store) > 250000)) {
	            depositTarget = creep.room.storage
	        }
	        //console.log(depositTarget);
	        if (creep.transfer(depositTarget, currentlyCarrying) == ERR_NOT_IN_RANGE) {
	            creep.moveTo(depositTarget, {reusePath: 10, noPathFinding: true, maxRooms: 1});
                // Perform pathfinding only if we have enough CPU
                if(Game.cpu.tickLimit - Game.cpu.getUsed() > 20) {
                    creep.moveTo(depositTarget);
                }
            }
	    }
	    
	} // End run
};

module.exports = roleExtractor;
