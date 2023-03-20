import { NextApiRequest, NextApiResponse } from "next";
import { verifyUser } from "$src/lib/utils/helpers";
import type { RequestWithUser, UserError } from "$src/lib/types/user";
import nextConnect from "next-connect";
import { prisma } from "$src/lib/utils/prisma";
import { PlaylistResponse } from "$src/lib/types/playlist";

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
			let { keyword, orderBy, orderDirn, take, offset, visibility } =
				req.query;

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
