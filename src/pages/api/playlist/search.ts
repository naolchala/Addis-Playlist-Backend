import { NextApiRequest, NextApiResponse } from "next";
import { verifyUser } from "$src/lib/utils/helpers";
import type { RequestWithUser, UserError } from "$src/lib/types/user";
import nextConnect from "next-connect";
import { prisma } from "$src/lib/utils/prisma";
import { PlaylistResponse } from "$src/lib/types/playlist";
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
	async (
		req: RequestWithUser,
		res: NextApiResponse<PlaylistResponse[] | UserError>
	) => {
		try {
			let { keyword, orderBy, orderDirn, visibility } = req.query;

			orderBy = orderBy as string;
			orderDirn = orderDirn as string;
			visibility = visibility as string;

			if (["label", "createdAt"].indexOf(orderBy) == -1) {
				orderBy = "createdAt";
			}

			if (["asc", "desc"].indexOf(orderDirn) == -1) {
				orderDirn = "desc";
			}

			if (["PUBLIC", "PRIVATE"].indexOf(visibility) == -1) {
				visibility = undefined;
			}

			let order: any = {};
			order[orderBy] = orderDirn;

			const playlists = await prisma.playlist.findMany({
				where: {
					label: {
						contains: keyword as string,
						mode: "insensitive",
					},
					visibility: visibility as any,
					userID: req.user.id,
				},
				orderBy: order,
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
