// api.js
// Client API service to interact with Eaturia backend

/**
 * @typedef {Object} Restaurant
 * @property {string} _id
 * @property {string} name
 * @property {string|null} description
 * @property {string} address
 * @property {string} phone
 * @property {string|null} logo
 * @property {string} priceunit
 * @property {boolean} isActive
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} MenuItem
 * @property {string} _id
 * @property {string} name
 * @property {string} price
 * @property {string} [description]
 * @property {boolean} isActive
 */

/**
 * @typedef {Object} Menu
 * @property {string} _id
 * @property {string} name
 * @property {string} restaurantId
 * @property {MenuItem[]} menuItems
 * @property {string} template
 * @property {boolean} isActive
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} OrderItem
 * @property {string} _id
 * @property {string} name
 * @property {string} [description]
 * @property {string} price
 * @property {string} quantity
 */

/**
 * @typedef {Object} Order
 * @property {string} _id
 * @property {string} customerName
 * @property {string} [customerPhone]
 * @property {string} [tableNumber]
 * @property {string} restaurantId
 * @property {OrderItem[]} items
 * @property {string} total
 * @property {string} status
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} UserAdmin
 * @property {string} _id
 * @property {string} email
 * @property {boolean} isActive
 */

/**
 * @template T
 * @typedef {Object} APIResponse
 * @property {boolean} success - Indicates if the request was successful
 * @property {string} message - Server response message
 * @property {T} [data] - The actual payload returned from the server
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Helper to get auth headers
const getHeaders = () => {
    // Determine how you want to manage the token (e.g., localStorage, context, cookie)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

/**
 * Generic request handler
 * @template T
 * @param {string} endpoint 
 * @param {RequestInit} [options={}] 
 * @returns {Promise<APIResponse<T>>}
 */
const request = async (endpoint, options = {}) => {
    const url = `${BASE_URL}${endpoint}`;
    const headers = getHeaders();
    const config = { ...options, headers: { ...headers, ...options.headers } };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error(`API Error on ${endpoint}:`, error);
        throw error;
    }
};

export const api = {
    // -------------------------
    // Auth Routes (/api/v1/auth)
    // -------------------------
    auth: {
        /**
         * @param {string} email 
         * @param {string} password 
         * @returns {Promise<APIResponse<{ token: string }>>}
         */
        login: (email, password) => request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        })
    },

    // -------------------------
    // Admin Routes (/api/v1/admin)
    // -------------------------
    admin: {
        /**
         * @param {Pick<Restaurant, "name"|"address"|"phone"|"description"|"logo">} data 
         * @returns {Promise<APIResponse<Restaurant>>}
         */
        createRestaurant: (data) => request('/admin/restaurant', {
            method: 'POST',
            body: JSON.stringify(data)
        }),

        /**
         * @param {string} id 
         * @param {string} email 
         * @param {string} password 
         * @returns {Promise<APIResponse<{ id: string }>>}
         */
        createRestaurantAdmin: (id, email, password) => request('/admin/restaurant-admin', {
            method: 'POST',
            body: JSON.stringify({ id, email, password })
        }),

        /**
         * @param {string} id 
         * @param {Partial<Restaurant>} data 
         * @returns {Promise<APIResponse<Restaurant>>}
         */
        updateRestaurant: (id, data) => request(`/admin/restaurant/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),

        /**
         * @param {string} id 
         * @param {boolean} isActive 
         * @returns {Promise<APIResponse<Restaurant>>}
         */
        markRestaurantStatus: (id, isActive) => request(`/admin/restaurant-status/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ isActive })
        }),

        /**
         * @returns {Promise<APIResponse<Restaurant[]>>}
         */
        getRestaurants: () => request('/admin/restaurant-list', {
            method: 'GET'
        }),

        /**
         * @param {string} id 
         * @returns {Promise<APIResponse<Restaurant>>}
         */
        getRestaurantDetails: (id) => request(`/admin/restaurant/${id}`, {
            method: 'GET'
        }),

        /**
         * @param {string} id 
         * @returns {Promise<APIResponse<UserAdmin[]>>}
         */
        getRestaurantAdminList: (id) => request(`/admin/restaurant-admin/${id}`, {
            method: 'GET'
        })
    },

    // -------------------------
    // Public Routes (/api/v1/public)
    // -------------------------
    public: {
        /**
         * @param {Object} data 
         * @param {string} data.customerName
         * @param {string} [data.customerPhone]
         * @param {string} data.restaurantId
         * @param {string} data.menuId
         * @param {Record<string, number>} data.cart - Format: { itemId: quantity }
         * @returns {Promise<APIResponse<Order>>}
         */
        createOrder: (data) => request('/public/order', {
            method: 'POST',
            body: JSON.stringify(data)
        }),

        /**
         * @param {string} id 
         * @returns {Promise<APIResponse<Order>>}
         */
        getOrderDetails: (id) => request(`/public/order/${id}`, {
            method: 'GET'
        }),

        /**
         * @param {string} id 
         * @returns {Promise<APIResponse<Menu>>}
         */
        getRestaurantMenu: (id) => request(`/public/menu/${id}`, {
            method: 'GET'
        })
    },

    // -------------------------
    // Restaurant Routes (/api/v1/restaurant)
    // -------------------------
    restaurant: {
        /**
         * @param {Object} data 
         * @param {string} data.name
         * @param {Omit<MenuItem, "_id"|"isActive">[]} data.menuItems
         * @param {string} [data.template]
         * @returns {Promise<APIResponse<Menu>>}
         */
        createMenu: (data) => request('/restaurant/menu', {
            method: 'POST',
            body: JSON.stringify(data)
        }),

        /**
         * @param {string} id 
         * @param {Partial<Pick<Menu, "name"|"menuItems">>} data 
         * @returns {Promise<APIResponse<Menu>>}
         */
        updateMenu: (id, data) => request(`/restaurant/menu/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),

        /**
         * @param {string} id 
         * @returns {Promise<APIResponse<null>>}
         */
        liveMenu: (id) => request(`/restaurant/menu-live/${id}`, {
            method: 'PUT'
        }),

        /**
         * @param {string} id 
         * @param {string} status 
         * @returns {Promise<APIResponse<null>>}
         */
        updateOrderStatus: (id, status) => request(`/restaurant/order-status/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        }),

        /**
         * @param {string} id 
         * @returns {Promise<APIResponse<null>>}
         */
        deleteMenu: (id) => request(`/restaurant/menu/${id}`, {
            method: 'DELETE'
        }),

        /**
         * @returns {Promise<APIResponse<Pick<Menu, "_id"|"name"|"isActive">[]>>}
         */
        getMenusByRestaurant: () => request('/restaurant/menu-list', {
            method: 'GET'
        }),

        /**
         * @param {string} id 
         * @returns {Promise<APIResponse<Menu>>}
         */
        getMenuById: (id) => request(`/restaurant/menu/${id}`, {
            method: 'GET'
        }),

        /**
         * @returns {Promise<APIResponse<Restaurant>>}
         */
        getRestaurantDetails: () => request('/restaurant/', {
            method: 'GET'
        }),

        /**
         * @returns {Promise<APIResponse<UserAdmin[]>>}
         */
        getRestaurantAdminList: () => request('/restaurant/admin-list', {
            method: 'GET'
        }),

        /**
         * Omit items array based on getOrdersByRestaurant controller projection { items: 0 }
         * @returns {Promise<APIResponse<Omit<Order, "items">[]>>}
         */
        getOrdersByRestaurant: () => request('/restaurant/order-list', {
            method: 'GET'
        }),

        /**
         * Pick items array based on getOrderDetails controller projection { items: 1 }
         * @param {string} id 
         * @returns {Promise<APIResponse<Pick<Order, "_id"|"items">>>}
         */
        getOrderDetails: (id) => request(`/restaurant/order/${id}`, {
            method: 'GET'
        })
    }
};

export default api;
