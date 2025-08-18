//generate a random username
export const getUsername = (length = 8): string => {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let username = '';
  for (let i = 0; i < length; i++) {
    username += characters.charAt(
      Math.floor(Math.random() * characters.length),
    );
  }
  return username;
};
