import { NextApiRequest, NextApiResponse } from "next";
import { verifyUser } from "$src/lib/utils/helpers";
import type { RequestWithFile, UserError } from "$src/lib/types/user";
import nextConnect from "next-connect";
import multer from "multer";
import { cloudinary, uploadImage } from "$src/lib/utils/cloudinary";
import { prisma } from "$src/lib/utils/prisma";
import { PlaylistResponse } from "$src/lib/types/playlist";
import cors from "cors";

const route = nextConnect({
	onError: (req, res) => (res.statusCode = 504),
	onNoMatch: (req, res) => (res.statusCode = 404),
});

const upload = multer({
	storage: multer.memoryStorage(),
});
const fileMiddleware = upload.single("playlistArt");

route.use(cors());
route.use(fileMiddleware);

route.options((req: NextApiRequest, res: NextApiResponse) => {
	return res.status(200).send("");
});

route.post(
	verifyUser,
	async (
		req: RequestWithFile,
		res: NextApiResponse<PlaylistResponse | UserError>
	) => {
		try {
			let { label, desc, visibility } = req.body;
			const user = req.user;
			const file = req.file;

			if (!label) {
				return res
					.status(400)
					.json({ msg: "Please, Enter the label", field: "label" });
			}

			if (!visibility) {
				visibility = "PRIVATE";
			}

			let playlistArt = undefined;
			if (file) {
				const uploadStatus = await uploadImage(file, "PlaylistArt");
				playlistArt = uploadStatus?.url;
			}

			const playlist = await prisma.playlist.create({
				data: {
					label,
					visibility,
					desc,
					playlistArtURL: playlistArt,
					userID: user.id,
				},
				include: {
					_count: true,
				},
			});

			return res.status(200).json(playlist);
		} catch (error) {
			console.log(error);
			return res
				.status(500)
				.json({ msg: "INTERNAL ERROR, PLEASE TRY AGAIN" });
		}
	}
);

export const config = {
	api: {
		bodyParser: false,
	},
};

export default route;
