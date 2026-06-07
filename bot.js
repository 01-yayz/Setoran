const { Telegraf, Markup } = require('telegraf');
const config = require('./config');
const { CE, e } = require('./CE');
const db = require('./database');

// Inisialisasi bot
const bot = new Telegraf(config.BOT_TOKEN);

// Load database
db.loadData();

// Fungsi untuk membuat custom inline keyboard dengan style dan emoji premium
function createPremiumKeyboard(buttons) {
    const keyboard = [];
    
    for (const row of buttons) {
        const buttonRow = [];
        for (const btn of row) {
            // Format text dengan emoji premium
            const text = btn.emoji_id ? 
                `${e(btn.emoji_id, btn.emoji_fallback || "📌")} ${btn.text}` : 
                btn.text;
            
            if (btn.url) {
                buttonRow.push(Markup.button.url(text, btn.url));
            } else if (btn.callback_data) {
                buttonRow.push(Markup.button.callback(text, btn.callback_data));
            } else if (btn.web_app) {
                buttonRow.push(Markup.button.webApp(text, btn.web_app));
            } else if (btn.login_url) {
                buttonRow.push(Markup.button.login(text, btn.login_url));
            } else if (btn.switch_inline_query) {
                buttonRow.push(Markup.button.switchToCurrentChat(text, btn.switch_inline_query));
            }
        }
        if (buttonRow.length > 0) {
            keyboard.push(buttonRow);
        }
    }
    
    return Markup.inlineKeyboard(keyboard);
}

// Keyboard Utama dengan Emoji Premium & Style
function getMainKeyboard(username, chatId) {
    const buttons = [
        [
            {
                text: 'join channel',
                url: config.CHANNEL_LINK,
                emoji_id: CE.ID.CHANNEL,
                emoji_fallback: "📢",
                style: "danger"
            },
            {
                text: 'creator',
                url: config.CREATOR_LINK,
                emoji_id: CE.ID.DEV,
                emoji_fallback: "👑",
                style: "danger"
            }
        ],
        [
            {
                text: 'setoran',
                callback_data: 'deposit_menu',
                emoji_id: CE.ID.DEPOSIT,
                emoji_fallback: "📩",
                style: "primary"
            }
        ],
        [
            {
                text: 'Referral',
                callback_data: 'referral_menu',
                emoji_id: CE.ID.REFERRAL,
                emoji_fallback: "👥",
                style: "success"
            },
            {
                text: 'owner menu',
                callback_data: 'owner_menu',
                emoji_id: CE.ID.SETTINGS,
                emoji_fallback: "⚙️",
                style: "success"
            }
        ],
        [
            {
                text: 'group menu',
                callback_data: 'group_menu',
                emoji_id: CE.ID.GROUP,
                emoji_fallback: "👥",
                style: "danger"
            }
        ]
    ];
    
    return createPremiumKeyboard(buttons);
}

// Cek keanggotaan channel
async function checkChannelMembership(ctx) {
    try {
        const chatMember = await ctx.telegram.getChatMember(`@${config.CHANNEL_USERNAME}`, ctx.from.id);
        return ['member', 'administrator', 'creator'].includes(chatMember.status);
    } catch (error) {
        return false;
    }
}

// Command /start
bot.start(async (ctx) => {
    const isMember = await checkChannelMembership(ctx);
    
    if (!isMember) {
        const button = [
            [
                {
                    text: 'join channel',
                    url: config.CHANNEL_LINK,
                    emoji_id: CE.ID.CHANNEL,
                    emoji_fallback: "📢",
                    style: "danger"
                }
            ]
        ];
        
        return ctx.reply(
            `<blockquote>⚠️ Akses ditolak! Kamu harus join channel untuk mendapatkan akses!</blockquote>`,
            {
                parse_mode: "HTML",
                ...createPremiumKeyboard(button)
            }
        );
    }

    try {
        db.addUser(ctx.from.id);
        await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');

        const username = ctx.from.username ? `@${ctx.from.username}` : "Tidak Diketahui";
        const chatId = ctx.from.id;
        
        const caption = `${e(CE.ID.CHANNEL, "📩")}<b>Amel x Setoran</b>

${e(CE.ID.DEV, "📩")}<b>creator:</b> ${config.CREATOR_USERNAME}
${e(CE.ID.VERSION, "📩")}<b>version:</b> ${config.BOT_VERSION}
━━━━━━━━━━━━━━━━━━━━━
${e(CE.ID.DEPOSIT, "📩")} Setoran Gmail
━━━━━━━━━━━━━━━━━━━━━
${e(CE.ID.USER, "📩")}<b>username:</b> ${username}
${e(CE.ID.ID, "📩")}<b>user id:</b> ${chatId}
━━━━━━━━━━━━━━━━━━━━━
silahkan pilih fitur di bawah ini yang ingin di gunakan ✧
━━━━━━━━━━━━━━━━━━━━━`;

        setTimeout(async () => {
            await ctx.replyWithPhoto(config.PHOTO_URL, {
                caption: caption,
                parse_mode: "HTML",
                ...getMainKeyboard(username, chatId)
            });
        }, 1000);
        
    } catch (error) {
        console.error("Error saat memulai bot:", error);
        await ctx.reply("❌ Terjadi kesalahan. Silakan coba lagi.");
    }
});

// Menu Deposit
bot.action('deposit_menu', async (ctx) => {
    await ctx.answerCbQuery();
    
    const caption = `${e(CE.ID.DEPOSIT, "📧")} <b>SETOR GMAIL</b>

${e(CE.ID.INFO, "ℹ️")} <b>Syarat & Ketentuan:</b>
${e(CE.ID.CHECK, "✅")} Password WAJIB: <code>${config.REQUIRED_PASSWORD}</code>
${e(CE.ID.CHECK, "✅")} Gmail FRESH (baru dibuat)
${e(CE.ID.CHECK, "✅")} Tidak terverifikasi 2FA
${e(CE.ID.CHECK, "✅")} Tidak terverifikasi nomor HP
${e(CE.ID.CHECK, "✅")} Gmail belum pernah disetor

${e(CE.ID.MONEY, "💰")} <b>Bonus per Gmail:</b> ${db.formatCurrency(config.BONUS_PER_GMAIL)}

${e(CE.ID.EMAIL, "📧")} <b>Format Pengiriman:</b>
<code>Email: contoh@gmail.com
Password: ${config.REQUIRED_PASSWORD}</code>

${e(CE.ID.WARNING, "⚠️")} <i>Setoran akan diproses owner dalam 1x24 jam</i>`;
    
    const backButton = [
        [
            {
                text: 'Kembali ke Menu',
                callback_data: 'back_to_menu',
                emoji_id: CE.ID.BACK,
                emoji_fallback: "🔙",
                style: "secondary"
            }
        ]
    ];
    
    await ctx.editMessageCaption(caption, {
        parse_mode: "HTML",
        ...createPremiumKeyboard(backButton)
    });
});

// Menu Referral
bot.action('referral_menu', async (ctx) => {
    await ctx.answerCbQuery();
    
    const userId = ctx.from.id;
    const referralCount = db.getReferralCount(userId);
    const referralLink = `https://t.me/${ctx.botInfo.username}?start=ref_${userId}`;
    
    const caption = `${e(CE.ID.REFERRAL, "👥")} <b>REFERRAL PROGRAM</b>

${e(CE.ID.GIFT, "🎁")} <b>Dapatkan ${db.formatCurrency(config.BONUS_REFERRAL)} per referral!</b>

${e(CE.ID.LINK, "🔗")} <b>Link Referral Anda:</b>
<code>${referralLink}</code>

${e(CE.ID.STATS, "📊")} <b>Statistik:</b>
${e(CE.ID.USER, "👥")} Total referral: ${referralCount}
${e(CE.ID.MONEY, "💰")} Total bonus: ${db.formatCurrency(referralCount * config.BONUS_REFERRAL)}

${e(CE.ID.INFO, "ℹ️")} <b>Cara Mendapatkan Bonus:</b>
1. Bagikan link referral ke teman
2. Teman klik link dan start bot
3. Bonus otomatis masuk ke saldo Anda!`;
    
    const buttons = [
        [
            {
                text: 'Bagikan Link',
                url: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}`,
                emoji_id: CE.ID.SHARE,
                emoji_fallback: "📤",
                style: "primary"
            }
        ],
        [
            {
                text: 'Kembali ke Menu',
                callback_data: 'back_to_menu',
                emoji_id: CE.ID.BACK,
                emoji_fallback: "🔙",
                style: "secondary"
            }
        ]
    ];
    
    await ctx.editMessageCaption(caption, {
        parse_mode: "HTML",
        ...createPremiumKeyboard(buttons)
    });
});

// Menu Owner
bot.action('owner_menu', async (ctx) => {
    if (ctx.from.id !== config.OWNER_ID) {
        await ctx.answerCbQuery("❌ Menu ini hanya untuk owner!", true);
        return;
    }
    
    await ctx.answerCbQuery();
    
    const pendingCount = Object.keys(db.pendingDeposits).length;
    const totalUsers = db.users.size;
    
    const caption = `${e(CE.ID.ADMIN, "👑")} <b>OWNER MENU</b>

${e(CE.ID.INFO, "ℹ️")} <b>Statistik:</b>
${e(CE.ID.USER, "👥")} Total Users: ${totalUsers}
${e(CE.ID.DEPOSIT, "⏳")} Pending Setoran: ${pendingCount}

${e(CE.ID.MENU, "📋")} <b>Fitur Owner:</b>`;
    
    const buttons = [
        [
            {
                text: 'Lihat Pending Setoran',
                callback_data: 'view_pending',
                emoji_id: CE.ID.CHECK,
                emoji_fallback: "✅",
                style: "primary"
            }
        ],
        [
            {
                text: 'Beri Saldo',
                callback_data: 'give_balance',
                emoji_id: CE.ID.MONEY,
                emoji_fallback: "💰",
                style: "success"
            },
            {
                text: 'Hapus Saldo',
                callback_data: 'remove_balance',
                emoji_id: CE.ID.WITHDRAW,
                emoji_fallback: "💸",
                style: "danger"
            }
        ],
        [
            {
                text: 'Broadcast',
                callback_data: 'broadcast_menu',
                emoji_id: CE.ID.EMAIL,
                emoji_fallback: "📢",
                style: "warning"
            }
        ],
        [
            {
                text: 'Kembali ke Menu',
                callback_data: 'back_to_menu',
                emoji_id: CE.ID.BACK,
                emoji_fallback: "🔙",
                style: "secondary"
            }
        ]
    ];
    
    await ctx.editMessageCaption(caption, {
        parse_mode: "HTML",
        ...createPremiumKeyboard(buttons)
    });
});

// Menu Group
bot.action('group_menu', async (ctx) => {
    await ctx.answerCbQuery();
    
    const caption = `${e(CE.ID.GROUP, "👥")} <b>GROUP MENU</b>

${e(CE.ID.INFO, "ℹ️")} <b>Info Group:</b>
${e(CE.ID.CHANNEL, "📢")} Channel: @${config.CHANNEL_USERNAME}
${e(CE.ID.DEV, "👑")} Creator: ${config.CREATOR_USERNAME}

${e(CE.ID.WARNING, "⚠️")} <i>Join group untuk mendapatkan info terbaru tentang bot!</i>`;
    
    const buttons = [
        [
            {
                text: 'Join Group',
                url: config.CHANNEL_LINK,
                emoji_id: CE.ID.GROUP,
                emoji_fallback: "👥",
                style: "primary"
            }
        ],
        [
            {
                text: 'Kembali ke Menu',
                callback_data: 'back_to_menu',
                emoji_id: CE.ID.BACK,
                emoji_fallback: "🔙",
                style: "secondary"
            }
        ]
    ];
    
    await ctx.editMessageCaption(caption, {
        parse_mode: "HTML",
        ...createPremiumKeyboard(buttons)
    });
});

// Back to main menu
bot.action('back_to_menu', async (ctx) => {
    await ctx.answerCbQuery();
    
    const username = ctx.from.username ? `@${ctx.from.username}` : "Tidak Diketahui";
    const chatId = ctx.from.id;
    
    const caption = `${e(CE.ID.CHANNEL, "📩")}<b>Amel x Setoran</b>

${e(CE.ID.DEV, "📩")}<b>creator:</b> ${config.CREATOR_USERNAME}
${e(CE.ID.VERSION, "📩")}<b>version:</b> ${config.BOT_VERSION}
━━━━━━━━━━━━━━━━━━━━━
${e(CE.ID.DEPOSIT, "📩")} Setoran Gmail
━━━━━━━━━━━━━━━━━━━━━
${e(CE.ID.USER, "📩")}<b>username:</b> ${username}
${e(CE.ID.ID, "📩")}<b>user id:</b> ${chatId}
━━━━━━━━━━━━━━━━━━━━━
silahkan pilih fitur di bawah ini yang ingin di gunakan ✧
━━━━━━━━━━━━━━━━━━━━━`;
    
    await ctx.editMessageCaption(caption, {
        parse_mode: "HTML",
        ...getMainKeyboard(username, chatId)
    });
});

// View pending deposits
bot.action('view_pending', async (ctx) => {
    if (ctx.from.id !== config.OWNER_ID) {
        return ctx.answerCbQuery("❌ Hanya owner!", true);
    }
    
    const pendingList = Object.values(db.pendingDeposits);
    if (pendingList.length === 0) {
        return ctx.reply(`${e(CE.ID.INFO, "ℹ️")} Tidak ada pending deposit.`);
    }
    
    let message = `${e(CE.ID.DEPOSIT, "⏳")} <b>PENDING DEPOSIT</b>\n\n`;
    for (const deposit of pendingList.slice(0, 10)) {
        message += `${e(CE.ID.EMAIL, "📧")} Email: <code>${deposit.email}</code>\n`;
        message += `${e(CE.ID.USER, "👤")} Pengirim: ${deposit.fullName}\n`;
        message += `${e(CE.ID.TIME, "⏰")} Waktu: ${new Date(deposit.timestamp).toLocaleString()}\n\n`;
    }
    
    await ctx.reply(message, { parse_mode: "HTML" });
});

// Handle deposit text messages
bot.on('text', async (ctx) => {
    const text = ctx.message.text;
    
    if (text.startsWith('/')) return;
    
    if (text.includes('@gmail.com') && text.toLowerCase().includes('password')) {
        const isMember = await checkChannelMembership(ctx);
        if (!isMember) {
            return ctx.reply("❌ Anda harus join channel terlebih dahulu!");
        }
        
        const emailMatch = text.match(/([a-zA-Z0-9._-]+@gmail\.com)/i);
        const passwordMatch = text.match(/password[:\s]+(\S+)/i);
        
        if (!emailMatch || !passwordMatch) {
            return ctx.reply(
                `${e(CE.ID.ERROR, "❌")} <b>FORMAT SALAH!</b>\n\n` +
                `Format yang benar:\n` +
                `<code>Email: email@gmail.com\nPassword: ${config.REQUIRED_PASSWORD}</code>`,
                { parse_mode: "HTML" }
            );
        }
        
        const email = emailMatch[1];
        const password = passwordMatch[1];
        
        if (password !== config.REQUIRED_PASSWORD) {
            return ctx.reply(
                `${e(CE.ID.ERROR, "❌")} <b>PASSWORD SALAH!</b>\n\n` +
                `Password harus: <code>${config.REQUIRED_PASSWORD}</code>\n` +
                `Password Anda: <code>${password}</code>`,
                { parse_mode: "HTML" }
            );
        }
        
        const existingDeposit = Object.values(db.completedDeposits).find(d => d.email === email);
        if (existingDeposit) {
            return ctx.reply(
                `${e(CE.ID.ERROR, "❌")} <b>GMAIL SUDAH PERNAH DISETOR!</b>\n\n` +
                `Email: ${email}`,
                { parse_mode: "HTML" }
            );
        }
        
        const depositId = Date.now().toString();
        db.pendingDeposits[depositId] = {
            id: depositId,
            userId: ctx.from.id,
            email: email,
            password: password,
            username: ctx.from.username,
            fullName: ctx.from.first_name,
            timestamp: new Date().toISOString(),
            status: 'pending'
        };
        db.saveData();
        
        const approveRejectButtons = [
            [
                {
                    text: 'Terima',
                    callback_data: `approve_${depositId}`,
                    emoji_id: CE.ID.APPROVE,
                    emoji_fallback: "✅",
                    style: "success"
                },
                {
                    text: 'Tolak',
                    callback_data: `reject_${depositId}`,
                    emoji_id: CE.ID.REJECT,
                    emoji_fallback: "❌",
                    style: "danger"
                }
            ]
        ];
        
        await bot.telegram.sendMessage(
            config.OWNER_ID,
            `${e(CE.ID.DEPOSIT, "📨")} <b>PENDING SETORAN BARU!</b>\n\n` +
            `${e(CE.ID.EMAIL, "📧")} Email: <code>${email}</code>\n` +
            `${e(CE.ID.LOCK, "🔒")} Password: <code>${password}</code>\n` +
            `${e(CE.ID.USER, "👤")} Pengirim: ${ctx.from.first_name} (@${ctx.from.username || 'no username'})\n` +
            `${e(CE.ID.ID, "🆔")} User ID: <code>${ctx.from.id}</code>\n` +
            `${e(CE.ID.TIME, "⏰")} Waktu: ${new Date().toLocaleString('id-ID')}`,
            {
                parse_mode: "HTML",
                ...createPremiumKeyboard(approveRejectButtons)
            }
        );
        
        await ctx.reply(
            `${e(CE.ID.SUCCESS, "✅")} <b>SETORAN DIKIRIM KE OWNER!</b>\n\n` +
            `Email: <code>${email}</code>\n\n` +
            `Status: Menunggu persetujuan owner\n\n` +
            `Owner akan memproses setoran Anda dalam waktu dekat.`,
            { parse_mode: "HTML" }
        );
    }
});

// Approve deposit
bot.action(/approve_(.+)/, async (ctx) => {
    if (ctx.from.id !== config.OWNER_ID) {
        return ctx.answerCbQuery("❌ Hanya owner!", true);
    }
    
    const depositId = ctx.match[1];
    const deposit = db.pendingDeposits[depositId];
    
    if (!deposit) {
        return ctx.answerCbQuery("Deposit tidak ditemukan!");
    }
    
    db.updateBalance(deposit.userId, config.BONUS_PER_GMAIL, 'add');
    
    db.completedDeposits[depositId] = {
        ...deposit,
        status: 'approved',
        approvedBy: ctx.from.id,
        approvedAt: new Date().toISOString(),
        amount: config.BONUS_PER_GMAIL
    };
    
    delete db.pendingDeposits[depositId];
    db.saveData();
    
    await bot.telegram.sendMessage(
        deposit.userId,
        `${e(CE.ID.SUCCESS, "✅")} <b>SETORAN DITERIMA!</b>\n\n` +
        `Email: <code>${deposit.email}</code>\n` +
        `Bonus: ${db.formatCurrency(config.BONUS_PER_GMAIL)}\n\n` +
        `Saldo Anda sekarang: ${db.formatCurrency(db.getBalance(deposit.userId))}`,
        { parse_mode: "HTML" }
    );
    
    await ctx.answerCbQuery("✅ Setoran diterima!");
    await ctx.deleteMessage();
});

// Reject deposit
bot.action(/reject_(.+)/, async (ctx) => {
    if (ctx.from.id !== config.OWNER_ID) {
        return ctx.answerCbQuery("❌ Hanya owner!", true);
    }
    
    const depositId = ctx.match[1];
    const deposit = db.pendingDeposits[depositId];
    
    if (!deposit) {
        return ctx.answerCbQuery("Deposit tidak ditemukan!");
    }
    
    delete db.pendingDeposits[depositId];
    db.saveData();
    
    await bot.telegram.sendMessage(
        deposit.userId,
        `${e(CE.ID.ERROR, "❌")} <b>SETORAN DITOLAK!</b>\n\n` +
        `Email: <code>${deposit.email}</code>\n\n` +
        `Alasan: Gmail tidak memenuhi syarat yang ditentukan.\n\n` +
        `Silahkan setor gmail lain yang memenuhi syarat.`,
        { parse_mode: "HTML" }
    );
    
    await ctx.answerCbQuery("❌ Setoran ditolak!");
    await ctx.deleteMessage();
});

// Error handler
bot.catch((err, ctx) => {
    console.error("Bot error:", err);
    ctx.reply("❌ Terjadi kesalahan. Silakan coba lagi.").catch(() => {});
});

// Start bot
bot.launch().then(() => {
    console.log(`✅ Bot ${config.BOT_NAME} v${config.BOT_VERSION} started!`);
    console.log(`📢 Channel: @${config.CHANNEL_USERNAME}`);
    console.log(`👑 Owner ID: ${config.OWNER_ID}`);
}).catch(err => {
    console.error("Failed to start bot:", err);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));