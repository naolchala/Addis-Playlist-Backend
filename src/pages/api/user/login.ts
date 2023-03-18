import { prisma } from "$src/lib/utils/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { signUser } from "$src/lib/utils/helpers";
import type { UserError, UserResponse } from "$src/lib/types/user";
import nextConnect from "next-connect";
import bcrypt from "bcrypt";

const route = nextConnect({
	onNoMatch: (req: NextApiRequest, res: NextApiResponse) =>
		res.status(404).json({ msg: "NOT FOUND!" }),
});

route.post(
	async (
		req: NextApiRequest,
		res: NextApiResponse<UserResponse | UserError>
	) => {
		try {
			const { email, password } = req.body;

			if (!email || !password) {
				return res.status(401).json({
					msg: "Please Enter All Fields",
				});
			}

			const user = await prisma.user.findUnique({
				where: {
					email,
				},
			});

			if (!user) {
				return res.status(404).json({
					msg: "User doesn't exist",
					field: "email",
				});
			}

			const match = await bcrypt.compare(password, user.password);

			if (!match) {
				return res.status(403).json({
					msg: "Wrong password, try again",
					field: "password",
				});
			}

			return res.json(signUser(user));
		} catch (error) {
			console.log(error);
			return res
				.status(500)
				.json({ msg: "INTERNAL ERROR, PLEASE TRY AGAIN" });
		}
	}
);

export default route;
