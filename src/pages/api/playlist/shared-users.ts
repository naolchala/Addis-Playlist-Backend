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

route.get(verifyUser, async (req: RequestWithUser, res: NextApiResponse) => {
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
					let { password, ...info } = s.receiver;
					return info;
				});
			});

		return res.status(200).json(shared);
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ msg: "Internal error, please try again" });
	}
});

export default route;
