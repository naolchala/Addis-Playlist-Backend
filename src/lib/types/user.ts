import {} from "multer";
import { NextApiRequest } from "next";
import { signUser } from "../utils/helpers";

export type UserResponse = ReturnType<typeof signUser>;
export type UserRequest = Omit<UserResponse, "token">;
export type UserError = {
	msg: string;
	field?: string;
};

export interface RequestWithUser extends NextApiRequest {
	user: UserRequest;
}

export interface RequestWithFile extends RequestWithUser {
	file: Express.Multer.File;
}
