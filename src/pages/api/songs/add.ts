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
				title,
				album,
				artists,
				duration,
				releaseYear,
				deezerURL,
				playlistID,
			} = req.body;

			if (!playlistID) {
				return res.status(400).json({
					msg: "Playlist ID not found",
					field: "playlistID",
				});
			}

			if (!title) {
				return res.status(400).json({
					msg: "Please Enter the title of the song",
					field: "title",
				});
			}

			const playlist = await prisma.playlist.findUnique({
				where: {
					id: playlistID,
				},
			});

			if (!playlist) {
				return res.status(404).json({
					msg: "Playlist not found",
				});
			}

			if (req.user.id !== playlist.userID) {
				return res.status(403).json({
					msg: "You are not authorized to manage this playlist",
				});
			}

			const song = await prisma.song.create({
				data: {
					title,
					album,
					artists,
					deezerURL,
					duration,
					releaseYear,
					playlistID,
				},
			});

			return res.status(200).json(song);
		} catch (error) {
			console.log(error);
			return res
				.status(500)
				.json({ msg: "INTERNAL ERROR, PLEASE TRY AGAIN" });
		}
	}
);

export default route;
