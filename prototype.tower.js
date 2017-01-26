StructureTower.prototype.defendRoom =
    function() {
        try {
            var closestHostile = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (closestHostile) {
                this.attack(closestHostile);
            }
            else {
                var closestDamagedStructure = this.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => 
                        ((structure.hits + 200) < structure.hitsMax) 
                        && structure.structureType != STRUCTURE_WALL
                        && structure.structureType != STRUCTURE_RAMPART
                });
                if(closestDamagedStructure) {
                    this.repair(closestDamagedStructure)
                    console.log("Tower repaired " + closestDamagedStructure.structureType + " at " + closestDamagedStructure.pos);
                }    
            }
        }
        catch (err) {
            console.log("Error in prototype.tower.defendRoom; errorMsg: "  + err.message);
        }
    }