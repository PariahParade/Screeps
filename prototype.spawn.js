// Body Part Costs: http://support.screeps.com/hc/en-us/articles/203013212-Creep

/*
var roleMinimums = {
    harvester: 3,
    builder: 3,
    repairers: 1,
    wallers: 2,
    upgraders: 8,
    miners: 2,
    longDistanceHarvesters: 2,
    scouts: 1,
    claimers: 1
}
*/

/**
 * Creates a body plan array given a set of parameters.
 * @param {number} energy Amount of energy to use to create body plan
 * @param {number} numberOfWorkParts How many WORK parts the creeps hould have
 *
 * @return {string[]} Array of strings representing body plan
 */
function getBalancedCreepBodyPlan(energy, numberOfWorkParts) {
    var body = [];
    for (let i = 0; i < numberOfWorkParts; i++) {
        body.push(WORK);
    }

    // This might seem counterintuitive because work is 100 each, but
    // this simply reserves energy for a MOVE part for every work part.
    energy -= 150 * numberOfWorkParts;

    var numberOfParts = Math.floor(energy / 100);
    for (let i = 0; i < numberOfParts; i++) {
        body.push(CARRY);
    }
    // Need one move for every carry and work, so move needs doubled up
    for (let i = 0; i < numberOfParts + numberOfWorkParts; i++) {
        body.push(MOVE);
    }

    return body;
}

module.exports = function() {
    StructureSpawn.prototype.createCustomCreep =
        function(energy, roleName) {
            var numberOfParts = Math.floor(energy / 250);
            var body = [];

            if (roleName == "harvester") {
                body.push(WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE);
            } else if (roleName == "emergencyHarvester") {
                for (let i = 0; i < numberOfParts; i++) {
                    body.push(WORK, CARRY, MOVE, MOVE);
                }
                roleName = 'harvester';
            } else if (roleName == "miner") {
                body.push(WORK, WORK, WORK, WORK, WORK, MOVE);
            } else if (roleName == "builder") {
                body.push(WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE);
            } else {
                for (let i = 0; i < numberOfParts; i++) {
                    body.push(WORK, CARRY, MOVE, MOVE);
                }
            }

            return this.createCreep(body, null, {
                role: roleName
            });
        };

    StructureSpawn.prototype.createLongDistanceHarvester =
        function(energy, numberOfWorkParts, home, target, sourceId) {
            var body = getBalancedCreepBodyPlan(energy, numberOfWorkParts);

            // Create creep with the body built body
            return this.createCreep(body, undefined, {
                role: 'longDistanceHarvester',
                home: home,
                target: target,
                sourceId: sourceId,
                working: false
            });
        };

    StructureSpawn.prototype.createClaimer =
        function(energy, home, target) {
            var body = [];

            // A claimer will never be more or less than this, so hardcode
            // should be fine.
            body.push(CLAIM, CLAIM, MOVE, MOVE);

            // Create creep with the body built.
            return this.createCreep(body, undefined, {
                role: 'claimer',
                home: home,
                target: target
            });
        };

    StructureSpawn.prototype.createTransporter =
        function(energy) {
            var numberOfParts = Math.floor(energy / 150);
            var body = [];

            // One move per two carries, as it is assumed this creep Will
            // have roads to utilize.
            for (let i = 0; i < numberOfParts; i++) {
                body.push(CARRY, CARRY, MOVE);
            }

            // Create creep with the built body
            return this.createCreep(body, undefined, {
                role: 'transporter',
                working: false
            });
        };
};
