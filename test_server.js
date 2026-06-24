require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;
const WEBAPP_URL = process.env.WEBAPP_URL;

if (!BOT_TOKEN) {
  console.error('FATAL ERROR: BOT_TOKEN is not defined in environment variables.');
  process.exit(1);
}

if (!ADMIN_ID) {
  console.error('FATAL ERROR: ADMIN_ID is not defined in environment variables.');
  process.exit(1);
}

// Telegraf Bot Setup
const bot = new Telegraf(BOT_TOKEN);

// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Multer setup for handling file uploads (max 10MB)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Helper function to verify Telegram Web App initData
function verifyTelegramInitData(initData, token) {
  // Development mode bypass helper
  if (process.env.NODE_ENV === 'development') {
    if (initData === 'mock_admin') {
      return { id: parseInt(ADMIN_ID), first_name: 'Dev Admin', username: 'dev_admin' };
    }
    if (initData && initData.startsWith('mock_student_')) {
      const parts = initData.split('_');
      const studentId = parseInt(parts[2] || '99999');
      const slug = parts[3] || 'may';
      return { id: studentId, first_name: 'Dev Student', username: 'dev_student', slug };
    }
  }

  if (!initData) return false;

  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return false;

    params.delete('hash');

    // Sort params alphabetically
    const keys = Array.from(params.keys()).sort();
    const dataCheckString = keys
      .map(key => `${key}=${params.get(key)}`)
      .join('\n');

    // Create secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(token)
      .digest();

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) return false;

    // Check expiration (24 hours)
    const authDate = parseInt(params.get('auth_date'), 10);
    if (isNaN(authDate)) return false;
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime - authDate > 86400) {
      console.warn('Telegram initData signature expired');
      return false;
    }

    const userJSON = params.get('user');
    return userJSON ? JSON.parse(userJSON) : {};
  } catch (error) {
    console.error('Error validating Telegram initData:', error);
    return false;
  }
}

// Authentication Middleware
app.use((req, res, next) => {
  // Check auth using header X-Telegram-Init-Data
  const initData = req.headers['x-telegram-init-data'];
  if (initData) {
    const tgUser = verifyTelegramInitData(initData, BOT_TOKEN);
    if (tgUser) {
      req.tgUser = tgUser;
    }
  }
  next();
});

// Admin-only Access Middleware
function requireAdmin(req, res, next) {
  if (!req.tgUser || String(req.tgUser.id) !== String(ADMIN_ID)) {
    return res.status(403).json({ error: 'Ruxsat berilmagan: Faqat admin uchun!' });
  }
  next();
}

// Helper to generate a clean, safe slug
function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/o’/g, 'o')
    .replace(/o'/g, 'o')
    .replace(/g’/g, 'g')
    .replace(/g'/g, 'g')
    .replace(/sh/g, 'sh')
    .replace(/ch/g, 'ch')
    .replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric with -
    .replace(/-+/g, '-')        // Remove duplicate hyphens
    .replace(/^-+/, '')         // Trim from start
    .replace(/-+$/, '');        // Trim from end
}

// API ENDPOINTS

// 1. Submit a new question (Student)
app.post('/api/question', (req, res) => {
  if (!req.tgUser) {
    return res.status(401).json({ error: 'Telegram orqali avtorizatsiya talab qilinadi' });
  }

  const { group_slug, question_text } = req.body;
  if (!group_slug || !question_text || question_text.trim() === '') {
    return res.status(400).json({ error: 'Guruh kodi va savol matni to\'ldirilishi shart' });
  }

  const group = db.getGroupActiveBySlug(group_slug);
  if (!group) {
    return res.status(404).json({ error: 'Faol guruh topilmadi yoki bu guruh o\'chirilgan' });
  }

  try {
    db.addQuestion(
      group.id,
      req.tgUser.id,
      req.tgUser.username || null,
      req.tgUser.first_name || 'Foydalanuvchi',
      question_text.trim()
    );
    res.json({ success: true, message: 'Savolingiz muvaffaqiyatli qabul qilindi!' });
  } catch (error) {
    console.error('Error saving question:', error);
    res.status(500).json({ error: 'Savolni saqlashda xatolik yuz berdi' });
  }
});

// 2. Get active groups + pending count (Admin)
app.get('/api/admin/groups', requireAdmin, (req, res) => {
  try {
    const groups = db.getAllGroupsWithPendingCount();
    res.json({ success: true, groups });
  } catch (error) {
    console.error('Error fetching admin groups:', error);
    res.status(500).json({ error: 'Guruhlarni yuklashda xatolik' });
  }
});

// 3. Get pending questions for a group (Admin)
app.get('/api/admin/questions/:groupId', requireAdmin, (req, res) => {
  const groupId = parseInt(req.params.groupId);
  if (isNaN(groupId)) {
    return res.status(400).json({ error: 'Noto\'g\'ri guruh ID' });
  }

  try {
    const questions = db.getQuestionsByGroupId(groupId);
    res.json({ success: true, questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Savollarni yuklashda xatolik' });
  }
});

// 4. Send answer back to student (Admin)
app.post('/api/admin/answer', requireAdmin, upload.single('file'), async (req, res) => {
  const { question_id, answer_text } = req.body;
  if (!question_id) {
    return res.status(400).json({ error: 'Savol ID kiritilishi shart' });
  }

  const question = db.getQuestionById(parseInt(question_id));
  if (!question) {
    return res.status(404).json({ error: 'Savol topilmadi (ehtimol allaqachon javob berilgan)' });
  }

  const studentId = question.telegram_user_id;

  try {
    // Send via Telegram bot
    if (req.file) {
      const fileBuffer = req.file.buffer;
      const fileOptions = { caption: answer_text || undefined };
      const filename = req.file.originalname;

      // Determine attachment category (image vs general document)
      if (req.file.mimetype.startsWith('image/')) {
        await bot.telegram.sendPhoto(studentId, { source: fileBuffer, filename }, fileOptions);
      } else {
        await bot.telegram.sendDocument(studentId, { source: fileBuffer, filename }, fileOptions);
      }
    } else {
      if (!answer_text || answer_text.trim() === '') {
        return res.status(400).json({ error: 'Javob matni yoki biriktirilgan fayl bo\'lishi shart' });
      }
      await bot.telegram.sendMessage(studentId, answer_text);
    }

    // Delete question from DB as history is not preserved
    db.deleteQuestion(question.id);
    res.json({ success: true, message: 'Javob muvaffaqiyatli yuborildi va savol o\'chirildi!' });
  } catch (error) {
    console.error('Error sending Telegram response:', error);
    // If the student blocked the bot, we inform the admin
    let errorMsg = 'Javobni Telegram orqali yuborib bo\'lmadi';
    if (error.code === 403) {
      errorMsg = 'Xatolik: Talaba botni bloklagan, unga xabar yuborib bo\'lmaydi.';
    }
    res.status(500).json({ error: errorMsg, details: error.message });
  }
});

// 5. Create a new group (Admin)
app.post('/api/admin/groups', requireAdmin, (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Guruh nomi kiritilishi shart' });
  }

  try {
    const baseSlug = generateSlug(name.trim());
    if (!baseSlug) {
      return res.status(400).json({ error: 'Noto\'g\'ri guruh nomi, lotin harflari va raqamlardan foydalaning' });
    }

    // Ensure slug is unique
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = db.getGroupBySlug(slug);
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    db.createGroup(name.trim(), slug);
    const newGroup = db.getGroupBySlug(slug);
    
    res.json({ success: true, group: newGroup });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Guruh yaratishda xatolik' });
  }
});

// 6. Delete group and all associated unanswered questions (Admin)
app.delete('/api/admin/groups/:id', requireAdmin, (req, res) => {
  const groupId = parseInt(req.params.id);
  if (isNaN(groupId)) {
    return res.status(400).json({ error: 'Noto\'g\'ri guruh ID' });
  }

  try {
    db.deleteGroup(groupId);
    res.json({ success: true, message: 'Guruh va unga tegishli savollar o\'chirildi!' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ error: 'Guruhni o\'chirishda xatolik' });
  }
});

// TELEGRAM BOT COMMAND HANDLERS

// /start command
bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const payload = ctx.payload; // Deep link slug e.g., /start may

  // If user is admin and started bot without any slug
  if (String(userId) === String(ADMIN_ID) && !payload) {
    const webAppUrl = `${WEBAPP_URL || 'https://mock.webapp.url'}?admin=true`;
    return ctx.reply('Xush kelibsiz, YouTube Kanal Akademiyasi Admini!\nAdmin panelni ochish uchun pastdagi tugmani bosing.', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🎛 Admin Panelni Ochish', web_app: { url: webAppUrl } }]
        ]
      }
    });
  }

  // If there's a payload slug (student deep-link)
  if (payload) {
    const group = db.getGroupActiveBySlug(payload);
    if (!group) {
      return ctx.reply('Bu guruh uchun havola faol emas yoki guruh o\'chirilgan. Iltimos, admin bilan bog\'laning.');
    }

    const webAppUrl = `${WEBAPP_URL || 'https://mock.webapp.url'}?slug=${group.slug}`;
    return ctx.reply(`Salom! "${group.name}" guruhi savol-javob bo'limiga xush kelibsiz.\nSavolingizni yozib yuborish uchun pastdagi tugmani bosing.`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '✍ Savol Qoldirish', web_app: { url: webAppUrl } }]
        ]
      }
    });
  }

  // Fallback for regular users starting bot without slug
  return ctx.reply('Sizda faol guruh havolasi yo\'q. Iltimos, kurs guruhidan berilgan maxsus start havolasi orqali kiring.');
});

// /admin command
bot.command('admin', async (ctx) => {
  const userId = ctx.from.id;
  if (String(userId) === String(ADMIN_ID)) {
    const webAppUrl = `${WEBAPP_URL || 'https://mock.webapp.url'}?admin=true`;
    return ctx.reply('Admin panelni ochish uchun pastdagi tugmani bosing:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🎛 Admin Panelni Ochish', web_app: { url: webAppUrl } }]
        ]
      }
    });
  } else {
    return ctx.reply('Kechirasiz, siz admin emassiz.');
  }
});

// Handle webhook webhook-bot callback or poll
if (WEBAPP_URL) {
  const webhookPath = `/bot-webhook`;
  app.use(bot.webhookCallback(webhookPath));
  bot.telegram.setWebhook(`${WEBAPP_URL}${webhookPath}`)
    .then(() => {
      console.log(`Telegram bot webhook established at: ${WEBAPP_URL}${webhookPath}`);
    })
    .catch((err) => {
      console.error('Error setting Telegram webhook:', err);
    });
} else {
  // Start bot in polling mode locally
  bot.launch()
    .then(() => {
      console.log('Telegram bot started in local polling mode.');
    })
    .catch((err) => {
      console.error('Error starting Telegraf polling:', err);
    });
}

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
