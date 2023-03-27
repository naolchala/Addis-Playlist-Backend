import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import cors from "cors";
import axios from "axios";
import { DeezerSearchResult } from "$src/lib/types/deezer";

const route = nextConnect({
	onNoMatch: (req: NextApiRequest, res: NextApiResponse) => {
		return res.status(404);
	},
});

route.use(cors());

route.options((req: NextApiRequest, res: NextApiResponse) => {
	return res.status(200).send("");
});

route.get(async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		let { q } = req.query;

		if (!q) {
			return res.status(200).json({ songs: [] });
		}

		const data = await axios
			.get("https://api.deezer.com/search?q=" + q)
			.then((res) => res.data.data as DeezerSearchResult[]);

		const top_ten = data.length > 10 ? data.slice(0, 10) : data;

		const formatted = top_ten.map((value, index) => {
			const {
				title,
				duration,
				link: deezerURL,
				album: { title: album, cover_small: cover },
				artist: { name: artist },
			} = value;

			return {
				title,
				duration,
				deezerURL,
				album,
				artist,
				cover,
			};
		});

		return res.json(formatted);
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ msg: "Internal error, please try again" });
	}
});

export default route;
