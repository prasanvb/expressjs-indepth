import bcrypt from 'bcrypt';

const saltRounds = 12;

export const hash = async (password: string) => {
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};
