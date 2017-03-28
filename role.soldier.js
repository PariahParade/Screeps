var roleSoldier = {

    /** @param {Creep} creep **/
    run: function(creep) {
       
        if (creep.room.name == creep.memory.target) {
            let hostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            
            if(hostile) {
                if(creep.attack(hostile) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(hostile);
                    console.log(creep.name + ' killing ' + hostile.name);
                }
            }
            else {
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_EXTENSION);
                    }
                });
                
                if (targets.length > 0) {
                    if(creep.attack(targets[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0]);
                        console.log(creep.name + ' attacking ' + targets[0].name);
                    }
                }
            }
        }
        // Move to target room
        else {
            var errnum = creep.moveTo(Game.flags[creep.memory.target]);
            //console.log(creep.name + ' ' + errnum);
        }
	}
};

module.exports = roleSoldier;
