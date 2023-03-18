import { NextApiRequest, NextApiResponse } from "next";

type TestResponse = {
	message: string;
	time: Date;
};

export default function handler(
	req: NextApiRequest,
	res: NextApiResponse<TestResponse>
) {
	res.status(200).json({
		message: "API Working..",
		time: new Date(),
	});
}
