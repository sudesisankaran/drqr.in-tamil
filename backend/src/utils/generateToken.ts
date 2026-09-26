import jwt from "jsonwebtoken";

export const generateToken = (id: string) => {
  const secret = process.env.JWT_SECRET as string;

  return jwt.sign({ id }, secret, {
    expiresIn: "7d",
  });
};
