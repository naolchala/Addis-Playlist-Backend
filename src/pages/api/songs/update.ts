import { NextApiRequest, NextApiResponse } from "next";
import { verifyUser } from "$src/lib/utils/helpers";
import type { RequestWithUser, UserError } from "$src/lib/types/user";
import nextConnect from "next-connect";
import { SongResponse } from "$src/lib/types/playlist";
import { prisma } from "$src/lib/utils/prisma";
import cors from "cors";

const route = nextConnect({
	onError: (req, res) => (res.statusCode = 504),
	onNoMatch: (req, res) => (res.statusCode = 404),
});

route.use(cors());

route.options((req: NextApiRequest, res: NextApiResponse) => {
	return res.status(200).send("");
});

route.post(
	verifyUser,
	async (
		req: RequestWithUser,
		res: NextApiResponse<SongResponse | UserError>
	) => {
		try {
			const {
				id,
				title,
				album,
				artists,
				duration,
				releaseYear,
				deezerURL,
			} = req.body;

			if (!id) {
				return res.status(400).json({
					msg: "Song ID not found",
					field: "id",
				});
			}

			const song = await prisma.song.findUnique({
				where: {
					id,
				},
				include: {
					playlist: true,
				},
			});

			if (!song) {
				return res.status(404).json({
					msg: "Song not found",
				});
			}

			if (req.user.id !== song.playlist.userID) {
				return res.status(403).json({
					msg: "You are not authorized to edit this song",
				});
			}

			const updatedSong = await prisma.song.update({
				where: {
					id,
				},
				data: {
					title,
					album,
					artists,
					deezerURL,
					duration,
					releaseYear,
				},
			});

			return res.status(200).json(updatedSong);
		} catch (error) {
			console.log(error);
			return res
				.status(500)
				.json({ msg: "INTERNAL ERROR, PLEASE TRY AGAIN" });
		}
	}
);

export default route;
