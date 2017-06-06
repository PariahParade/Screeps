var roleFenceGuard = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        // If we're in the target room, start defense.
        if (creep.room.name == creep.memory.target && !creep.memory.inPosition) {
            
            if (creep.room.name == Game.flags.Scout1.room.name && creep.pos.isEqualTo(Game.flags.Scout1)) {
                creep.memory.inPosition = true;
            }
            else if (creep.room.name == Game.flags.FencePoint2.room.name && creep.pos.isEqualTo(Game.flags.FencePoint2)) {
                creep.memory.inPosition = true;
            }
            
            if (!(creep.memory.inPosition) || creep.memory.inPosition == '') {
                var found = creep.room.lookForAt(LOOK_CREEPS, Game.flags.Scout1);
                //console.log(found);
                if(found.length < 1) {
                    creep.moveTo(Game.flags.Scout1);
                }
                else {
                    found = creep.room.lookForAt(LOOK_CREEPS, Game.flags.Scout2);
                    if (found.length < 1) {
                        creep.moveTo(Game.flags.Scout2);
                    }
                }
            }
        }
        // Move to target room
        else if (creep.room.name != creep.memory.target) {
            var errnum = creep.moveTo(Game.flags[creep.memory.target]);
        }
        else if(creep.memory.inPosition == true) {
            creep.say('\u262E', 1)
        }
	}
};

module.exports = roleFenceGuard;
