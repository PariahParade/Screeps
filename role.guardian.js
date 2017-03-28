var roleGuardian = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var underAttack = false;
        
        var enemies = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (enemies) {
            underAttack = true;
            console.log("UNDER ATTACK");
        }
        
        // If we're in the target room, start defense.
        if (creep.room.name == creep.memory.target) {
            if (creep.pos.isEqualTo(Game.flags.GuardianPoint1)) {
                creep.memory.inPosition = true;
            }
            else if (creep.pos.isEqualTo(Game.flags.GuardianPoint2)) {
                creep.memory.inPosition = true;
            }
            
            if (!(creep.memory.inPosition) || creep.memory.inPosition == '') {
                var found = creep.room.lookForAt(LOOK_CREEPS, Game.flags.GuardianPoint1);
                //console.log(found);
                if(found.length == 0) {
                    creep.moveTo(Game.flags.GuardianPoint1);
                    //console.log(creep.name + ' guardian1');
                }
                else {
                    found = creep.room.lookForAt(LOOK_CREEPS, Game.flags.GuardianPoint2);
                    if (found.length == 0) {
                        creep.moveTo(Game.flags.GuardianPoint2);
                        //console.log(creep.name + ' guardian2');
                    }
                }
                
                // If we're not in position, we're an active defender, hunt shit down.
                let hostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if(hostile) {
                    if(creep.attack(hostile) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(hostile);
                        console.log(creep.name + ' hostile');
                    }
                }
                
                
            }
            else {
                creep.say('defend');
                var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if (target) {
                    creep.attack(target);
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

module.exports = roleGuardian;
