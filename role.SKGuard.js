require('constants');

var roleSKGuard = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        // --FLAGS/GLOBAL ACTIONS----------------------------------------------------------------------
        
        if (!creep.memory.skipBoosting) {
            creep.memory.skipBoosting = true;
        }
        
        // Respawn self in time. Added 80 for a generous path time.
        if (creep.ticksToLive <= (creep.body.length * 3) + 80) {
            creep.memory.spawnRoom = '';
        }
        
        // Heal self if needed
        if (creep.hits < creep.hitsMax) {
            creep.heal(creep);
        }
        
        
        // --SETUP-------------------------------------------------------------------------------------
        
        if (!creep.memory.healerTarget) {
            creep.memory.healerTarget = '';
        }
        
        // If skipBoost is not set, boost up!
        if (creep.memory.skipBoosting === false) {
            this.getBoosted(creep);
        }
        
        
        // --MAIN--------------------------------------------------------------------------------------
        
        // In room and ready. 
        if (creep.memory.skipBoosting == true && creep.room.name == creep.memory.target) {
            // Check for SK
            var SKInRange = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 5, {
                filter: (c) => c.owner && c.owner.username == 'Source Keeper'
            });
            
            // Check for Invaders
            var invasionCreeps = creep.room.find(FIND_HOSTILE_CREEPS, {
                filter: (c) => c.owner && c.owner.username.toLowerCase == 'invader'
            });
            
            console.log(creep.name + ' ' + _.size(SKInRange) + ' ' + _.size(invasionCreeps));
            
            // Normal mining
            if (_.size(SKInRange) == 0 && _.size(invasionCreeps) == 0) { //No SK or invaders
                this.harvestEnergy(creep);
            }
            
            // If SK in range & no invaders
            if (_.size(SKInRange) > 0 && _.size(invasionCreeps) == 0) {
                this.killSourceKeepers(creep, SKInRange[0]);
            }
            
            // If Invaders
            if (invasionCreeps) {
               // this.killInvaders(creep, invasionCreeps);
            }
            
        }
        // Not in room. Get there. 
        else if (creep.memory.skipBoosting == true && creep.room.name != creep.memory.target) {
            var errnum = creep.moveTo(Game.flags[creep.memory.target], {reusePath: 20});
        }
	},
	
	
	// Work in progress. I only have one boost room for now.
	getBoosted: function(creep) {
	    if (creep.pos.isEqualTo(Game.flags.Boost_Spot_1)) {
	        const labs = creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {
                filter: function(object) {
                    return object.structureType == STRUCTURE_LAB;
                }
            });
            
            // Boost every single part. Mmmmm tasty.
            for (var key in labs) {
                var lab = labs[key];
                if (lab.mineralType != RESOURCE_UTRIUM_ACID) {
                    lab.boostCreep(creep);
                }
            }    
            
            creep.memory.skipBoosting = true;
	    }
	    else {
	        var errnum = creep.moveTo(Game.flags.Boost_Spot_1);
	    }
	    
        
	},
	
	// NYI. May not need with how beefy these guys are.
	moveToRallyPoint: function(creep) {
	    
	},
	
	harvestEnergy: function(creep) {
	    if(!creep.memory.SKSource){
	        var sources = Game.flags[creep.memory.remoteFlag].pos.findInRange(FIND_SOURCES, 3);
	        creep.memory.SKSource = sources[0].id;
            //creep.memory.SKSource = creep.getMiningNode(creep.room.name, 'SKGuard');
        }
        else { // Have node memorized
            var SKSource = Game.getObjectById(creep.memory.SKSource);
            
            // Check if we have a container memorized
            if (!creep.memory.dropOffId || creep.memory.dropOffId == '') {
                
                // Find a container near the target source
                let dropOff = SKSource.pos.findInRange(FIND_STRUCTURES, 1, {
                   filter: structure => structure.structureType == STRUCTURE_CONTAINER
                });
                
                if (dropOff.length > 0) {
                    creep.memory.dropOffId = dropOff[0].id;
                }
                else {
                    creep.memory.dropOffId = 'NoContainer';
                }
            }
            
            var containerSite = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 1);
            
            
            if (SKSource.energy > 0) { 
                //Harvest time
                if (creep.harvest(SKSource) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(SKSource);
    	        }
    	        else { // In range of source. Transfer resources to container.
    	            creep.say(UNICODE_PICK, 1);
    	            if (_.sum(creep.carry) >= 40 && creep.memory.dropOffId && Game.getObjectById(creep.memory.dropOffId) && Game.getObjectById(creep.memory.dropOffId).hits < 150000) {
    	                //console.log(creep.name + ' one');
                        var errNum = creep.repair(Game.getObjectById(creep.memory.dropOffId));
                    }
                    else if (_.sum(creep.carry) >= 40 && creep.memory.dropOffId) {
                        //console.log(creep.name + ' two');
                        var errnum = creep.transfer(Game.getObjectById(creep.memory.dropOffId), RESOURCE_ENERGY)
                    }
                    else if (_.sum(creep.carry) >= 40 && containerSite.length > 0) {
                        //console.log(creep.name + ' three');
                        var errnum = creep.build(containerSite[0]);
                    }
    	        }
            }
            else { 
                // Repair/Idle time
                creep.say(UNICODE_BUILDING, 1);
                
                var dropOffContainer = Game.getObjectById(creep.memory.dropOffId);
                
                if (dropOffContainer) {
                    if (creep.carry.energy == 0) {
                        creep.withdraw(dropOffContainer, RESOURCE_ENERGY)
                    }
                    
                    if (dropOffContainer.hits < dropOffContainer.hitsMax) {
                        creep.repair(dropOffContainer);
                    }
                }
                // Build our own container
                else {
                    //console.log('test');
                    var containerSite = creep.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 1);
                    var energyPickup = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 1);
                    
                    //console.log(containerSite + ' , ' + energyPickup);
                    
                    if (energyPickup.length > 0) { creep.pickup(energyPickup[0]); }
                    if (containerSite.length > 0) { creep.build(containerSite[0]); }
                }
            }
        }
	},
	
	killSourceKeepers: function(creep, sourceKeeper) {
	    creep.say(UNICODE_SWORDS, 1);
	    
	    //Move to max range of SK and fire
	    creep.moveTo(sourceKeeper, {range: 3});
	    var returnCode = creep.rangedAttack(sourceKeeper);
	    //console.log(returnCode);
	    creep.heal(creep);
	    
	    // If in melee range of creep, move back to flag
	    if (creep.pos.getRangeTo(sourceKeeper) <= 1) {
	        creep.moveTo(Game.flags[creep.memory.remoteFlag]);
	    }
	    
	},
	
	killInvaders: function(creep, invasionCreeps) {
        creep.say(UNICODE_SWORDS, 1);
	    
        // If our healer memory is stale, refresh it.
        if (creep.memory.healerTarget == '' || !Game.getObjectById(creep.memory.healerTarget)){
            var healerInvader = _.first(_.filter(invasionCreeps, h => h.getActiveBodyparts(HEAL) > 0 ));
            console.log(creep.name, healerInvader);
            if (healerInvader){
                creep.memory.healerTarget = healerInvader.id;        
            }
        }
	    
        var healerInvader = Game.getObjectById(creep.memory.healerTarget);
	    
        // If there is a healer, get in his face and AE attack.
        if (healerInvader) {
            creep.moveTo(healerInvader, {range: 1});
            creep.rangedMassAttack();
        }
        else if (!healerInvader) {
            // Laser one of the other invaders.
            var attackTarget = _.first(invasionCreeps);
            
            var returnCode = creep.rangedAttack(attackTarget);
            if (returnCode == ERR_NOT_IN_RANGE) {
                creep.moveTo(attackTarget, {range: 3});
            }
        }	        
	    
        // Heal self if needed
        if (creep.hits < creep.hitsMax) {
            creep.heal(creep);
        }
	}
	
};

module.exports = roleSKGuard;
