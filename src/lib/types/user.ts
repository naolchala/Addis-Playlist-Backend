import { signUser } from "../utils/helpers";

export type UserResponse = ReturnType<typeof signUser>;
export type UserError = {
	msg: string;
	field?: string;
};
