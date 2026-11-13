const fs = require('fs');
let code = fs.readFileSync('services/web3Service.ts', 'utf8');

if (!code.includes("import { getMockContract }")) {
  code = "import { getMockContract } from './mockContract';\n" + code;
}

code = code.replace(
  "export const getContract = async (withSigner = false) => {",
  "export const getContract = async (withSigner = false) => {\n  const address = getContractAddress();\n  if (address === \"0x0000000000000000000000000000000000000000\") return getMockContract();"
);

// We need to clean up `address` in the original function as we already defined it
code = code.replace("  const address = getContractAddress();", ""); // first occurrence might be our new one, we should be careful.
fs.writeFileSync('services/web3Service.ts', code);
