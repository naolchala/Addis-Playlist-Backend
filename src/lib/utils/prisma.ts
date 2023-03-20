import { PrismaClient } from "@prisma/client";

class PrismaC {
	static instance?: PrismaClient = undefined;

	static getInstance() {
		if (!this.instance) {
			this.instance = new PrismaClient();
			this.instance.$connect();
			console.log("Prisma Client Created");
		}

		return this.instance;
	}
}

const prisma = PrismaC.getInstance();

export { prisma };
