const fs = require('fs');

// Database collections
let users = new Set();
let userBalances = {};
let userReferrals = {};
let pendingDeposits = {};
let completedDeposits = {};

// Load data from files
function loadData() {
    try {
        if (fs.existsSync('users.json')) {
            const usersData = JSON.parse(fs.readFileSync('users.json', 'utf8'));
            users = new Set(usersData);
        }
        if (fs.existsSync('balances.json')) {
            userBalances = JSON.parse(fs.readFileSync('balances.json', 'utf8'));
        }
        if (fs.existsSync('referrals.json')) {
            userReferrals = JSON.parse(fs.readFileSync('referrals.json', 'utf8'));
        }
        if (fs.existsSync('pending.json')) {
            pendingDeposits = JSON.parse(fs.readFileSync('pending.json', 'utf8'));
        }
        if (fs.existsSync('completed.json')) {
            completedDeposits = JSON.parse(fs.readFileSync('completed.json', 'utf8'));
        }
        console.log('✅ Data loaded successfully');
    } catch (error) {
        console.log('⚠️ Error loading data:', error.message);
    }
}

// Save data to files
function saveData() {
    try {
        fs.writeFileSync('users.json', JSON.stringify([...users], null, 2));
        fs.writeFileSync('balances.json', JSON.stringify(userBalances, null, 2));
        fs.writeFileSync('referrals.json', JSON.stringify(userReferrals, null, 2));
        fs.writeFileSync('pending.json', JSON.stringify(pendingDeposits, null, 2));
        fs.writeFileSync('completed.json', JSON.stringify(completedDeposits, null, 2));
        return true;
    } catch (error) {
        console.log('❌ Error saving data:', error.message);
        return false;
    }
}

// Add user
function addUser(userId) {
    users.add(userId);
    if (!userBalances[userId]) {
        userBalances[userId] = 0;
    }
    if (!userReferrals[userId]) {
        userReferrals[userId] = [];
    }
    saveData();
}

// Get user balance
function getBalance(userId) {
    return userBalances[userId] || 0;
}

// Update user balance
function updateBalance(userId, amount, type = 'add') {
    if (!userBalances[userId]) {
        userBalances[userId] = 0;
    }
    
    if (type === 'add') {
        userBalances[userId] += amount;
    } else if (type === 'subtract') {
        if (userBalances[userId] >= amount) {
            userBalances[userId] -= amount;
            return true;
        }
        return false;
    }
    saveData();
    return true;
}

// Add referral
function addReferral(userId, referrerId) {
    if (!userReferrals[referrerId]) {
        userReferrals[referrerId] = [];
    }
    if (!userReferrals[referrerId].includes(userId)) {
        userReferrals[referrerId].push(userId);
        saveData();
        return true;
    }
    return false;
}

// Get referral count
function getReferralCount(userId) {
    return userReferrals[userId]?.length || 0;
}

// Format currency
function formatCurrency(amount) {
    return `Rp ${amount.toLocaleString('id-ID')}`;
}

module.exports = {
    loadData,
    saveData,
    addUser,
    getBalance,
    updateBalance,
    addReferral,
    getReferralCount,
    userBalances,
    userReferrals,
    pendingDeposits,
    completedDeposits
};