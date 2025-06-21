// const axios = require('axios');

// const loginEmployee = async (req, res) => {
//   const { employeeId, email } = req.body;

//   try {
//     const response = await axios.post(
//       'https://script.google.com/macros/s/AKfycbxbG3Zrp8cuGmVMUtH3MB5JIOulR2nZ7dc81d67toYJNIupxuxjtdJAPGYmTgWs9dLT/exec',
//       { employeeId, email }
//     );

//     res.json(response.data); // Return to frontend
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Login failed' });
//   }
// };

// module.exports = { loginEmployee };



const axios = require('axios');

const storeToLocCode = {
  "ZORUCCI EDAPPALLY": "144",
  "Warehouse": "858",
  "SG-Edappally": "702",
  "HEAD OFFICE01": "759",
  "SG-Trivandrum": "700",
  "Z- Edappal": "100",
  "Z.Perinthalmanna": "133",
  "Z.Kottakkal": "122",
  "SUITOR GUY KOTTAYAM": "701",
  "SG.Perumbavoor": "703",
  "SG.Thrissur": "704",
  "SG.Chavakkad": "706",
  "SG.Calicut": "712",
  "SG.Vadakara": "708",
  "SUITOR GUY EDAPPAL": "707",
  "SG.Perinthalmanna": "709",
  "SG.Kottakkal": "711",
  "SG.Manjeri": "710",
  "SG.Palakkad": "705",
  "SG.Kalpetta": "717",
  "SG.Kannur": "716"
};

const loginEmployee = async (req, res) => {
  const { employeeId, password } = req.body;

  try {
    const response = await axios.post(
      'https://rootments.in/api/verify_employee',
      { employeeId, password },
      {
        headers: {
          Authorization: 'Bearer RootX-production-9d17d9485eb772e79df8564004d4a4d4'
        }
      }
    );

    const employeeData = response.data?.data;

    if (!employeeData) {
      return res.status(401).json({ success: false, message: "Invalid credentials from external API" });
    }

    const storeName = employeeData.Store?.trim();
    const cleanedStoreName = storeName?.replace(/\s+$/, '');
    const locCode = storeToLocCode[cleanedStoreName];

    if (!locCode) {
      return res.status(403).json({ success: false, message: `Store "${cleanedStoreName}" not mapped to locCode` });
    }

    res.json({ success: true, data: { ...employeeData, locCode } });

  } catch (error) {
    console.error("❌ Login error:", {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });
    res.status(500).json({ success: false, message: "Login failed internally" });
  }
};

module.exports = { loginEmployee };




// // const axios = require('axios');

// // const storeToLocCode = {
// //   "ZORUCCI EDAPPALLY": "144",
// //   "Warehouse": "858",
// //   "SG-Edappally": "702",
// //   "HEAD OFFICE01": "759",
// //   "SG-Trivandrum": "700",
// //   "Z- Edappal": "100",
// //   "Z.Perinthalmanna": "133",
// //   "Z.Kottakkal": "122",
// //   "SUITOR GUY KOTTAYAM": "701",
// //   "SG.Perumbavoor": "703",
// //   "SG.Thrissur": "704",
// //   "SG.Chavakkad": "706",
//   "SG.Calicut": "712",
//   "SG.Vadakara": "708",
//   "SUITOR GUY EDAPPAL": "707",
//   "SG.Perinthalmanna": "709",
//   "SG.Kottakkal": "711",
//   "SG.Manjeri": "710",
//   "SG.Palakkad": "705",
//   "SG.Kalpetta": "717",
//   "SG.Kannur": "716"
// };

// // ✅ Login Controller
// const loginEmployee = async (req, res) => {
//   const { employeeId, password } = req.body;

//   try {
//     const response = await axios.post(
//       'https://rootments.in/api/verify_employee',
//       { employeeId, password },
//       {
//         headers: {
//           Authorization: 'Bearer RootX-production-9d17d9485eb772e79df8564004d4a4d4'
//         }
//       }
//     );

//     const employeeData = response.data?.data;

//     if (!employeeData) {
//       return res.status(401).json({ success: false, message: "Invalid credentials from external API" });
//     }

//     const storeName = employeeData.Store?.trim();
//     const cleanedStoreName = storeName?.replace(/\s+$/, '');
//     const locCode = storeToLocCode[cleanedStoreName];

//     if (!locCode) {
//       return res.status(403).json({ success: false, message: `Store "${cleanedStoreName}" not mapped to locCode` });
//     }

//     res.json({ success: true, data: { ...employeeData, locCode } });

//   } catch (error) {
//     console.error("❌ Login error:", {
//       message: error.message,
//       response: error.response?.data,
//       stack: error.stack
//     });
//     res.status(500).json({ success: false, message: "Login failed internally" });
//   }
// };

// // ✅ Item Search Controller
// const searchItemByLocCode = async (req, res) => {
//   const { itemCode, locCode } = req.body;

//   if (!itemCode || !locCode) {
//     return res.status(400).json({
//       success: false,
//       message: "Both itemCode and locCode are required",
//     });
//   }

//   try {
//     // Step 1: Fetch from external RMS API
//     const response = await axios.get(
//       'https://rentalapi.rootments.live/api/ItemSearch/GetItemSearch',
//       { params: { itemCode } }
//     );

//     const items = response.data?.dataSet?.data || [];

//     console.log("📦 All API items count:", items.length);

//     // Step 2: Convert locCode back to store name (reverse mapping)
//     const targetStoreName = Object.keys(storeToLocCode).find(
//       (store) => storeToLocCode[store] === locCode
//     )?.trim().toUpperCase();

//     console.log("🔁 Reverse-mapped Store:", targetStoreName);

//     if (!targetStoreName) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid locCode. No matching store name found.",
//       });
//     }

//     // Step 3: Filter by matching store name
//     const filteredItems = items.filter((item) => {
//       const itemStore = (item.Store || '').trim().toUpperCase();
//       return itemStore === targetStoreName;
//     });

//     console.log("✅ Filtered Items:", filteredItems.length);

//     return res.json({
//       success: true,
//       data: filteredItems,
//     });
//   } catch (error) {
//     console.error("❌ Item search failed:", error.message);
//     return res.status(500).json({
//       success: false,
//       message: "Internal error while fetching item data",
//     });
//   }
// };


// module.exports = {
//   loginEmployee,
//   searchItemByLocCode
// };

