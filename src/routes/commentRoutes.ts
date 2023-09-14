import { Router } from "express";
import { body, param } from "express-validator";
import * as commentController from "../controllers/commentController";
import isAuth from "../middleware/is-auth";

const router = Router();

router.post(
  "/comment/:commentId/reply",
  [body("body").isLength({ min: 1, max: 150 })],
  isAuth,
  commentController.replyComment
);

router.put(
  "/comment/:commentId",
  [body("body").isLength({ min: 1, max: 150 })],
  isAuth,
  commentController.updateComment
);

router.get("/comments", commentController.getComments);

router.get(
  "/comments/:postId",
  param("postId").isAlphanumeric(),
  commentController.getCommentsByPostId
);

router.get("/comment/:commentId", commentController.getComment);

router.delete("/comment/:commentId", isAuth, commentController.deleteComment);

router.post(
  "/comments/:commentId/vote",
  isAuth,
  body("vote").isInt({ min: -1, max: 1 }),
  commentController.voteComment
);

export default router;
