import helmet from "helmet";
import cors from "cors";
import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";

const route = nextConnect({
	onNoMatch: (res, req) => (res.statusCode = 404),
});

type TestResponse = {
	message: string;
	time: Date;
};

route.use(helmet());
route.use(
	cors({
		origin: "*",
	})
);

route.get((req: NextApiRequest, res: NextApiResponse) => {
	res.status(200).json({
		message: "API Working..",
		time: new Date(),
	});
});

export default route;
