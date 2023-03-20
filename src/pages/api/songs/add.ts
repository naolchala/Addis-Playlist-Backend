import { NextApiResponse } from "next";
import { verifyUser } from "$src/lib/utils/helpers";
import type { RequestWithUser, UserError } from "$src/lib/types/user";
import nextConnect from "next-connect";
import { PlaylistResponse } from "$src/lib/types/playlist";

const route = nextConnect({
	onError: (req, res) => (res.statusCode = 504),
	onNoMatch: (req, res) => (res.statusCode = 404),
});

route.use(verifyUser);

route.post(
	async (
		req: RequestWithUser,
		res: NextApiResponse<PlaylistResponse | UserError>
	) => {
		try {
		} catch (error) {
			console.log(error);
			return res
				.status(500)
				.json({ msg: "INTERNAL ERROR, PLEASE TRY AGAIN" });
		}
	}
);

export default route;
