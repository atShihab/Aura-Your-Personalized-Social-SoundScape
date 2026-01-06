import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import { v2 as cloudinary } from "cloudinary";



export const createSongLegacy = async (req, res) => {
  try {
    const { title, artist, album, genre } = req.body;

    if (!title || !artist || !album || !genre) {
      return res
        .status(400)
        .json({ message: "Missing required fields", success: false });
    }

    const songFile = req.file;
    if (!songFile) {
      return res
        .status(400)
        .json({ message: "Song file is required", success: false });
    }

    const result = await cloudinary.uploader.upload(songFile.path, {
      resource_type: "video",
      folder: "songs",
    });

    const newSong = new Song({
      title,
      artist,
      album,
      genre,
      url: result.secure_url,
    });

    await newSong.save();
    res
      .status(201)
      .json({ message: "Song created successfully", song: newSong });
  } catch (error) {
    console.error("Error creating song:", error);
    res.status(500).json({ message: "Failed to create song", success: false });
  }
};

export const getAllSongs = async (req, res) => {
  try {
    console.log("=== GET ALL SONGS DEBUG ===");
    // Only return approved songs
    const songs = await Song.find({ approvalStatus: { $ne: 'pending' } });
    console.log("Found songs:", songs.length);
    console.log("Sample song:", songs[0]);
    res.json(songs);
  } catch (error) {
    console.error("Error getting songs:", error);
    res.status(500).json({ message: "Failed to get songs", success: false });
  }
};

export const getFeaturedSongs = async (req, res) => {
  try {
    const songs = await Song.find({ approvalStatus: { $ne: 'pending' } }).limit(10);
    res.json(songs);
  } catch (error) {
    console.error("Error getting featured songs:", error);
    res.status(500).json({ message: "Failed to get featured songs", success: false });
  }
};

export const getMadeForYouSongs = async (req, res) => {
  try {
    const songs = await Song.find({ approvalStatus: { $ne: 'pending' } }).limit(20);
    res.json(songs);
  } catch (error) {
    console.error("Error getting made for you songs:", error);
    res.status(500).json({ message: "Failed to get made for you songs", success: false });
  }
};

export const getTrendingSongs = async (req, res) => {
  try {
    const songs = await Song.find({ approvalStatus: { $ne: 'pending' } }).limit(15);
    res.json(songs);
  } catch (error) {
    console.error("Error getting trending songs:", error);
    res.status(500).json({ message: "Failed to get trending songs", success: false });
  }
};

export const getSongById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const song = await Song.findById(id);
    
    if (!song) {
      return res.status(404).json({ message: "Song not found", success: false });
    }
    
    // Only return approved songs
    if (song.approvalStatus === 'pending') {
      return res.status(403).json({ message: "Song is pending approval", success: false });
    }
    
    res.json(song);
  } catch (error) {
    console.error("Error getting song by ID:", error);
    next(error);
  }
};

export const searchSongs = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: "Search query is required", success: false });
    }

    const songs = await Song.find({
      approvalStatus: { $ne: 'pending' },
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { artist: { $regex: q, $options: 'i' } },
        { featuredArtist: { $regex: q, $options: 'i' } }
      ]
    });

    res.json(songs);
  } catch (error) {
    console.error("Error searching songs:", error);
    res.status(500).json({ message: "Failed to search songs", success: false });
  }
};
