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

route.get(async (req: RequestWithUser, res: NextApiResponse) => {
	try {
		const { playlistID } = req.body;
		const user = req.user;

		if (!playlistID) {
			return res.status(400).json({ msg: "Playlist ID not found" });
		}

		const playlist = await prisma.playlist.findUnique({
			where: {
				id: playlistID,
			},
		});

		if (!playlist) {
			return res.status(404).json({ msg: "Playlist ID not found" });
		}

		const shared = await prisma.sharedPlaylist
			.findMany({
				where: {
					playlistID,
				},
				include: {
					receiver: true,
				},
			})
			.then((result) => {
				return result.map((s) => {
					let { password, id, ...info } = s.receiver;
					return info;
				});
			});

		return res.json(shared);
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ msg: "Internal error, please try again" });
	}
});

export default route;
