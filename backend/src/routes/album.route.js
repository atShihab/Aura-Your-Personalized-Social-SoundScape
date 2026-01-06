import { Router } from "express";
import {
  createAlbum,
  getAlbumById,
  getAllAlbums,
  addAlbumToLibrary,
  removeAlbumFromLibrary,
  checkAlbumLibraryStatus,
  getLibraryAlbums,
} from "../controller/album.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = Router();

router.post(
  "/",
  protectRoute,
  requireAdmin,
  upload.single("coverImage"),
  createAlbum,
);
router.get("/", getAllAlbums);

// Album library routes - must come before /:albumId routes
router.get("/library", protectRoute, getLibraryAlbums);
router.post("/:albumId/library", protectRoute, addAlbumToLibrary);
router.delete("/:albumId/library", protectRoute, removeAlbumFromLibrary);
router.get("/:albumId/library", protectRoute, checkAlbumLibraryStatus);

router.get("/:albumId", getAlbumById);

export default router;
