const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const fs = require('fs');

// Clear old session
const sessionPath = 'session_data';
if (fs.existsSync(sessionPath)) {
    console.log('🗑️ Removing old session data...');
    fs.rmSync(sessionPath, { recursive: true, force: true });
}

// Store user context
const userContext = new Map();

// TRAINED RESPONSE SYSTEM - Short, precise, to-the-point
class SmartChatbot {
    constructor() {
        this.botName = "Abdullah AI";
        this.creator = "Abdullah";
    }

    getResponse(message, userId) {
        const msg = message.trim();
        const lowerMsg = msg.toLowerCase();
        const context = userContext.get(userId) || { lastTopic: '', msgCount: 0 };
        
        // Update message count
        context.msgCount = (context.msgCount || 0) + 1;
        userContext.set(userId, context);
        
        // ===== GREETINGS =====
        if (lowerMsg.match(/^(hi|hello|hey|salam|assalam|hola|yo|oi)$/)) {
            const replies = [
                "Walaikum Assalam! 😊",
                "Assalamualaikum! 🫡",
                "Hello! 😄",
                "Hey! 👋"
            ];
            return replies[Math.floor(Math.random() * replies.length)];
        }
        
        if (lowerMsg.match(/^(hi|hello|hey|salam|assalam).*(kaise|kese|kya haal|how are)/)) {
            const replies = [
                "Walaikum Assalam! Main theek hoon, aap sunao? 😊",
                "Assalamualaikum! Alhamdulillah theek hoon, aap batao 🫡",
                "Hello! Main theek, aap kaise ho? 😄"
            ];
            return replies[Math.floor(Math.random() * replies.length)];
        }
        
        // ===== HOW ARE YOU =====
        if (lowerMsg.match(/^(kaise|kese) (ho|hain)|how are you|kya haal|how('s|s) it going/)) {
            const replies = [
                "Theek hoon bhai! Aap sunao? 😊",
                "Alhamdulillah theek! Aap batao 🫡",
                "Main theek hoon, aap kaise ho? 🙂"
            ];
            return replies[Math.floor(Math.random() * replies.length)];
        }
        
        if (lowerMsg.match(/main theek|mein theek|main acha|mein acha|fine|good|mast|alhamdulillah theek/)) {
            const replies = [
                "Acha hai! 😊",
                "Good! 🫡",
                "Khushi hui sun kar 🙂",
                "Sahi hai bhai 💪"
            ];
            return replies[Math.floor(Math.random() * replies.length)];
        }
        
        // ===== IDENTITY - PRECISE =====
        if (lowerMsg.match(/^(kon|kaun|who).*(ho|tum|aap)|tumhara naam|aapka naam|introduce|about you/)) {
            return "Main Abdullah ka AI assistant hoon 🤖";
        }
        
        if (lowerMsg.match(/abdullah kaun|abdullah kon|who is abdullah/)) {
            return "Abdullah mera creator hai, unhone mujhe banaya hai 🫡";
        }
        
        if (lowerMsg.match(/tum kya (kar|ho)|what.*(do|are).*you/)) {
            return "Main Abdullah ka AI assistant hoon, baat cheet aur help ke liye bana hoon 🤖";
        }
        
        // ===== WHAT ARE YOU DOING =====
        if (lowerMsg.match(/kya kar rahe|kya kar rhe|what.*doing/)) {
            return "Bas aapse baat kar raha hoon 😄";
        }
        
        // ===== CAPABILITIES - SHORT =====
        if (lowerMsg.match(/tum kya kya kar sakte|what.*can.*you.*do|features|capabilities/)) {
            return "Baat kar sakta hoon, help kar sakta hoon, jokes suna sakta hoon. Bolo kya chahiye? 🫡";
        }
        
        // ===== THANKS =====
        if (lowerMsg.match(/thanks|thank|shukriya|thx|thanx/)) {
            return "Welcome! 😊";
        }
        
        // ===== GOODBYE =====
        if (lowerMsg.match(/bye|allah hafiz|goodbye|good night|tc|take care|phir milte/)) {
            const replies = [
                "Allah Hafiz! 🫡",
                "Take care bhai! 👋",
                "Bye! Phir baat hogi 😊"
            ];
            return replies[Math.floor(Math.random() * replies.length)];
        }
        
        // ===== JOKE - SHORT =====
        if (lowerMsg.match(/joke|mazaak|funny|hansi|comedy|chutkula/)) {
            const jokes = [
                "Teacher: Batao 2+2 kitne hote? Student: Sir easy, 4! Teacher: Good. Student: Sir easy toh tha, good kyun bola? 😂",
                "Doctor: Roz subah walk karo. Patient: Phir? Doctor: Phir sham ko ghar wapas aa jao! 🤣",
                "Wife: Mujhe shopping karni hai. Husband: Paise nahi hain. Wife: Toh main chali maa ke ghar. Husband: Ruko, ATM se aaya! 😅"
            ];
            return jokes[Math.floor(Math.random() * jokes.length)];
        }
        
        // ===== TIME =====
        if (lowerMsg.match(/time|waqt|kitne baje/)) {
            const now = new Date();
            const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            const date = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            return `${time} - ${date} ⏰`;
        }
        
        // ===== WEATHER =====
        if (lowerMsg.match(/weather|mausam|garmi|sardi|barish/)) {
            return "Bhai mujhe live weather ka pata nahi, phone mein check kar lo ☀️";
        }
        
        // ===== NAME =====
        if (lowerMsg.match(/tumhara naam|aapka naam|what.*name|what.*called/)) {
            return "Abdullah AI 🤖";
        }
        
        // ===== SAD/EMOTIONAL =====
        if (lowerMsg.match(/udaas|sad|depressed|tension|pareshan|problem/)) {
            return "Kya hua bhai? Batao, sun raha hoon 🫂";
        }
        
        // ===== FOOD =====
        if (lowerMsg.match(/khana|food|biryani|pizza|burger/)) {
            return "Mujhe khana nahi milta bhai, main AI hoon 😅 Aap batao kya khaya?";
        }
        
        // ===== LOVE/RELATIONSHIP =====
        if (lowerMsg.match(/pyar|love|mohabbat|girlfriend|boyfriend|crush/)) {
            return "Us topic pe chup rehna hi behtar hai bhai 😅";
        }
        
        // ===== YES/NO ACKNOWLEDGMENT =====
        if (lowerMsg.match(/^(haan|ha|yes|yeah|yep|ji|hanji)$/)) {
            return "Hmm 🫡";
        }
        
        if (lowerMsg.match(/^(nahi|na|no|nope)$/)) {
            return "Theek hai 🙂";
        }
        
        if (lowerMsg.match(/^(ok|okay|theek|achha|acha|oh|hmm|sahi)$/)) {
            return "👍";
        }
        
        // ===== WHAT ELSE =====
        if (lowerMsg.match(/aur (batao|sunao)|what else|anything else/)) {
            return "Bas bhai, aap batao kya haal hai? 😊";
        }
        
        // ===== COMPLIMENTS =====
        if (lowerMsg.match(/good|nice|great|awesome|zabardast|wah|mast|acha kaam/)) {
            return "Shukriya bhai! 😊";
        }
        
        // ===== AGE =====
        if (lowerMsg.match(/age|umar|kitne saal/)) {
            return "Bhai main AI hoon, meri age nahi hoti 😄";
        }
        
        // ===== LOCATION =====
        if (lowerMsg.match(/kahan (ho|rehte|rahate)|location|address/)) {
            return "Digital duniya mein rehta hoon bhai ☁️";
        }
        
        // ===== FRIENDS =====
        if (lowerMsg.match(/dost|friend|yaar/)) {
            return "Main aapka dost hoon bhai 🫡";
        }
        
        // ===== SINGLE/MARRIED =====
        if (lowerMsg.match(/single|married|shaadi/)) {
            return "AI hoon bhai, shaadi nahi hoti meri 😅";
        }
        
        // ===== HOBBIES =====
        if (lowerMsg.match(/hobby|hobbies|pasand|interest/)) {
            return "Logo se baat karna aur help karna 🫡";
        }
        
        // ===== DEFAULT - SHORT & SMART =====
        const shortReplies = [
            "Haan bhai bolo 🫡",
            "Achha, sun raha hoon 🙂",
            "Hmm, aage bolo 😊",
            "Samjha, aur? 🤔",
            "Theek hai bhai 👍",
            "Bolo kya baat hai? 💭",
            "Main sun raha hoon 👂",
            "Aap batao 😊"
        ];
        
        return shortReplies[Math.floor(Math.random() * shortReplies.length)];
    }
}

const chatbot = new SmartChatbot();

async function startBot() {
    try {
        console.log('╔══════════════════════════════════════════════════════════╗');
        console.log('║     🤖 ABDULLAH AI - SMART & PRECISE                    ║');
        console.log('║     💬 Short, to-the-point responses                   ║');
        console.log('║     🎯 Only responds to what is asked                  ║');
        console.log('║     🚫 No extra information, no over-explaining        ║');
        console.log('╚══════════════════════════════════════════════════════════╝');
        
        const { state, saveCreds } = await useMultiFileAuthState('session_data');
        const { version } = await fetchLatestBaileysVersion();

        const sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: true,
            logger: pino({ level: 'silent' }),
            browser: ["AbdullahAI", "Smart", "3.0"],
            syncFullHistory: false,
            markOnlineOnConnect: true,
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 60000
        });

        let pairingShown = false;

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr, pairingCode } = update;
            
            if (qr && !pairingShown) {
                console.log('\n📱 SCAN QR CODE:\n');
                qrcode.generate(qr, { small: true });
            }
            
            if (pairingCode && !pairingShown) {
                pairingShown = true;
                console.log('\n🔑 PAIRING CODE:', pairingCode, '\n');
            }

            if (connection === 'open') {
                console.log('\n✅ ABDULLAH AI ONLINE - Ready for smart conversations!\n');
            }
            
            if (connection === 'close') {
                const reason = lastDisconnect?.error?.output?.statusCode;
                if (reason !== DisconnectReason.loggedOut) {
                    console.log('🔄 Restarting...');
                    setTimeout(startBot, 5000);
                } else {
                    console.log('❌ Logged out.');
                }
            }
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('messages.upsert', async (m) => {
            try {
                const msg = m.messages[0];
                if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;
                if (msg.key.fromMe) return;

                const sender = msg.key.remoteJid;
                const senderNumber = sender.split('@')[0];
                const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();

                if (!text) return;

                console.log(`📩 ${senderNumber}: ${text}`);

                // Get precise response
                const response = chatbot.getResponse(text, sender);
                
                // Natural typing delay (short)
                await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 800));
                
                await sock.sendMessage(sender, { text: response });
                console.log(`✅ Sent to ${senderNumber}`);
                
            } catch (error) {
                console.error('Error:', error.message);
            }
        });
        
    } catch (error) {
        console.error('Start error:', error);
        setTimeout(startBot, 5000);
    }
}

startBot().catch(err => {
    console.error("Fatal error:", err);
    setTimeout(() => startBot(), 5000);
});

process.on('SIGINT', () => {
    console.log('\n👋 Allah Hafiz!\n');
    process.exit(0);
});
