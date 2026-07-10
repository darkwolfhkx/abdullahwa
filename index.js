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

// Simple conversational responses
function getResponse(userMessage) {
    const msg = userMessage.toLowerCase().trim();
    
    // Greetings
    if (msg.includes('salam') || msg.includes('assalam') || msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
        const greetings = [
            "Walaikum Assalam! 😊 Kya haal hain bhai?",
            "Assalamualaikum bhai! 😄 Kaise ho?",
            "Walaikum Assalam! 🫡 Sunao bhai, kya haal chal?",
            "Hey bhai! 👋 Kya ho raha hai?"
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    // How are you
    if (msg.includes('haal') || msg.includes('how are') || msg.includes('kaise') || msg.includes('kese')) {
        const responses = [
            "Main theek hoon bhai! 😊 Tum sunao, kya haal hai?",
            "Alhamdulillah, main acha hoon! 🫡 Tum batao?",
            "Sab theek hai mere bhai! 😄 Tumhari kya khabar?",
            "Main mast hoon bhai! 💪 Tum kaise ho?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // When user says "I'm fine" or "theek"
    if (msg.includes('theek') || msg.includes('acha') || msg.includes('mast') || msg.includes('fine') || msg.includes('good')) {
        const responses = [
            "Acha hai bhai! 😊 Koi aur baat batao.",
            "Good good! 🫡 Kya chal raha hai aajkal?",
            "Khushi hui sun kar bhai! 😄 Kya plan hai?",
            "Shabash bhai! 💪 Aise hi khush raho!"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // What are you doing
    if (msg.includes('kya kar') || msg.includes('what') && (msg.includes('doing') || msg.includes('rahe'))) {
        const responses = [
            "Bas bhai, tum logon se baat kar raha hoon! 😄 Aur batao?",
            "Tumse baat karna mera kaam hai bhai! 😊 Kya help chahiye?",
            "Arey bas aap logon se baat cheet kar raha hoon! 🫡 Sunao na?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Name queries
    if (msg.includes('name') || msg.includes('naam') || msg.includes('kaun') || msg.includes('who')) {
        const responses = [
            "Main tera dost hoon bhai! 🤖 Bas aise hi baatein karne ke liye bana hoon. Tera naam kya hai?",
            "Mera naam toh kuch nahi hai bhai, bas tera AI dost hoon! 😊 Tum batao apna naam?",
            "Main ek simple chatbot hoon bhai! 🫡 Tumhara kya naam hai?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Weather
    if (msg.includes('mausam') || msg.includes('weather') || msg.includes('garmi') || msg.includes('sardi') || msg.includes('barish')) {
        const responses = [
            "Bhai mujhe toh nahi pata, main toh bas baat karne ke liye bana hoon! 😅 Tum batao kaisa mausam hai?",
            "Arey bhai, mujhe weather ki itni knowledge nahi hai! 😄 Par sun kar achha laga ke tumne poocha. Mausam kaisa hai wahan?",
            "Mausam ka toh pata nahi bhai, par baat karke mausam acha ho jata hai! 😊 Tum batao?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Bored
    if (msg.includes('bore') || msg.includes('boring') || msg.includes('kuch nahi') || msg.includes('bakwas')) {
        const responses = [
            "Arey kyun bore ho rahe ho bhai? 😄 Chalo kuch interesting baat karte hain!",
            "Bore mat ho bhai! 💪 Zindagi achi hai, enjoy karo. Kya interest hai tumhara?",
            "Bhai akele bore ho rahe ho toh mujhse baat karlo! 😊 Main hoon na!"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Thanks
    if (msg.includes('thanks') || msg.includes('shukriya') || msg.includes('thank')) {
        const responses = [
            "Welcome bhai! 😊 Koi baat nahi.",
            "Arey koi nahi bhai! 🫡 Apna hi samjho.",
            "Shukriya kehne ki zaroorat nahi bhai! 😄 Main hoon hi tumhare liye!"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Goodbye
    if (msg.includes('bye') || msg.includes('allah hafiz') || msg.includes('good night') || msg.includes('goodnight')) {
        const responses = [
            "Allah Hafiz bhai! 😊 Apna khayal rakhna!",
            "Take care bhai! 🫡 Phir baat hogi!",
            "Bye bye bhai! 😄 Allah Hafiz, mazay karo!"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Jokes
    if (msg.includes('joke') || msg.includes('mazaak') || msg.includes('funny') || msg.includes('hansi')) {
        const jokes = [
            "Bhai joke sun! 🎭\nTeacher: Batao oxygen kitne din mein khatam ho sakti hai?\nStudent: Sir, ye toh student pe depend karta hai...\nTeacher: Kaise?\nStudent: Sir agar student saans roke rakhe toh 2 minute mein, warna poore saal! 😂",
            "Ek aadmi doctor ke paas gaya: Doctor sahab, main jab subah uthta hoon toh 30 minute tak chakkar aate hain.\nDoctor: Toh 30 minute baad utha karo! 🤣",
            "Bhai ye sun! 😄\nWife: Tum toh mujhse pyar karte hi nahi!\nHusband: Toh kya karun?\nWife: Kabhi surprise gift diya hai?\nHusband: Abhi pichle hafte hi tumhe surprise diya tha\nWife: Kya?\nHusband: Bill dekh kar tumhari jo shakal bani thi, woh surprise dekhne layak tha! 😂"
        ];
        return jokes[Math.floor(Math.random() * jokes.length)];
    }
    
    // Default random responses
    const defaults = [
        "Acha! 😄 Aur batao bhai?",
        "Hmm, samjha! 🫡 Kuch aur batao na?",
        "Acha acha! 😊 Phir kya hua?",
        "Bhai dil ki baat batao! 💖 Kya chal raha hai?",
        "Achha sun kar achha laga! 😄 Tumhari baat sun ke maza aata hai.",
        "Sahi hai bhai! 👌 Kuch aur batao?",
        "Oh nice! 😎 Phir?",
        "Baat toh sahi hai tumhari! 💯 Kya haal hai waise?",
        "Haan bhai bolo bolo! 🫡 Sun raha hoon.",
        "Arey wah! 😊 Kya scene hai phir?"
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
}

async function startBot() {
    try {
        console.log('╔══════════════════════════════════════════════════════════╗');
        console.log('║     🤖 SIMPLE CHATBOT - DOSTANA ANDAAZ                ║');
        console.log('║     💬 Male version - Friendly chats only             ║');
        console.log('║     🚫 No abuse, no gali, no product stuff            ║');
        console.log('╚══════════════════════════════════════════════════════════╝');
        
        const { state, saveCreds } = await useMultiFileAuthState('session_data');
        const { version } = await fetchLatestBaileysVersion();

        const sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: true,
            logger: pino({ level: 'silent' }),
            browser: ["SimpleBot", "AI", "1.0"],
            syncFullHistory: false,
            markOnlineOnConnect: true,
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 60000
        });

        let pairingShown = false;

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr, pairingCode } = update;
            
            if (qr && !pairingShown) {
                console.log('\n╔══════════════════════════════════════════════════════════╗');
                console.log('║     📱 SCAN QR CODE WITH WHATSAPP                        ║');
                console.log('╚══════════════════════════════════════════════════════════╝\n');
                qrcode.generate(qr, { small: true });
                console.log('\n💡 WhatsApp > Settings > Linked Devices > Link a Device\n');
            }
            
            if (pairingCode && !pairingShown) {
                pairingShown = true;
                console.log('\n🔑 YOUR PAIRING CODE: ' + pairingCode);
            }

            if (connection === 'open') {
                console.log('\n✅ BOT ONLINE! Simple dostana chatbot ready hai! 🫡\n');
            }
            
            if (connection === 'close') {
                const reason = lastDisconnect?.error?.output?.statusCode;
                if (reason !== DisconnectReason.loggedOut) {
                    console.log('🔄 Restarting in 5 seconds...');
                    setTimeout(startBot, 5000);
                } else {
                    console.log('❌ Logged out. Please restart.');
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

                console.log(`📩 [${senderNumber}]: ${text}`);

                // Get response
                const response = getResponse(text);
                
                // Small delay for natural feel
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                await sock.sendMessage(sender, { text: response });
                console.log(`✅ Reply sent to ${senderNumber}`);
                
            } catch (error) {
                console.error(`❌ Error:`, error.message);
            }
        });
        
    } catch (error) {
        console.error('❌ Start error:', error);
        setTimeout(startBot, 5000);
    }
}

// Start
startBot().catch(err => {
    console.error("❌ Fatal error:", err);
    setTimeout(() => startBot(), 5000);
});

process.on('SIGINT', () => {
    console.log('\n👋 Bot band ho raha hai... Allah Hafiz!');
    process.exit(0);
});
