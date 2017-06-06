var roleMedic = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if (!creep.memory.firstWayPoint) {
            creep.memory.firstWayPoint = false;
        }
        
        if (creep.ticksToLive <= 350) {
            creep.memory.spawnRoom = '';
        }
        
        if (!creep.memory.boosted) {
            creep.memory.boosted = true;
        }
        
        // Heal self if needed
        if (creep.hits < creep.hitsMax) {
            creep.heal(creep);
        }
        
        //  Heal nearby targets if needed
        
        
        const healer = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
            filter: function(object) {
                return object.hits < object.hitsMax;
            }
        });
        if(healer) {
            if(creep.heal(healer) == ERR_NOT_IN_RANGE) {
                creep.moveTo(healer);
                creep.rangedHeal(healer);
            }
        }
        
        
        
        // Get boosted
        if (creep.memory.boosted === false && creep.pos.isEqualTo(Game.flags.Boost_Spot_1)) {
            const labs = creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {
                filter: function(object) {
                    return object.structureType == STRUCTURE_LAB;
                }
            });
            
            for (var key in labs) {
                var lab = labs[key];
                if (lab.mineralType != RESOURCE_UTRIUM_ACID) {
                    lab.boostCreep(creep);
                }
            }
            
            creep.memory.boosted = true;
            
        }
        else if (creep.memory.boosted === false) {
            var errnum = creep.moveTo(Game.flags.Boost_Spot_1, {reusePath: 25});
        }
        
        
        if (!creep.pos.isEqualTo(Game.flags.E84N34) && creep.memory.firstWayPoint === false) {
            if (creep.room.name == Game.flags.E84N34.name) {
                var errnum = creep.moveTo(Game.flags.E84N34, {maxRooms: 1});
            }
            else {
                var errnum = creep.moveTo(Game.flags.E84N34);    
            }
        }
        else if (creep.pos.isEqualTo(Game.flags.E84N34)) {
            creep.memory.firstWayPoint = true;
        }
        
        if (creep.memory.firstWayPoint === true) {
            let soldiers = _.filter(Game.creeps, (c) => c.memory.role == 'soldier');
            var errnum = creep.moveTo(soldiers[0]);
        }

        /*
        // Move to soldier
        if (creep.memory.boosted === true) {
            
        }
        else if (_.size(soldiers) == 0 && creep.memory.boosted == true) {
            console.log('medic');
            creep.moveTo(Game.flags.RallyPoint_1);
        }
        */
       

	}
};

module.exports = roleMedic;
