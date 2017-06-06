var roleGuardian = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        // Respawn self in time for new creep to take over.
        if (creep.ticksToLive <= 150) {
            creep.memory.spawnRoom = '';
        }
        
        // Heal self if needed
        //if (creep.getActiveBodyparts(HEAL) > 0 && creep.hits < creep.hitsMax) {
        //    creep.heal(creep);
        //}

        // If we're in the target room, start defense.
        if (creep.room.name == creep.memory.target) {
            var guardianFlag = _.filter(Game.flags, (flag) => flag.room && flag.room.name == creep.room.name && _.startsWith(flag.name, 'Guardian'));
            //console.log('guardian: ' + guardianFlag);
            
            var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            //console.log(target);
            if (!target && !creep.pos.isEqualTo(guardianFlag[0])) {
                //if (creep.name == 'AttackCreep8') { console.log('test'); }
                creep.moveTo(guardianFlag[0], {maxRooms: 1});
            }
            else if (target) {
                var returnCode = creep.attack(target);
                //if (creep.name == 'AttackCreep8') { console.log(returnCode); }
                if (returnCode == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {maxRooms:1});
                    if (creep.getActiveBodyparts(RANGED_ATTACK) > 0) { creep.rangedAttack(target); }
                    if (creep.getActiveBodyparts(HEAL) > 0) { creep.heal(creep); }
                }
                else { // In range, but fire lasers as well!
                    creep.rangedAttack(target);
                }
            }
            //else if (creep.getActiveBodyparts(HEAL) > 0 && creep.hits < creep.hitsMax){
                // Heal self if needed
            //    creep.heal(creep);
            //}
        }
        // Move to target room
        else {
            var errnum = creep.moveTo(Game.flags[creep.memory.target]);
        }
	}
};

module.exports = roleGuardian;
