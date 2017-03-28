var roleFenceGuard = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        // If we're in the target room, start defense.
        if (creep.room.name == creep.memory.target) {
            
            if (creep.pos.isEqualTo(Game.flags.FencePoint1)) {
                creep.memory.inPosition = true;
            }
            else if (creep.pos.isEqualTo(Game.flags.FencePoint2)) {
                creep.memory.inPosition = true;
            }
            
            if (!(creep.memory.inPosition) || creep.memory.inPosition == '') {
                var found = creep.room.lookForAt(LOOK_CREEPS, Game.flags.FencePoint1);
                //console.log(found);
                if(found.length == 0) {
                    creep.moveTo(Game.flags.FencePoint1);
                }
                else {
                    found = creep.room.lookForAt(LOOK_CREEPS, Game.flags.FencePoint2);
                    if (found.length == 0) {
                        creep.moveTo(Game.flags.FencePoint2);
                    }
                }
            }
            
            var targets = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
            if (targets.length > 0) {
                creep.rangedAttack(targets[0]);    
            }
            
            if(targets.length > 1) {
                creep.rangedMassAttack();
            }
            
            
        }
        // Move to target room
        else {
            var errnum = creep.moveTo(Game.flags[creep.memory.target]);
            //console.log(creep.name + ' ' + errnum);
            creep.say("mov defens");
        }
	}
};

module.exports = roleFenceGuard;
