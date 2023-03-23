import { NextApiRequest, NextApiResponse } from "next";
import { verifyUser } from "$src/lib/utils/helpers";
import type { RequestWithUser, UserError } from "$src/lib/types/user";
import nextConnect from "next-connect";
import { prisma } from "$src/lib/utils/prisma";
import { PlaylistResponse } from "$src/lib/types/playlist";
import { Visibility } from "@prisma/client";
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
	async (
		req: NextApiRequest,
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

			const playlists = await prisma.playlist.findMany({
				where: {
					label: {
						contains: keyword as string,
						mode: "insensitive",
					},
					visibility: Visibility.PUBLIC,
				},
				orderBy: order,
				take: parseInt(take as string) || 20,
				skip: parseInt(offset as string) || 0,
				include: {
					_count: true,
				},
			});

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
