var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.storedContainer = null;
            creep.memory.upgrading = false;
            creep.say('harvesting');
            //console.log(creep.name + " is harvesting");
	    }
	    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.upgrading = true;
	        creep.say('upgrading');
	    }

	    if(creep.memory.upgrading) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
        else {
            //console.log("get nrg fail?");
            creep.getEnergy(true, true, false);
        }
	}
};

module.exports = roleUpgrader;
