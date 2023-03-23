import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import cors from "cors";

const route = nextConnect({
	onNoMatch: (res, req) => (res.statusCode = 404),
});

type TestResponse = {
	message: string;
	time: Date;
};

route.use(cors());

route.options((req: NextApiRequest, res: NextApiResponse) => {
	return res.status(200).send("");
});

route.get((req: NextApiRequest, res: NextApiResponse) => {
	res.status(200).json({
		message: "API Working..",
		time: new Date(),
	});
});

export default route;
