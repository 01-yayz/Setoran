// File konfigurasi Custom Emoji ID
// Dapatkan dari bot @ShowJsonBot atau @GetEmojiIDBot

const CE = {
    ID: {
        // Main Menu Icons
        CHANNEL: "5330029353201855267",
        DEV: "5201807652950131889",
        VERSION: "5202167283446727638",
        EDIT: "5422537279400868395",
        CHECK: "5357114585201535226",
        TOOLS: "5260489254244481258",
        SETTINGS: "5422537279400868395",
        ADMIN: "5422537279400868395",
        
        // Email & Deposit
        EMAIL: "5422537279400868395",
        PASSWORD: "5422537279400868395",
        DEPOSIT: "5422537279400868395",
        
        // Status
        SUCCESS: "5422537279400868395",
        ERROR: "5422537279400868395",
        WARNING: "5422537279400868395",
        INFO: "5422537279400868395",
        
        // Actions
        APPROVE: "5422537279400868395",
        REJECT: "5422537279400868395",
        BACK: "5422537279400868395",
        MENU: "5422537279400868395",
        
        // Premium
        STAR: "5422537279400868395",
        HEART: "5422537279400868395",
        CROWN: "5422537279400868395",
        FIRE: "5422537279400868395",
        ROCKET: "5422537279400868395",
        
        // User
        USER: "5422537279400868395",
        ID: "5422537279400868395",
        
        // Money
        MONEY: "5422537279400868395",
        WITHDRAW: "5422537279400868395",
        
        // Referral
        REFERRAL: "5422537279400868395",
        LINK: "5422537279400868395",
        
        // Group
        GROUP: "5422537279400868395",
        
        // Encrypt
        ENCRYPT: "5422537279400868395",
        DECRYPT: "5422537279400868395"
    },
    
    MESSAGE: "🚫 Akses Ditolak!"
};

// Fungsi untuk emoji premium
const e = (id, fallback = "⭐") => `<tg-emoji emoji-id="${id}">${fallback}</tg-emoji>`;

// Style button
const ButtonStyle = {
    PRIMARY: "primary",
    SECONDARY: "secondary",
    SUCCESS: "success",
    DANGER: "danger",
    WARNING: "warning",
    INFO: "info"
};

module.exports = { CE, e, ButtonStyle };