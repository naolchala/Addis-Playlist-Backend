import { NextApiRequest, NextApiResponse } from "next";
import type { RequestWithUser, UserError } from "$src/lib/types/user";
import nextConnect from "next-connect";
import { prisma } from "$src/lib/utils/prisma";
import { PlaylistResponse } from "$src/lib/types/playlist";
import { Visibility } from "@prisma/client";
import { verifyUser } from "$src/lib/utils/helpers";

const route = nextConnect({
	onNoMatch: (req: NextApiRequest, res: NextApiResponse) => {
		return res.status(404);
	},
});

route.use(verifyUser);
route.get(
	async (
		req: RequestWithUser,
		res: NextApiResponse<PlaylistResponse[] | UserError>
	) => {
		try {
			let { keyword, orderBy, orderDirn, take, offset } = req.query;
			orderBy = orderBy as string;
			orderDirn = orderDirn as string;

			if (["label", "createdAt"].indexOf(orderBy) == -1) {
				orderBy = "createdAt";
			}

			if (["asc", "desc"].indexOf(orderDirn) == -1) {
				orderDirn = "desc";
			}

			let order: any = {};
			order[orderBy] = orderDirn;

			const playlists = await prisma.sharedPlaylist
				.findMany({
					where: {
						receiverID: req.user.id,
					},
					include: {
						playlist: true,
					},
				})
				.then((result) => result.map((r) => r.playlist));

			return res.status(200).json(playlists);
		} catch (error) {
			console.log(error);
			return res
				.status(500)
				.json({ msg: "Internal error, please try again" });
		}
	}
);

export default route;
