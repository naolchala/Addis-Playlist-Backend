import { NextApiRequest, NextApiResponse } from "next";
import { verifyUser } from "$src/lib/utils/helpers";
import type { RequestWithUser, UserError } from "$src/lib/types/user";
import nextConnect from "next-connect";
import { prisma } from "$src/lib/utils/prisma";
import { PlaylistResponse } from "$src/lib/types/playlist";
import { Song, Visibility } from "@prisma/client";

const route = nextConnect({
	onNoMatch: (req: NextApiRequest, res: NextApiResponse) => {
		return res.status(404);
	},
});

route.use(verifyUser);

route.get(
	async (req: RequestWithUser, res: NextApiResponse<Song[] | UserError>) => {
		try {
			let { orderBy, orderDirn } = req.query;
			let { id } = req.body;
			orderBy = orderBy as string;
			orderDirn = orderDirn as string;
			if (
				["title", "album", "releaseDate", "addedAt"].indexOf(orderBy) ==
				-1
			) {
				orderBy = "addedAt";
			}

			if (["asc", "desc"].indexOf(orderDirn) == -1) {
				orderDirn = "desc";
			}

			let order: any = {};
			order[orderBy] = orderDirn;

			const songs = await prisma.song.findMany({
				where: {
					playlistID: id,
				},
				orderBy: order,
			});

			return res.status(200).json(songs);
		} catch (error) {
			console.log(error);
			return res
				.status(500)
				.json({ msg: "Internal error, please try again" });
		}
	}
);

export default route;
