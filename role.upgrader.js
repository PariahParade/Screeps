var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.storedContainer = null;
            creep.memory.upgrading = false;
            creep.say('harvesting');
	    }
	    if(!(creep.memory.upgrading) && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.upgrading = true;
	        creep.say('upgrading');
	    }

	    if(creep.memory.upgrading) {
	        var hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS);
            if (hostileCreeps >= 2 && creep.room.name == 'E87N32') {
                creep.room.controller.activateSafeMode();
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
            //console.log("get nrg fail?");
            creep.getEnergy(true, true, false, true);
        }
	}
};

module.exports = roleUpgrader;
