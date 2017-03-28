var utils = require('./utils');

module.exports = {

    /**
     * Executes room-level tasks, e.g. building structures and roads.
     *
     * @param {Room} room The room whose tasks to take care of
     */
    run: function (room) {
        let excessMaterials = this.checkTerminalSurpluses(room);
        //console.log(room.name + ' ' + JSON.stringify(excessMaterials));
        
        this.balanceLinkEnergy(room);
        
        
    },

    balanceLinkEnergy: function(room) {

        // Get all links in room
        var linksInRoom = Game.rooms[room.name].memory.links;
        
        // Get object from their IDs
        //var linksInRoom = _.mapKeys(linkIdsInRoom, function(key) {
        //    return Game.getObjectById(key); 
        //});
        
        //console.log(JSON.stringify(linksInRoom));
        
        // If there is more than one link
        if (Object.keys(linksInRoom).length >= 2) {
            
            var zeroEnergyLinks = []
            var linksWithEnergy = []
            
            _.forEach(linksInRoom, function(n, key) {
                var targetLink = Game.getObjectById(key);

                if (targetLink) {

                    if (targetLink.energy == 0) {
                        zeroEnergyLinks.push(Game.getObjectById(key));
                    }
                    else if (targetLink.energy > 100) {
                        linksWithEnergy.push(Game.getObjectById(key));
                    }
                }
            });
            
            //console.log(room.name + ' ZeroEnergy: ' + _.first(zeroEnergyLinks) + ' HasEnergy: ' + _.first(linksWithEnergy));
            
            
            // If there is both a link with 0 energy, and a link with energy
            if (zeroEnergyLinks.length > 0 && linksWithEnergy.length > 0) {
                let source = linksWithEnergy[0];
                let target = zeroEnergyLinks[0];
                
                // Transfer all minus 50 energy (so that it doesn't trasnfer back next tick)
                if (source.cooldown === 0) {
                    source.transferEnergy(target, source.energy - 50)
                }
            }
        }
    },


    checkTerminalSurpluses: function(room) {
        if (room.terminal) {
            var resourceKeys = _.filter(_.keys(room.terminal.store), function(n) {
                return n != RESOURCE_ENERGY   
            }); 
            
            var excessMaterials = {};
            
            resourceKeys.forEach(function(resource) {
                if (room.terminal.store[resource] > 9000) {
                    let amountCanSell = room.terminal.store[resource] - 9000
                    excessMaterials[resource] = amountCanSell;
                }
            });
            
            return excessMaterials;
        }
    },


    /**
     * Creates constructions sites for roads between the given points.
     * The points have to be in the same room or in adjacent rooms.
     *
     * @param {ConstructionSite|Source|Structure} start Start point of the road
     * @param {ConstructionSite|Source|Structure} end End point of the road
     */
    buildRoad: function (start, end) {
        let memoryKey = `${start.id}_${end.id}`, inverseMemoryKey = `${end.id}_${start.id}`;
        if (_.has(Memory.rooms[start.pos.roomName].paths, memoryKey) ||
                _.has(Memory.rooms[start.pos.roomName].paths, inverseMemoryKey)) {
            // This path is already established, no need to do anything
            return;
        }

        var path = start.pos.findPathTo(end.pos, {ignoreCreeps: true});

        if (_.keys(Game.constructionSites).length + path.length > MAX_CONSTRUCTION_SITES) {
            console.log(`Can't build road between ${start.pos} and ${end.pos}, too many construction sites`);
            return;
        }

        let startX = start.pos.x, startY = start.pos.y, endX = _.last(path).x, endY = _.last(path).y;
        console.log(`${start.pos.roomName}: Building road from (${startX}, ${startY}) to (${endX}, ${endY})`);

        _.forEach(path, step => {
            let pos = new RoomPosition(step.x, step.y, start.pos.roomName);
            if (_.isEmpty(pos.lookFor(LOOK_CONSTRUCTION_SITES)) &&
                    _.isEmpty(_.filter(pos.lookFor(LOOK_STRUCTURES),
                            s => s.structureType === STRUCTURE_ROAD))) {
                pos.createConstructionSite(STRUCTURE_ROAD);
            }
        });

        Memory.rooms[start.pos.roomName].paths[memoryKey] = true;

        if (start.pos.roomName !== end.pos.roomName) {
            // Points are in different rooms, findPathTo() only goes to the room border.
            // In order to complete the road the other half needs to be built as well.
            this.buildRoad(end, start);
        }
    }

};