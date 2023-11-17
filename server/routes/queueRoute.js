const router = require("express").Router();
const { addMessage, addUserQueue, pickUserQueue } = require("../controllers/queueController");

router.post("/addMessage/", addMessage);
router.post("/addUser/", addUserQueue);
router.post("/pickUserFromQueue/", pickUserQueue);


module.exports = router;

