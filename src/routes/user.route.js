import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { logiUser } from "../controllers/user.controller.js";
import { logOutUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";
import verifyToken from "../middlewares/auth.middleware.js";
import {refreshAccessToken} from "../controllers/user.controller.js"
const router = Router()


router.route("/register").post(

    upload.fields(
        [
            {
                name: "profileImage",
                maxCount: 1
            }
        ]
    ),
    registerUser
)
router.route("/login").post(logiUser)
router.route("/logOut").post(verifyToken, logOutUser)
router.route("/refresh- Token").post(refreshAccessToken)

export default router