const fs = require('fs');
let code = fs.readFileSync('services/web3Service.ts', 'utf8');

code = code.replace(
  "\"0xYourDeployedContractAddressHere\"",
  "\"0x0000000000000000000000000000000000000000\""
);

fs.writeFileSync('services/web3Service.ts', code);
