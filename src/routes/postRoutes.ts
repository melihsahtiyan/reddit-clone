import { Router } from "express";
import { body } from "express-validator";
import * as postController from "../controllers/postController";

const router = Router();

router.post(
  "/post",
  [
    body("title").trim().isLength({ min: 5 }),
    body("body").trim().isLength({ min: 5 }),
  ],
  postController.createPost
);

router.put(
  "/post/:postId",
  [
    body("title").trim().isLength({ min: 5 }),
    body("body").trim().isLength({ min: 5 }),
  ],
  postController.updatePost
);

router.delete("/post/:postId", postController.deletePost);

router.get("/posts", postController.getPosts);

router.get("/post/:postId", postController.getPost);

router.post("/post/:postId/vote", postController.votePost);

export default router;
