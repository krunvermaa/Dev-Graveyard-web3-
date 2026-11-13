export const updateUsernameEverywhere = async (
  userId: string, 
  oldUsername: string, 
  newUsername: string
): Promise<void> => {
  console.log("updateUsernameEverywhere not fully supported in Web3 mock");
};

export const deleteAccountCompletely = async (userId: string, username?: string): Promise<void> => {
  console.log("deleteAccountCompletely not fully supported in Web3 mock");
  localStorage.removeItem(`user_${userId}`);
};

