import { Playlist, Prisma, Song } from "@prisma/client";

export type PlaylistResponse = Playlist & {
	_count: Prisma.PlaylistCountOutputType;
};
export type SongResponse = Song;
