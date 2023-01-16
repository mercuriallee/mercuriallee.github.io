const {equalTo24} = require('../24_game.js');

var successCount=0;
for( var pos=0; pos<13**4; pos++) {
    const operands = [0, 1, 2, 3].map(e=>Math.floor(pos/13**e)%13+1);
    const solution = equalTo24(...operands);
    if(!solution.endsWith('!')) {
        successCount++;
        console.log(operands.join(','));
        console.log(`-------------------${successCount}-----------------------`);
    }
}
