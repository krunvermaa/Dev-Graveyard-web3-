const fs = require('fs');
let code = fs.readFileSync('services/userService.ts', 'utf8');

code = code.replace(
  "export const getUserProfile = async (uid: string): Promise<User | null> => {",
  "import { ethers } from 'ethers';\nexport const getUserProfile = async (uid: string): Promise<User | null> => {\n  if (!uid || !ethers.isAddress(uid)) return null;"
);

fs.writeFileSync('services/userService.ts', code);
