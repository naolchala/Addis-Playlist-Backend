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
		const { playlistID, email } = req.body;
		const user = req.user;

		if (!playlistID) {
			return res.status(400).json({ msg: "Playlist ID not found" });
		}

		if (!email) {
			return res.status(400).json({ msg: "Please Enter Email" });
		}

		if (email === req.user.email) {
			return res
				.status(400)
				.json({ msg: "Sorry, You can't share to yourself" });
		}

		const playlist = await prisma.playlist.findUnique({
			where: {
				id: playlistID,
			},
		});

		if (!playlist) {
			return res.status(404).json({ msg: "Playlist ID not found" });
		}

		const sharedUser = await prisma.user.findUnique({
			where: {
				email,
			},
		});

		if (!sharedUser) {
			return res.status(404).json({ msg: "User not found" });
		}

		const share = await prisma.sharedPlaylist.create({
			data: {
				playlistID,
				senderID: user.id,
				receiverID: sharedUser.id,
			},
		});

		const { password, id, ...info } = sharedUser;

		return res.status(200).json(info);
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ msg: "Internal error, please try again" });
	}
});

export default route;
