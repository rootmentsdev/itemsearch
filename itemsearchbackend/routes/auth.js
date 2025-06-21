// const express = require('express');
// const { loginEmployee } = require('../controllers/authControllers');

// const router = express.Router();

// router.post('/login', loginEmployee);

// module.exports = router; // ✅ VERY IMPORTANT


// routes/apiRoutes.js
// routes/AuthRoutes.js
const express = require('express');
const router = express.Router();
const { loginEmployee, searchItemByLocCode } = require('../controllers/authControllers');

// Login Route
router.post('/login', loginEmployee);

// 🔥 Add this new route
router.post('/search-item', searchItemByLocCode);

module.exports = router;

