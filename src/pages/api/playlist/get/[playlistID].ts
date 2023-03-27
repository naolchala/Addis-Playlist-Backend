import { NextApiRequest, NextApiResponse } from "next";
import type { RequestWithUser } from "$src/lib/types/user";
import nextConnect from "next-connect";
import { prisma } from "$src/lib/utils/prisma";
import cors from "cors";

const route = nextConnect({
	onNoMatch: (req, res) => {
		res.statusCode = 404;
	},
});

route.use(cors());

route.options((req: NextApiRequest, res: NextApiResponse) => {
	return res.status(200).send("");
});

route.get(async (req: RequestWithUser, res: NextApiResponse) => {
	try {
		let { playlistID } = req.query;

		if (!playlistID) {
			return res.status(400).json({ msg: "Playlist ID not found" });
		}
		playlistID = playlistID as string;

		const playlist = await prisma.playlist.findUnique({
			where: {
				id: playlistID,
			},
			include: {
				_count: true,
				createdBy: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
						photoURL: true,
					},
				},
				Songs: true,
			},
		});

		if (!playlist) {
			return res.status(404).json({
				msg: "Playlist Not found",
			});
		}

		return res.status(200).json(playlist);
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ msg: "Internal error, please try again" });
	}
});

export default route;
