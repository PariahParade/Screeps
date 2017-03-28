StructureTower.prototype.defendRoom =
    function() {
        try {
            var closestHostile = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            var hostiles = this.room.find(FIND_HOSTILE_CREEPS);
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
                
                // Slow down rate that towers repair things.
                if(Game.time % 10 == 0){
                   var repairTargets = this.room.find(FIND_STRUCTURES, {
                        filter: function(object) {
                            return object.hits < object.hitsMax
                                && object.hitsMax - object.hits > 1000
                                && object.hits < 1000000;
                        }
                    });
                    repairTargets.sort(function (a,b) {return (a.hits - b.hits)});
                    if (repairTargets.length > 0 && this.energy > 400) {
                        this.repair(repairTargets[0]);
                    } 
                }
            }
        }
        catch (err) {
            console.log("Error in prototype.tower.defendRoom; errorMsg: "  + err.message);
        }
    }