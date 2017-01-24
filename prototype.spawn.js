// Body Part Costs: http://support.screeps.com/hc/en-us/articles/203013212-Creep

module.exports = function() {
    StructureSpawn.prototype.createCustomCreep = 
        function(energy, roleName){
            var numberOfParts = Math.floor(energy/250);
            var body = [];
            
            // Three loops to keep all work body parts first, so move dies last when attacked.
            
            if (roleName == "harvester") {
                body.push(WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE);
            }
            else if (roleName == "emergencyHarvester") {
                for (let i = 0; i < numberOfParts; i++) {
                    body.push(WORK, CARRY, MOVE, MOVE);
                }
                roleName = 'harvester';
            }
            else if (roleName == "miner"){
                body.push(WORK, WORK, WORK, WORK, WORK, MOVE);
            }
            else if (roleName == "builder"){
                body.push(WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE);
            }
            else {
                for (let i = 0; i < numberOfParts; i++) {
                    body.push(WORK, CARRY, MOVE, MOVE);
                }
            }
            
            return this.createCreep(body, null, { role: roleName});
        };
    
    StructureSpawn.prototype.createLongDistanceHarvester = 
        function (energy, numberOfWorkParts, home, target, sourceId) {
            var body = [];
            for (let i = 0; i< numberOfWorkParts; i++){
                body.push(WORK);
            }
            
            energy -= 150 * numberOfWorkParts;
            
            var numberOfParts = Math.floor(energy / 100);
            for (let i = 0; i < numberOfParts; i++) {
                body.push(CARRY);
            }
            // Need one move for every carry and work, so move needs doubled up
            for (let i = 0; i < numberOfParts + numberOfWorkParts; i++) {
                body.push   (MOVE);
            }
            
            // Create creep with the body built body
            return this.createCreep(body, undefined, {
               role: 'longDistanceHarvester',
               home: home,
               target: target,
               sourceId: sourceId,
               working: false
            });
            
            
            
            
        };
        
        StructureSpawn.prototype.createTransporter = 
            function (energy) {
                var numberOfParts = Math.floor(energy/150);
                var body = [];
                
                for (let i = 0; i < numberOfParts; i++) {
                    body.push(CARRY);
                    body.push(CARRY);
                    body.push(MOVE);
                }
                
                // Create creep with the built body
                return this.createCreep(body, undefined, {
                   role: 'transporter',
                   working: false
                });
            };
};