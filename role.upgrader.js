var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if(creep.memory.upgrading && _.sum(creep.carry) == 0) {
            creep.memory.storedContainer = '';
            creep.memory.upgrading = false;
            creep.say('harvesting');
	    }
	    if(!(creep.memory.upgrading) && _.sum(creep.carry) == creep.carryCapacity) {
	        creep.memory.upgrading = true;
	        creep.say('upgrading');
	    }

	    if(creep.memory.upgrading) {
	        var hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS);
            if (hostileCreeps >= 1 && creep.room.name == 'E81N33') {
                creep.room.controller.activateSafeMode();
            }
	        
	        let currentlyCarrying = _.findKey(creep.carry);
            if (currentlyCarrying != RESOURCE_ENERGY) {
                creep.depositAnything();
                return;
            }
	        
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {maxRooms: 1});
                
            }
            else {
                let positionFlag = _.filter(Game.flags, flag => _.startsWith(flag.name, 'Upgrade') && flag.pos.roomName == creep.room.name );
                //console.log(creep.name + ' ' + positionFlag);
                if (positionFlag.length > 0 && !(creep.pos.isEqualTo(positionFlag[0]))) {
                    creep.moveTo(positionFlag[0]);
                }
                
                //if (creep.room.name == 'E87N32') {
                //    creep.moveTo(Game.flags.UpgradeHere);    
                //}
            }
        }
        else {
            var containerID = _.pluck(_.filter(creep.room.memory.containers, function(n) {return n.upgraderContainer == true;}), 'id');
            
            var containers = _.map(containerID, Game.getObjectById);
            var fullestContainer = _.max(containers, 'store.energy');
            
            //if (creep.room.name == 'E87N32') { console.log(ex(fullestContainer)); }
            //console.log(creep.room.name + ' ' + _.size(fullestContainer));
            
            //var upgraderContainer = Game.getObjectById(containerID);
            
            if (_.size(fullestContainer) > 0 && fullestContainer.store.energy >= 100) {
                //console.log(upgraderContainer.store.energy);
                //console.log(creep.name + ' ' + upgraderContainer);
                var returnCode = creep.withdraw(fullestContainer, RESOURCE_ENERGY);
                if (returnCode == ERR_NOT_IN_RANGE) {
                    creep.moveTo(fullestContainer);
                }
            }
            else {
                if (creep.room.storage && creep.room.storage.store.energy > 500000) {
                    creep.getEnergy(false, true, false, true);
                }
                if (creep.room.controller.level < 4) {
                    creep.getEnergy(true, true, true, true);
                }
                else {
                   creep.getEnergy(true, true, false, true); 
                }
            }
        }
	}
};

module.exports = roleUpgrader;
