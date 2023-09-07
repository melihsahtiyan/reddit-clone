import { validationErrorHandler } from "./../util/customValidationErrorHandler";

export const createPost = async (req, res, next) => {
  validationErrorHandler(req);

  const { title, body } = req.body;
};

export const updatePost = async (req, res, next) => {};

export const deletePost = async (req, res, next) => {};

export const getPosts = async (req, res, next) => {};

export const getPost = async (req, res, next) => {};
