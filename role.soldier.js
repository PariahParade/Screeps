var roleSoldier = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        // TO BOOST OR NOT TO BOOST, THAT IS THE QUESTION
        // False to boost! True to be a lamer!
        if (!creep.memory.boosted) {
            creep.memory.boosted = true;
        }
        
        // "Ready" trigger to rally outside of a room.
        // True to ignore.
        if (!creep.memory.ready) {
            creep.memory.ready = true;
        }
        
        // Respawn self in time.
        if (creep.ticksToLive <= 400) {
            creep.memory.spawnRoom = '';
        }
        
        // Heal self if needed
        if (creep.hits < creep.hitsMax) {
            creep.heal(creep);
        }
        
        
        // Get boosted if flag is set
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
            var errnum = creep.moveTo(Game.flags.Boost_Spot_1);
        }
        
        // Check to see if we have at least one ally before heading in.
        //var allies = creep.pos.findInRange(FIND_MY_CREEPS, 2);
        //console.log('allies: ' + allies.length);
        
        // Move to rally point
        if (creep.memory.boosted === true && creep.memory.ready == false && creep.pos.isEqualTo(Game.flags.RallyPoint_1)) { //&& allies.length >= 3
            creep.memory.ready = true;
        }
        else if (creep.memory.boosted === true && creep.memory.ready == false) {
            var errnum = creep.moveTo(Game.flags.RallyPoint_1, {reusePath: 0});
        }
        
        // Boosted and at rally point. Lets do this.
        if (creep.memory.boosted == true && creep.memory.ready === true){// && creep.hits == creep.hitsMax) {
            if (creep.room.name != 'E83N34'){// && creep.hits == creep.hitsMax) {
                creep.moveTo(Game.flags.Attack_1, {reusePath: 1});
            }
            else if (creep.room.name == 'E83N34') {
                //creep.moveTo(Game.flags.RallyPoint_1);
                
                //var targetWall = Game.getObjectById('590cc9b84cbf7d1a55062c80'); //590cd2af69f804b078a5bddf
                //var targetTower = Game.getObjectById('590be7a3145e171d2414469c'); //590cc942035bebbc39145854
                const target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                //const targets = creep.pos.findInRange(FIND_HOSTILE_CREEPS,1);
                
                var targetWall = false;
                var targetTower = false;
                //var target = false;
                
                //console.log(target.length);
                
                if (targetWall) {
                    var returnCode = creep.attack(targetWall);
                    if (returnCode == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targetWall, {reusePath: 0, maxRooms:1});
                    } 
                }
                if (targetTower) {
                    //console.log('duh');
                    var returnCode = creep.attack(targetTower);
                    if (returnCode == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targetTower, {reusePath: 0, range: 1, maxRooms:1});
                    } 
                }
                else if (_.size(target) > 0) {
                    var returnCode = creep.attack(target);
                    if (returnCode == ERR_NOT_IN_RANGE && target.pos.y == 1) {
                        creep.moveTo(target, {reusePath: 0, maxRooms:1});
                    }    
                }
                //else if(target.length > 0) {
                //    var returnCode = creep.attack(target);
                //}
                else {
                    creep.moveTo(Game.flags.Attack_1, {reusePath: 0});
                }
                
                
                
                // If really injured return to rally point.
                //if (creep.room.name != 'E83N33' && creep.hits <= creep.hitsMax * 0.90) {
                //    creep.moveTo(Game.flags.RallyPoint_1);
                //}
                
                
            }
        }
        
        
	},
	
	moveToRallyPoint: function(creep) {
	    
	},
	
	sourceKeeperCleaner: function(creep) {
	    
	},
	
	roomAttacker: function(creep) {
	    
	}
	
};

module.exports = roleSoldier;
