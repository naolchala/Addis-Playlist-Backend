import { prisma } from "$src/lib/utils/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { signUser } from "$src/lib/utils/helpers";
import type { UserError, UserResponse } from "$src/lib/types/user";
import nextConnect from "next-connect";
import bcrypt from "bcrypt";
import cors from "cors";

const route = nextConnect({
	onNoMatch: (req: NextApiRequest, res: NextApiResponse) =>
		res.status(404).json({ msg: "NOT FOUND!" }),
});

route.use(cors());

route.options((req: NextApiRequest, res: NextApiResponse) => {
	return res.status(200).send("");
});

route.post(
	async (
		req: NextApiRequest,
		res: NextApiResponse<UserResponse | UserError>
	) => {
		const { firstName, lastName, email, password } = req.body;

		if (!firstName || !lastName || !email || !password) {
			return res.status(402).json({
				msg: "Please Enter All Fields",
			});
		}

		const hashedPass = await bcrypt.hash(password, 10);

		const count = await prisma.user.count({ where: { email } });

		if (count > 0) {
			return res.status(401).json({
				msg: "User with that email already exists",
				field: "email",
			});
		}

		const user = await prisma.user
			.create({
				data: {
					firstName,
					lastName,
					email,
					password: hashedPass,
					photoURL: `https://api.dicebear.com/5.x/initials/svg?seed=${encodeURI(
						firstName + " " + lastName
					)}`,
				},
			})
			.catch((err) => {
				console.error(err);
			});

		prisma.$disconnect();
		if (user) {
			return res.json(signUser(user));
		}

		return res
			.status(500)
			.json({ msg: "INTERNAL ERROR, PLEASE TRY AGAIN" });
	}
);

export default route;
