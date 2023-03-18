import { User } from "@prisma/client";
import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";

export const signUser = (user: User) => {
	const { password, ...other } = user;
	const token = jwt.sign(other, JWT_SECRET);
	return { ...other, token };
};
