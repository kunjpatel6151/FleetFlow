require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const businessRoutes = require('./routes/businessRoutes');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());

// ── Database ──────────────────────────────────────────────────────────────────
connectDB().then(() => seedDefaultUsers());

// ── Auto-seed default users on first boot ─────────────────────────────────────
async function seedDefaultUsers() {
    try {
        const User = require('./models/User');
        const count = await User.countDocuments();
        if (count === 0) {
            const defaults = [
                { email: 'admin@fleetflow.io', password: 'fleet2024', role: 'Manager' },
                { email: 'dispatch@fleetflow.io', password: 'fleet2024', role: 'Dispatcher' },
                { email: 'safety@fleetflow.io', password: 'fleet2024', role: 'Safety Officer' },
                { email: 'finance@fleetflow.io', password: 'fleet2024', role: 'Financial Analyst' },
            ];
            // Use create() individually so the bcrypt pre-save hook fires on each user
            for (const u of defaults) await User.create(u);
            console.log('✅ Default users created (passwords hashed):');
            defaults.forEach(u => console.log(`   [${u.role}] ${u.email}  →  password: fleet2024`));
        } else {
            console.log(`ℹ️  ${count} user(s) already exist — skipping default seed.`);
        }
    } catch (err) {
        console.error('⚠️  Could not seed default users:', err.message);
    }
}

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api', businessRoutes);

// ── Serve Frontend Static Files ───────────────────────────────────────────────
const frontendPath = path.join(__dirname, '../');
app.use(express.static(frontendPath));

// Catch-all: serve index.html for any non-API route
app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n✅ FleetFlow server running → http://localhost:${PORT}`);
    console.log(`   API:      http://localhost:${PORT}/api`);
    console.log(`   Frontend: http://localhost:${PORT}/\n`);
});
