import { User } from "@prisma/client";
import * as jwt from "jsonwebtoken";
import { NextApiResponse } from "next";
import { RequestWithUser, UserRequest, UserResponse } from "../types/user";

export const JWT_SECRET = process.env.JWT_SECRET || "";

export const signUser = (user: User) => {
	const { password, ...other } = user;
	const token = jwt.sign(other, JWT_SECRET);
	return { ...other, token };
};

export const verifyUser = (
	req: RequestWithUser,
	res: NextApiResponse,
	next: () => void
) => {
	const authHeader = req.headers?.authorization;
	const token = authHeader && authHeader?.split(" ")[1];

	if (!token) {
		return res.status(401).json({
			msg: "Token Not Found, Sign in Again",
		});
	}

	jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
		if (err)
			return res.status(403).json({
				msg: "Invalid Token, Sign in Again",
			});

		req.user = user;

		next();
	});

	next();
};
