module.exports = function(rooms){
    
    console.log('<span style="color:rgba(52, 152, 219,1.0)">______          _       _    ______                   _      </span>')
    console.log('<span style="color:rgba(52, 152, 219,1.0)">| ___ \        (_)     | |   | ___ \                 | |     </span>')
    console.log('<span style="color:rgba(52, 152, 219,1.0)">| |_/ /_ _ _ __ _  __ _| |__ | |_/ /_ _ _ __ __ _  __| | ___ </span>')
    console.log('<span style="color:rgba(52, 152, 219,1.0)">|  __/ _` | \'__| |/ _` | \'_ \|  __/ _` | \'__/ _` |/ _` |/ _ \</span>')
    console.log('<span style="color:rgba(52, 152, 219,1.0)">| | | (_| | |  | | (_| | | | | | | (_| | | | (_| | (_| |  __/</span>')
    console.log('<span style="color:rgba(52, 152, 219,1.0)">\_|  \__,_|_|  |_|\__,_|_| |_\_|  \__,_|_|  \__,_|\__,_|\___|</span>')
        
    console.log('Running ' + Object.keys(rooms).length + ' Room(s)')
    for(var rm in rooms){
        console.log('<span style="color:rgba(142, 68, 173,1.0);">' + rm + '</span>')
        console.log('<span style="color:rgba(142, 68, 173,1.0);">##################################################</span>')

        var room = rooms[rm]

        console.log(room.room.energyAvailable + ' Energy for spawning ' + room.room.energyCapacityAvailable + ' Total spawning capacity')

        console.log('<span style="color:rgba(39, 174, 96,1.0);">Structures</span>')
        console.log(room.extractors.length + ' Extractor(s) ' + room.extractorContainers.length + ' with a Container')
        console.log(room.sources.length + ' Source(s) ' + room.sourceContainers.length + ' with a Container')
        console.log(room.spawns.length + ' Spawn(s) ' + room.extensions.length + ' Extension(s)')
        console.log(room.towers.length + ' Tower(s) ' + room.notFullTowers.length + ' Need(s) Energy')

        console.log('<span style="color:rgba(39, 174, 96,1.0);">Creeps</span>')

        for(var i in room.actions){
            var action = room.actions[i]

            console.log(action + ' ' + room.creepsByAction[action].length + '/' + room.required[action])
        }

        console.log('<span style="color:rgba(39, 174, 96,1.0);">Storage</span>')

        console.log(room.recycleContainers.length + ' Recycle Container(s)')
        console.log(room.generalUseContainers.length + ' General Use Container(s)')
        console.log(room.storages.length + ' Storage(s)')
    }
}