import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "$src/styles/Home.module.css";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
	return (
		<>
			<Head>
				<title>Addis Playlist Backend</title>
			</Head>
			<main className={styles.main}>
				<h1 className={inter.className} style={{ fontSize: "6em" }}>
					Addis Playlist Backend
				</h1>
			</main>
		</>
	);
}
