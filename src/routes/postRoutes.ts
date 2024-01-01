import { Router } from "express";
import { body } from "express-validator";
import * as postController from "../controllers/postController";
import * as commentController from "../controllers/commentController";
import isAuth from "../middleware/is-auth";

const router = Router();

router.post(
  "/post",
  [
    body("title").trim().isLength({ min: 5, max: 50 }),
    body("body").trim().isLength({ min: 5, max: 500 }),
  ],
  isAuth,
  postController.createPost
);

router.put(
  "/post/:postId",
  [
    body("title").trim().isLength({ min: 5 }),
    body("body").trim().isLength({ min: 5 }),
  ],
  isAuth,
  postController.updatePost
);

router.delete("/post/:postId", isAuth, postController.deletePost);

router.get("/posts", postController.getPosts);

router.get("/post/:postId", postController.getPost);

router.post(
  "/post/:postId/comment",
  [body("body").isLength({ min: 1, max: 150 })],
  isAuth,
  commentController.createPostComment
);

export default router;
