const fs = require('fs');
const path = require('path');

// Ensure database folder exists
const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'database.json');

// Initialize JSON structure if file doesn't exist
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(
    dbPath, 
    JSON.stringify({ groups: [], questions: [], group_id_counter: 1, question_id_counter: 1 }, null, 2),
    'utf8'
  );
}

// Read database file
function readData() {
  try {
    const raw = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading JSON DB:', err);
    return { groups: [], questions: [], group_id_counter: 1, question_id_counter: 1 };
  }
}

// Write database file
function writeData(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing JSON DB:', err);
  }
}

// Database helpers exposing the same interface
const dbHelpers = {
  // Group Operations
  createGroup: (name, slug) => {
    const data = readData();
    const newGroup = {
      id: data.group_id_counter++,
      name,
      slug,
      is_active: 1,
      created_at: new Date().toISOString()
    };
    data.groups.push(newGroup);
    writeData(data);
    return { lastInsertRowid: newGroup.id };
  },

  getGroupBySlug: (slug) => {
    const data = readData();
    return data.groups.find(g => g.slug === slug) || null;
  },

  getGroupActiveBySlug: (slug) => {
    const data = readData();
    return data.groups.find(g => g.slug === slug && g.is_active === 1) || null;
  },

  deleteGroup: (id) => {
    const data = readData();
    // Filter out the group
    data.groups = data.groups.filter(g => g.id !== id);
    // Cascade delete questions associated with this group
    data.questions = data.questions.filter(q => q.group_id !== id);
    writeData(data);
    return { changes: 1 };
  },

  getAllGroupsWithPendingCount: () => {
    const data = readData();
    const activeGroups = data.groups.filter(g => g.is_active === 1);
    return activeGroups.map(g => {
      const pendingCount = data.questions.filter(q => q.group_id === g.id).length;
      return { ...g, pending_count: pendingCount };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  getAllGroupsList: () => {
    const data = readData();
    return [...data.groups].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  // Question Operations
  addQuestion: (groupId, telegramUserId, username, firstName, questionText) => {
    const data = readData();
    const newQuestion = {
      id: data.question_id_counter++,
      group_id: groupId,
      telegram_user_id: telegramUserId,
      username,
      first_name: firstName,
      question_text: questionText,
      created_at: new Date().toISOString()
    };
    data.questions.push(newQuestion);
    writeData(data);
    return { lastInsertRowid: newQuestion.id };
  },

  getQuestionsByGroupId: (groupId) => {
    const data = readData();
    return data.questions
      .filter(q => q.group_id === groupId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  },

  getQuestionById: (id) => {
    const data = readData();
    return data.questions.find(q => q.id === id) || null;
  },

  deleteQuestion: (id) => {
    const data = readData();
    data.questions = data.questions.filter(q => q.id !== id);
    writeData(data);
    return { changes: 1 };
  }
};

module.exports = {
  ...dbHelpers
};
