StructureTower.prototype.defendRoom =
    function() {
        try {
            var closestHostile = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            //var hostiles = this.room.find(FIND_HOSTILE_CREEPS);
            if (closestHostile) {
                this.attack(closestHostile);
            }
            else {
                var closestInjuredCreep = this.pos.findClosestByRange(FIND_MY_CREEPS, {
                    filter: (creep) => creep.hits < creep.hitsMax
                });
                if (closestInjuredCreep){
                    this.heal(closestInjuredCreep);
                }
                
                var towerDelay = true;
                
                //if (this.room.name == 'E83N34') {
                //    towerDelay = false;
                //}
                
                // Slow down rate that towers repair things.
                if (towerDelay == false || Game.time % 5 === 0){
                   var repairTargets = this.room.find(FIND_STRUCTURES, {
                        filter: function(object) {
                            return object.hits < object.hitsMax
                                && object.hitsMax - object.hits > 1000
                                && object.hits < 4000000;
                        }
                    });
                    
                    let targetToRepair = _.min(repairTargets, 'hits')
                    
                    if (targetToRepair && this.energy > 400) {
                        this.repair(targetToRepair);
                    } 
                }
            }
        }
        catch (err) {
            console.log("Error in prototype.tower.defendRoom; errorMsg: "  + err.message);
        }
    }