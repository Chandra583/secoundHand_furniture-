const crypto = require('crypto');

const helpers = {
  // Generate random string
  generateRandomString: (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
  },

  // Format price
  formatPrice: (price) => {
    return Number(price).toFixed(2);
  },

  // Calculate total price
  calculateTotal: (items) => {
    return items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  },

  // Generate order reference
  generateOrderReference: () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  },

  // Format date
  formatDate: (date) => {
    return new Date(date).toISOString();
  },

  // Sanitize object (remove undefined and null values)
  sanitizeObject: (obj) => {
    return Object.entries(obj)
      .reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value;
        }
        return acc;
      }, {});
  },

  // Paginate results
  paginateResults: ({ page = 1, limit = 10, total }) => {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      currentPage: page,
      totalPages,
      totalItems: total,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null,
    };
  },

  // Deep clone object
  deepClone: (obj) => {
    return JSON.parse(JSON.stringify(obj));
  },

  // Check if object is empty
  isEmpty: (obj) => {
    return Object.keys(obj).length === 0;
  },

  // Convert string to slug
  toSlug: (str) => {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  // Parse sort string to mongoose sort object
  parseSort: (sortString) => {
    if (!sortString) return { createdAt: -1 };
    
    return sortString.split(',').reduce((acc, item) => {
      const [field, order] = item.split(':');
      acc[field] = order === 'desc' ? -1 : 1;
      return acc;
    }, {});
  },
};

module.exports = helpers; 