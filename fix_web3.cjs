const fs = require('fs');
let code = fs.readFileSync('services/web3Service.ts', 'utf8');

code = code.replace(
  "export const getContract = async (withSigner = false) => {\n  if (address === \"0x0000000000000000000000000000000000000000\") return getMockContract();\n  const provider = getProvider();\n  const address = getContractAddress();",
  "export const getContract = async (withSigner = false) => {\n  const address = getContractAddress();\n  if (address === \"0x0000000000000000000000000000000000000000\") return getMockContract();\n  const provider = getProvider();"
);

fs.writeFileSync('services/web3Service.ts', code);
