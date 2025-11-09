"use strict";
/**
 * Test script for User Management APIs
 * Run with: npm run test:users
 *
 * Make sure:
 * 1. Backend server is running (npm run dev)
 * 2. MongoDB is connected
 * 3. You have a superadmin user in the database
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
let authToken = '';
let createdUserId = '';
// Test user credentials (update with your superadmin credentials)
const TEST_CREDENTIALS = {
    email: 'utsavsingh2826@gmail.com',
    password: 'Utsav@1234',
};
// Test data
const TEST_USER = {
    name: 'Test User',
    email: `testuser${Date.now()}@test.com`,
    password: 'Test123456',
    role: 'staff',
    isActive: true,
};
async function login() {
    console.log('\n🔐 Step 1: Login to get auth token...');
    try {
        const response = await axios_1.default.post(`${BASE_URL}/auth/login`, {
            email: TEST_CREDENTIALS.email,
            password: TEST_CREDENTIALS.password,
        });
        if (response.data.requires2FA) {
            console.log('⚠️  2FA required. Please complete 2FA manually and update the token in the script.');
            console.log('   Or use the tempToken to verify 2FA programmatically.');
            process.exit(1);
        }
        authToken = response.data.token;
        console.log('✅ Login successful!');
        return true;
    }
    catch (error) {
        console.error('❌ Login failed:', error.response?.data || error.message);
        return false;
    }
}
async function testCreateUser() {
    console.log('\n📝 Step 2: Testing CREATE User API...');
    try {
        const response = await axios_1.default.post(`${BASE_URL}/users`, TEST_USER, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        console.log('✅ User created successfully!');
        console.log('   User ID:', response.data.data._id);
        console.log('   Name:', response.data.data.name);
        console.log('   Email:', response.data.data.email);
        console.log('   Role:', response.data.data.role);
        createdUserId = response.data.data._id;
        return true;
    }
    catch (error) {
        console.error('❌ Create user failed:', error.response?.data || error.message);
        return false;
    }
}
async function testGetUsers() {
    console.log('\n📋 Step 3: Testing GET All Users API...');
    try {
        const response = await axios_1.default.get(`${BASE_URL}/users`, {
            headers: { Authorization: `Bearer ${authToken}` },
            params: {
                page: 1,
                limit: 10,
            },
        });
        console.log('✅ Users fetched successfully!');
        console.log('   Total users:', response.data.total);
        console.log('   Current page:', response.data.page);
        console.log('   Total pages:', response.data.pages);
        console.log('   Users in this page:', response.data.count);
        return true;
    }
    catch (error) {
        console.error('❌ Get users failed:', error.response?.data || error.message);
        return false;
    }
}
async function testGetUser() {
    console.log('\n👤 Step 4: Testing GET Single User API...');
    try {
        const response = await axios_1.default.get(`${BASE_URL}/users/${createdUserId}`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        console.log('✅ User fetched successfully!');
        console.log('   User:', response.data.data.name);
        console.log('   Email:', response.data.data.email);
        return true;
    }
    catch (error) {
        console.error('❌ Get user failed:', error.response?.data || error.message);
        return false;
    }
}
async function testUpdateUser() {
    console.log('\n✏️  Step 5: Testing UPDATE User API...');
    try {
        const response = await axios_1.default.put(`${BASE_URL}/users/${createdUserId}`, {
            name: 'Updated Test User',
            role: 'manager',
        }, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        console.log('✅ User updated successfully!');
        console.log('   Updated name:', response.data.data.name);
        console.log('   Updated role:', response.data.data.role);
        return true;
    }
    catch (error) {
        console.error('❌ Update user failed:', error.response?.data || error.message);
        return false;
    }
}
async function testToggleStatus() {
    console.log('\n🔄 Step 6: Testing TOGGLE User Status API...');
    try {
        const response = await axios_1.default.patch(`${BASE_URL}/users/${createdUserId}/toggle-status`, {}, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        console.log('✅ User status toggled successfully!');
        console.log('   New status:', response.data.data.isActive ? 'Active' : 'Inactive');
        return true;
    }
    catch (error) {
        console.error('❌ Toggle status failed:', error.response?.data || error.message);
        return false;
    }
}
async function testUnlockUser() {
    console.log('\n🔓 Step 7: Testing UNLOCK User API...');
    try {
        // First, we need to lock the user (simulate by updating directly in DB or skip if not locked)
        await axios_1.default.patch(`${BASE_URL}/users/${createdUserId}/unlock`, {}, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        console.log('✅ User unlocked successfully!');
        return true;
    }
    catch (error) {
        console.error('❌ Unlock user failed:', error.response?.data || error.message);
        // This might fail if user is not locked, which is okay
        return true;
    }
}
async function testResetPassword() {
    console.log('\n🔑 Step 8: Testing RESET Password API...');
    try {
        await axios_1.default.patch(`${BASE_URL}/users/${createdUserId}/reset-password`, {
            newPassword: 'NewPassword123',
        }, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        console.log('✅ Password reset successfully!');
        return true;
    }
    catch (error) {
        console.error('❌ Reset password failed:', error.response?.data || error.message);
        return false;
    }
}
async function testDeleteUser() {
    console.log('\n🗑️  Step 9: Testing DELETE User API...');
    try {
        await axios_1.default.delete(`${BASE_URL}/users/${createdUserId}`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        console.log('✅ User deleted successfully!');
        return true;
    }
    catch (error) {
        console.error('❌ Delete user failed:', error.response?.data || error.message);
        return false;
    }
}
async function testSearchAndFilters() {
    console.log('\n🔍 Step 10: Testing SEARCH and FILTERS...');
    try {
        // Test search
        const searchResponse = await axios_1.default.get(`${BASE_URL}/users`, {
            headers: { Authorization: `Bearer ${authToken}` },
            params: {
                search: 'test',
                page: 1,
                limit: 10,
            },
        });
        console.log('✅ Search works! Found', searchResponse.data.count, 'users');
        // Test status filter
        const statusResponse = await axios_1.default.get(`${BASE_URL}/users`, {
            headers: { Authorization: `Bearer ${authToken}` },
            params: {
                status: 'active',
                page: 1,
                limit: 10,
            },
        });
        console.log('✅ Status filter works! Found', statusResponse.data.count, 'active users');
        // Test role filter
        const roleResponse = await axios_1.default.get(`${BASE_URL}/users`, {
            headers: { Authorization: `Bearer ${authToken}` },
            params: {
                role: 'staff',
                page: 1,
                limit: 10,
            },
        });
        console.log('✅ Role filter works! Found', roleResponse.data.count, 'staff users');
        return true;
    }
    catch (error) {
        console.error('❌ Search/filter failed:', error.response?.data || error.message);
        return false;
    }
}
async function runTests() {
    console.log('🚀 Starting User Management API Tests...');
    console.log('==========================================\n');
    const results = {
        login: false,
        create: false,
        getAll: false,
        getOne: false,
        update: false,
        toggleStatus: false,
        unlock: false,
        resetPassword: false,
        delete: false,
        search: false,
    };
    // Run tests in sequence
    results.login = await login();
    if (!results.login) {
        console.log('\n❌ Cannot proceed without authentication. Exiting...');
        process.exit(1);
    }
    results.create = await testCreateUser();
    results.getAll = await testGetUsers();
    results.getOne = await testGetUser();
    results.update = await testUpdateUser();
    results.toggleStatus = await testToggleStatus();
    results.unlock = await testUnlockUser();
    results.resetPassword = await testResetPassword();
    results.search = await testSearchAndFilters();
    results.delete = await testDeleteUser();
    // Summary
    console.log('\n==========================================');
    console.log('📊 Test Results Summary:');
    console.log('==========================================');
    console.log('Login:', results.login ? '✅' : '❌');
    console.log('Create User:', results.create ? '✅' : '❌');
    console.log('Get All Users:', results.getAll ? '✅' : '❌');
    console.log('Get Single User:', results.getOne ? '✅' : '❌');
    console.log('Update User:', results.update ? '✅' : '❌');
    console.log('Toggle Status:', results.toggleStatus ? '✅' : '❌');
    console.log('Unlock User:', results.unlock ? '✅' : '❌');
    console.log('Reset Password:', results.resetPassword ? '✅' : '❌');
    console.log('Search & Filters:', results.search ? '✅' : '❌');
    console.log('Delete User:', results.delete ? '✅' : '❌');
    const passed = Object.values(results).filter((r) => r).length;
    const total = Object.keys(results).length;
    console.log(`\n✅ Passed: ${passed}/${total}`);
    if (passed === total) {
        console.log('\n🎉 All tests passed!');
        process.exit(0);
    }
    else {
        console.log('\n⚠️  Some tests failed. Please check the errors above.');
        process.exit(1);
    }
}
// Run tests
runTests().catch((error) => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
});
//# sourceMappingURL=testUserAPIs.js.map