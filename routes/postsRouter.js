import express from "express"
import {getPosts, singlePost,createPost, updatePost,deletePost} from '../controllers/postsControllers.js'
import { identifier } from "../middlewares/identification.js";
const router = express.Router();

router.get('/all-posts', getPosts);
router.get('/single-post',singlePost);
router.post('/create-post', identifier,createPost);

router.put('/update-post', identifier,updatePost);
router.delete('/delete-post', identifier, deletePost);

export default router