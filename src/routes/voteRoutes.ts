import { Router } from "express";
import * as voteController from "../controllers/voteController";
import isAuth from "../middleware/is-auth";

const router = Router();

router.post("/vote/:referenceId/:type", isAuth, voteController.handleVote);
