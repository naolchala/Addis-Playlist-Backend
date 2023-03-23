import { NextApiRequest, NextApiResponse } from "next";
import { verifyUser } from "$src/lib/utils/helpers";
import type { RequestWithUser, UserError } from "$src/lib/types/user";
import nextConnect from "next-connect";
import { prisma } from "$src/lib/utils/prisma";
import { PlaylistResponse } from "$src/lib/types/playlist";
import { Song, Visibility } from "@prisma/client";
import cors from "cors";

const route = nextConnect({
	onNoMatch: (req: NextApiRequest, res: NextApiResponse) => {
		return res.status(404);
	},
});

route.use(cors());

route.options((req: NextApiRequest, res: NextApiResponse) => {
	return res.status(200).send("");
});

route.get(
	verifyUser,
	async (req: RequestWithUser, res: NextApiResponse<Song[] | UserError>) => {
		try {
			let { orderBy, orderDirn } = req.query;
			orderBy = orderBy as string;
			orderDirn = orderDirn as string;

			let { playlistID } = req.body;

			if (!playlistID) {
				return res.status(400).json({
					msg: "Playlist ID not found",
					field: "playlistID",
				});
			}

			const OrderArray = ["title", "album", "releaseDate", "addedAt"];
			if (OrderArray.indexOf(orderBy) == -1) {
				orderBy = "addedAt";
			}
			if (["asc", "desc"].indexOf(orderDirn) == -1) {
				orderDirn = "desc";
			}
			let order: any = {};
			order[orderBy] = orderDirn;

			const songs = await prisma.song.findMany({
				where: {
					playlistID,
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
