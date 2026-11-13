const fs = require('fs');
let code = fs.readFileSync('services/graveService.ts', 'utf8');

code = code.replace(
  "export const checkHasPressedF = async (graveId: string, address: string): Promise<boolean> => {",
  "import { ethers } from 'ethers';\nexport const checkHasPressedF = async (graveId: string, address: string): Promise<boolean> => {\n  if (!address || !ethers.isAddress(address)) return false;"
);

fs.writeFileSync('services/graveService.ts', code);
