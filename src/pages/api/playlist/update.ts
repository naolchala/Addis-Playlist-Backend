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

route.post(
	async (
		req: RequestWithUser,
		res: NextApiResponse<PlaylistResponse | UserError>
	) => {
		try {
			const { id, label, desc, visibility, favorite } = req.body;

			if (!id) {
				return res
					.status(400)
					.json({ msg: "Playlist ID is required to delete" });
			}

			const playlist = await prisma.playlist.findUnique({
				where: {
					id,
				},
			});

			if (!playlist) {
				return res.status(404).json({ msg: "Playlist not found" });
			}

			if (playlist.userID !== req.user.id) {
				return res.status(403).json({
					msg: "You don't have the authority to change this playlist",
				});
			}

			await prisma.playlist
				.update({
					where: {
						id: playlist.id,
					},
					data: {
						label,
						favorite,
						desc,
						visibility,
					},
				})
				.then((p) => res.status(200).json(p));
		} catch (error) {
			console.log(error);
			return res
				.status(500)
				.json({ msg: "Internal error, please try again" });
		}
	}
);

export default route;
