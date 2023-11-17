const { register } = require("../controllers/agentController");
const { login } = require("../controllers/agentController");
const { setAvatar } = require("../controllers/agentController");
const { getAllUsers } = require("../controllers/agentController");
const { logOut } = require("../controllers/agentController");
const { getAllQueue } = require("../controllers/agentController");

const router = require("express").Router();

router.post("/register", register);
router.post("/login", login);
router.post("/setAvatar/:id", setAvatar);
router.get("/allUsers/:id", getAllUsers);
router.get("/logout/:id", logOut);
router.get("/allQueue", getAllQueue);

module.exports = router;
