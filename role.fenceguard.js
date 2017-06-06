var roleFenceGuard = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        
        
        if (!creep.memory.firstWayPoint) {
            creep.memory.firstWayPoint = true;
        }
        
        if (creep.ticksToLive <= 350) {
            creep.memory.sourceSpawn = '';
        }
        
        // Heal self if needed
        if (creep.hits < creep.hitsMax) {
            creep.heal(creep);
        }
        
        const target = creep.pos.findInRange(FIND_MY_CREEPS, 1, {
            filter: function(object) {
                return object.hits < object.hitsMax;
            }
        });
        
        //  Heal nearby targets if needed
        if (target.length > 0 && creep.heal(target[0] == ERR_NOT_IN_RANGE)) {
            //creep.rangedHeal(target[0]);
        }
        
        // If we're in the target room, start defense.
        if (creep.room.name == creep.memory.target) {
            
            if (creep.room.name == Game.flags.FencePoint1.room.name && creep.pos.isEqualTo(Game.flags.FencePoint1)) {
                creep.memory.inPosition = true;
            }
            else if (creep.room.name == Game.flags.FencePoint2.room.name && creep.pos.isEqualTo(Game.flags.FencePoint2)) {
                creep.memory.inPosition = true;
            }
            
            
            
            if (!(creep.memory.inPosition) || creep.memory.inPosition == '' || creep.memory.inPosition == false) {
                var found = creep.room.lookForAt(LOOK_CREEPS, Game.flags.FencePoint1);
                //console.log(found);
                if(found.length < 1) {
                    creep.moveTo(Game.flags.FencePoint1);
                }
                else {
                    found = creep.room.lookForAt(LOOK_CREEPS, Game.flags.FencePoint2);
                    if (found.length < 1) {
                        creep.moveTo(Game.flags.FencePoint2);
                    }
                    else {
                        found = creep.room.lookForAt(LOOK_CREEPS, Game.flags.FencePoint3);
                        if (found.length < 1) {
                            creep.moveTo(Game.flags.FencePoint3);
                        }
                    }
                }
            }
            
            if (Game.time % 10 == 0){
                creep.memory.inPosition = false;
            }
            
            // Attack nearby creeps
            //const hostile = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
            var targets = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
            
            if (_.size(targets) > 0) { // && hostile.owner.username != 'Source Keeper') {
                //console.log('FENCEGUARD 4 FITE');
                creep.rangedAttack(targets[0]);
                //if (creep.rangedAttack(hostile) == ERR_NOT_IN_RANGE) {
                //    creep.moveTo(hostile, {range: 2, maxRooms:1});
                //}
            }
            if(targets && targets.length > 1) {
                creep.rangedMassAttack();
            }
            
            if (creep.name == 'fenceguard538') {
                creep.moveTo(Game.flags.Test1);
            }
            
            /*
            var targets = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
            if (targets.length > 0) {
                creep.rangedAttack(targets[0]);    
            }
            
            if(targets.length > 1) {
                creep.rangedMassAttack();
            }
            */
            
            
        }
        // Move to target room
        else {
            if (!creep.pos.isEqualTo(Game.flags.E84N33) && creep.memory.firstWayPoint === false) {
                //console.log('fenceguard');
                if (creep.room.name == Game.flags.E84N33.name) {
                    var errnum = creep.moveTo(Game.flags.E84N33, {maxRooms: 1});
                }
                else {
                    var errnum = creep.moveTo(Game.flags.E84N33);    
                }
            }
            else if (creep.pos.isEqualTo(Game.flags.E84N33)) {
                creep.memory.firstWayPoint = true;
            }
            
            if (creep.memory.firstWayPoint === true) {
                var errnum = creep.moveTo(Game.flags[creep.memory.target]);
                //console.log(creep.name + ' ' + errnum);
                creep.say("mov defens");    
            }
            
        }
	}
};

module.exports = roleFenceGuard;
