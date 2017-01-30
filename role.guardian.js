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
            if (!underAttack) {
                creep.moveTo(Game.flags.GuardianPoint);
                creep.say("Defending", 1);
            }
            // We're under attack! Attack closest dudefella.
            else {
                creep.say("Kill tgt", 1) 
                creep.moveTo(enemies);
                creep.attack(enemies);    
            }
        }
        // Move to target room
        else {
            var exit = creep.room.findExitTo(creep.memory.target);
            creep.moveTo(creep.pos.findClosestByRange(exit));
            creep.say("mov defens");
        }
	}
};

module.exports = roleGuardian;
