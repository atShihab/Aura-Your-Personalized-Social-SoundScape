export interface Song {
	_id: string;
	title: string;
	artist: string;
	featuredArtist?: string;
	albumId?: string | null;
	imageUrl: string;
	audioUrl?: string;
	duration: number; // Duration in minutes
	genre: string;
	mood?: string;
	releaseDate?: string;
	totalPlays?: number;
	createdAt?: string;
	updatedAt?: string;
	artistId?: string;
	albumTitle?: string;
	album?: any;
}

export interface Album {
	_id: string;
	title: string;
	artist: string;
	imageUrl: string;
	releaseYear: number;
	genre: string;
	songs: Song[];
	totalDuration?: number;
	totalPlays?: number;
	songCount?: number;
	createdAt?: string;
	updatedAt?: string;
}

export interface Stats {
	totalSongs: number;
	totalAlbums: number;
	totalUsers: number;
	totalArtists: number;
	activeUsers: number;
}

export interface Message {
	_id: string;
	senderId: string;
	receiverId: string;
	content: string;
	imageUrl?: string;
	messageType: 'text' | 'image' | 'mixed' | 'playlist' | 'song';
	playlistData?: {
		playlistId: string;
		playlistName: string;
		playlistImage: string;
		songCount: number;
		description?: string;
	};
	songData?: {
		songId: string;
		songTitle: string;
		songArtist: string;
		songImage: string;
		songUrl: string;
		duration: number;
	};
	isEdited?: boolean;
	editedAt?: string;
	replyTo?: string;
	isPinned?: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface User {
	_id: string;
	clerkId: string;
	fullName: string;
	imageUrl: string;
	handle?: string; // Username/handle for search
	// Artist-specific fields
	isArtist?: boolean;
	artistName?: string;
	genre?: string;
	bio?: string;
	isVerified?: boolean;
	verificationDate?: string;
	verificationType?: 'artist' | 'industry';
	verificationStatus?: 'pending' | 'approved' | 'rejected';
	verificationNotes?: string;
	socialMedia?: {
		instagram?: string;
		twitter?: string;
		youtube?: string;
		tiktok?: string;
		website?: string;
	};
	// Artist statistics
	followers?: number;
	following?: number;
	totalPlays?: number;
	monthlyListeners?: number;
	createdAt?: string;
	updatedAt?: string;
}
