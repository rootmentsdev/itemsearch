const axios = require('axios');

// ✅ Item Search Controller
const searchItem = async (req, res) => {
  let { itemCode, locationId } = req.query;

  // Normalize itemCode - trim whitespace
  itemCode = itemCode ? itemCode.trim() : '';

  console.log('🔍 Item Search Request:', { itemCode, locationId });

  try {
    // Try multiple case variations to handle case sensitivity issues
    // Scenario: API has "Ab1SkUMnO12", scanner reads "AB1SKUMNO12"
    const lowerCode = itemCode.toLowerCase();
    const upperCode = itemCode.toUpperCase();
    let response = null;
    let hasData = false;
    
    // Try 1: Original case (e.g., "AB1SKUMNO12")
    try {
      response = await axios.get(
        'https://rentalapi.rootments.live/api/ItemSearch/GetItemSearch',
        {
          params: { itemCode, locationId },
          timeout: 10000 // 10 second timeout
        }
      );
      hasData = response.data?.dataSet?.data?.length > 0;
    } catch (err) {
      // Continue to next variation
    }
    
    // Try 2: Lowercase (e.g., "ab1skumno12")
    if (!hasData && itemCode !== lowerCode) {
      try {
        const lowerResponse = await axios.get(
          'https://rentalapi.rootments.live/api/ItemSearch/GetItemSearch',
          {
            params: { itemCode: lowerCode, locationId },
            timeout: 10000
          }
        );
        if (lowerResponse.data?.dataSet?.data?.length > 0) {
          response = lowerResponse;
          hasData = true;
        }
      } catch (lowerError) {
        // Continue to next variation
      }
    }
    
    // Try 3: Uppercase (e.g., "AB1SKUMNO12") - might be same as original
    if (!hasData && itemCode !== upperCode && lowerCode !== upperCode) {
      try {
        const upperResponse = await axios.get(
          'https://rentalapi.rootments.live/api/ItemSearch/GetItemSearch',
          {
            params: { itemCode: upperCode, locationId },
            timeout: 10000
          }
        );
        if (upperResponse.data?.dataSet?.data?.length > 0) {
          response = upperResponse;
          hasData = true;
        }
      } catch (upperError) {
        // Continue with whatever response we have
      }
    }
    
    // If we still don't have a response, use the first one (even if empty)
    if (!response) {
      response = await axios.get(
        'https://rentalapi.rootments.live/api/ItemSearch/GetItemSearch',
        {
          params: { itemCode, locationId },
          timeout: 10000
        }
      );
    }

    console.log('✅ Item Search API Response Status:', response.status);
    console.log('✅ Item Search Response Data Keys:', Object.keys(response.data || {}));
    
    // Log the structure to understand better
    if (response.data?.dataSet?.data) {
      console.log(`✅ Item Search found ${response.data.dataSet.data.length} items`);
    } else {
      console.log('⚠️ Item Search response structure:', JSON.stringify(response.data, null, 2).substring(0, 500));
    }
    
    res.json(response.data);
  } catch (error) {
    console.error('❌ Item Search error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    res.status(500).json({
      status: 'error',
      message: 'Item search failed.',
      debug: {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      },
    });
  }
};

// ✅ Item Report Controller (Get All Items)
const getAllItems = async (req, res) => {
  const { LocationID, UserID } = req.body;

  console.log('📊 Item Report Request Body:', req.body);
  console.log('📊 Item Report Request:', { LocationID, UserID });

  try {
    const response = await axios.post(
      'https://rentalapi.rootments.live/api/Reports/GetItemReport',
      {
        LocationID,
        UserID
      }
    );

    console.log('✅ Item Report API Response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('❌ Item Report error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    res.status(500).json({
      status: 'error',
      message: 'Item report failed.',
      debug: {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      },
    });
  }
};

module.exports = { searchItem, getAllItems };
