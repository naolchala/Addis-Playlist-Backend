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

route.post(verifyUser, async (req: RequestWithUser, res: NextApiResponse) => {
	try {
		const { playlistID, userID } = req.body;
		const user = req.user;

		if (!playlistID) {
			return res.status(400).json({ msg: "Playlist ID not found" });
		}

		if (!userID) {
			return res.status(400).json({ msg: "User ID not found" });
		}

		const sharedAlready = await prisma.sharedPlaylist.findFirst({
			where: {
				playlistID,
				receiverID: userID,
			},
		});

		if (!sharedAlready) {
			return res
				.status(404)
				.json({ msg: "Playlist isn't shared with the user" });
		}

		const share = await prisma.sharedPlaylist.delete({
			where: {
				id: sharedAlready.id,
			},
			include: {
				receiver: true,
			},
		});

		const { password, ...info } = share.receiver;

		return res.status(200).json(info);
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ msg: "Internal error, please try again" });
	}
});

export default route;
