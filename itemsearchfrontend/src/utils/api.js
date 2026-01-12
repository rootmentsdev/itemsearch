import axios from 'axios';

const BASE_URL = 'https://itemsearch-q30k.onrender.com/api'; // your backend base URL

// 🚀 Performance: Result cache to avoid redundant API calls
const searchCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// Helper to get cache key
const getCacheKey = (itemCode, locationId) => `${itemCode}_${locationId}`;

// Helper to check if cache is valid
const isCacheValid = (cachedData) => {
  if (!cachedData) return false;
  return Date.now() - cachedData.timestamp < CACHE_DURATION;
};

// 🔐 Employee Login API (through your backend) - Ultra-fast login <5s
export const loginEmployee = (employeeId, password) => {
  return axios.post(`${BASE_URL}/auth/login`, {
    employeeId,
    password
  }, {
    timeout: 6000, // 6 second timeout (4s backend + 2s buffer) - ensures <5s user experience
  });
};

// 📊 Save Scan Activity API
export const saveScanActivity = (scanData) => {
  return axios.post(`${BASE_URL}/scan-activity`, scanData, {
    timeout: 2000, // Reduced to 2 seconds - tracking shouldn't block user experience
  });
};






// export const searchItem = (itemCode, locationId) => {
//   return axios.get('https://rentalapi.rootments.live/api/ItemSearch/GetItemSearch', {
//     params: { itemCode, locationId },
//   });
// };



// ✅ Original GetItemSearch API (through local backend) - Optimized with faster timeout
export const searchItem = (itemCode, locationId) => {
  return axios.get(`${BASE_URL}/item-search`, {
    params: { itemCode, locationId },
    timeout: 5000, // Reduced to 5 seconds for faster failure
  });
};

// ✅ GetItemReport API (through local backend) - Optimized with faster timeout
export const getAllItems = (locationId, userId) => {
  return axios.post(`${BASE_URL}/item-report`, {
    LocationID: locationId,
    UserID: userId
  }, {
    timeout: 5000, // Reduced to 5 seconds for faster failure
  });
};

// ✅ Optimized Fallback search function with caching and faster failure
export const searchItemWithFallback = async (itemCode, locationId) => {
  const normalizedCode = itemCode.trim();
  const cacheKey = getCacheKey(normalizedCode, locationId);
  
  // 🚀 Check cache first
  const cached = searchCache.get(cacheKey);
  if (isCacheValid(cached)) {
    console.log('✅ Using cached result for:', normalizedCode);
    return cached.data;
  }
  
  try {
    // Try the original GetItemSearch API first with Promise.race for faster timeout
    const searchPromise = searchItem(normalizedCode, locationId);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Search timeout')), 4000)
    );
    
    let searchResponse;
    try {
      searchResponse = await Promise.race([searchPromise, timeoutPromise]);
    } catch (raceError) {
      // If timeout or error, skip to fallback
      throw new Error('Primary search failed or timed out');
    }
    
    const searchData = searchResponse.data?.dataSet?.data || [];
    
    // If we found data, cache and return it immediately
    if (searchData.length > 0) {
      const result = {
        data: {
          dataSet: { data: searchData },
          status: true,
          errorDescription: '',
          apiUsed: 'GetItemSearch'
        }
      };
      
      // Cache the result
      searchCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      return result;
    }
    
    // If no data found, try the fallback API (but with faster timeout)
    const userId = localStorage.getItem('userId') || '7777';
    const formattedLocationId = locationId.toString().padStart(2, '0');
    
    const reportPromise = getAllItems(formattedLocationId, userId);
    const fallbackTimeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Fallback timeout')), 4000)
    );
    
    let reportResponse;
    try {
      reportResponse = await Promise.race([reportPromise, fallbackTimeoutPromise]);
    } catch (fallbackError) {
      // If fallback also fails, return empty result
      return {
        data: {
          dataSet: { data: [] },
          status: false,
          errorDescription: 'Both search methods failed or timed out',
          apiUsed: 'Error'
        }
      };
    }
    
    // Check if response.data is an array - optimized parsing
    let allItems = [];
    if (Array.isArray(reportResponse.data)) {
      allItems = reportResponse.data;
    } else if (reportResponse.data?.data && Array.isArray(reportResponse.data.data)) {
      allItems = reportResponse.data.data;
    } else if (reportResponse.data?.dataSet?.data && Array.isArray(reportResponse.data.dataSet.data)) {
      allItems = reportResponse.data.dataSet.data;
    }
    
    // Filter results by itemCode (case-insensitive, trimmed) - optimized
    const normalizedItemCode = normalizedCode.toLowerCase();
    const filteredData = allItems.filter(item => {
      if (!item) return false;
      const itemCodeValue = (item.itemcode || item.ItemCode || '').toString().trim().toLowerCase();
      return itemCodeValue === normalizedItemCode;
    });
    
    // Map GetItemReport fields to existing table structure - optimized
    const mappedData = filteredData.map(item => ({
      deliveryDate: item.deliveryDate || null,
      bookingDate: item.bookingDate || null,
      returnDate: item.returnDate || null,
      description: item.description || item.itemName || '-',
      customerName: item.customerName || '-',
      phoneNo: item.phoneNo || '-',
      itemcode: item.itemcode,
      itemName: item.itemName,
      itemCount: item.itemCount,
      price: item.price,
      location: item.location,
      category: item.category,
      subCategory: item.subCategory,
      createdBy: item.createdBy,
      createdOn: item.createdOn,
      ...item
    }));
    
    const result = {
      data: {
        dataSet: { data: mappedData },
        status: true,
        errorDescription: '',
        apiUsed: 'GetItemReport'
      }
    };
    
    // Cache the result
    searchCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    return result;
    
  } catch (error) {
    console.error('Search error:', error.message);
    
    // Return empty result instead of throwing to prevent app crash
    return {
      data: {
        dataSet: { data: [] },
        status: false,
        errorDescription: error.message,
        apiUsed: 'Error'
      }
    };
  }
};

// 🧹 Clear cache function (optional - can be called periodically)
export const clearSearchCache = () => {
  searchCache.clear();
};
