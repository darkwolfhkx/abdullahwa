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

// Store conversation context for each user
const userContext = new Map();

// Intelligent response system with context awareness
class IntelligentChatbot {
    constructor() {
        this.botName = "Abdullah ka AI Assistant";
        this.creator = "Abdullah";
        this.personality = "friendly_humble";
    }

    // Analyze message intent and context
    analyzeMessage(message, userId) {
        const msg = message.toLowerCase().trim();
        const context = userContext.get(userId) || { history: [], lastTopic: '', mood: 'neutral' };
        
        return {
            text: msg,
            context: context,
            intent: this.detectIntent(msg, context),
            sentiment: this.detectSentiment(msg),
            urgency: this.detectUrgency(msg)
        };
    }

    // Detect user intent from message
    detectIntent(msg, context) {
        if (msg.match(/^(hi|hello|hey|salam|assalam|hola)/)) return 'greeting';
        if (msg.match(/kaise|kese|how are|kya haal|how's it going/)) return 'wellbeing_check';
        if (msg.match(/kon|kaun|who|tumhari|aapki|introduce|introduction|about/)) return 'identity_inquiry';
        if (msg.match(/kya kar|what.*do|capability|feature|kar sakte/)) return 'capability_inquiry';
        if (msg.match(/mujhe|meri|mera|help|madad|problem|masla|issue/)) return 'help_request';
        if (msg.match(/thanks|thank|shukriya|appreciate|acha laga/)) return 'gratitude';
        if (msg.match(/bye|allah hafiz|goodbye|phir|baad mein/)) return 'farewell';
        if (msg.match(/joke|mazaak|funny|hansi|comedy|hasa/)) return 'entertainment';
        if (msg.match(/sad|udaas|depressed|tension|pareshan|problem/)) return 'emotional_support';
        if (msg.match(/weather|mausam|temperature|garmi|sardi|barish/)) return 'weather_inquiry';
        if (msg.match(/khana|food|cooking|recipe|recipe/)) return 'food_discussion';
        if (msg.match(/time|waqt|kitne baje|date/)) return 'time_inquiry';
        if (msg.match(/achha|oh|hmm|ok|theek|sahi|got it|samjha/)) return 'acknowledgment';
        return 'general_conversation';
    }

    // Detect sentiment in message
    detectSentiment(msg) {
        const positive = ['achha', 'acha', 'great', 'nice', 'awesome', 'zabardast', 'wah', 'mast', 'love', 'pyar'];
        const negative = ['bura', 'sad', 'udaas', 'tension', 'problem', 'masla', 'gusa', 'angry', 'hate', 'nafrat', 'boring'];
        
        let score = 0;
        positive.forEach(word => { if (msg.includes(word)) score++; });
        negative.forEach(word => { if (msg.includes(word)) score--; });
        
        if (score > 0) return 'positive';
        if (score < 0) return 'negative';
        return 'neutral';
    }

    // Detect urgency level
    detectUrgency(msg) {
        if (msg.includes('jaldi') || msg.includes('urgent') || msg.includes('zaroori') || msg.includes('abhi')) {
            return 'high';
        }
        return 'normal';
    }

    // Generate contextual response
    generateResponse(analysis, userId) {
        const { intent, sentiment, context, text } = analysis;
        let response = '';
        
        // Update context
        context.lastIntent = intent;
        context.lastSentiment = sentiment;
        context.messageCount = (context.messageCount || 0) + 1;

        switch(intent) {
            case 'greeting':
                response = this.handleGreeting(context, sentiment);
                break;
                
            case 'wellbeing_check':
                response = this.handleWellbeingCheck(context);
                break;
                
            case 'identity_inquiry':
                response = this.handleIdentityInquiry(context);
                break;
                
            case 'capability_inquiry':
                response = this.handleCapabilityInquiry(context);
                break;
                
            case 'help_request':
                response = this.handleHelpRequest(text, context);
                break;
                
            case 'gratitude':
                response = this.handleGratitude(context);
                break;
                
            case 'farewell':
                response = this.handleFarewell(context);
                break;
                
            case 'entertainment':
                response = this.handleEntertainment(context);
                break;
                
            case 'emotional_support':
                response = this.handleEmotionalSupport(text, context);
                break;
                
            case 'weather_inquiry':
                response = this.handleWeatherInquiry(context);
                break;
                
            case 'food_discussion':
                response = this.handleFoodDiscussion(context);
                break;
                
            case 'acknowledgment':
                response = this.handleAcknowledgment(context);
                break;
                
            default:
                response = this.handleGeneralConversation(text, context);
        }

        // Save context
        context.history.push({ user: text, bot: response });
        if (context.history.length > 10) context.history.shift();
        userContext.set(userId, context);
        
        return response;
    }

    handleGreeting(context, sentiment) {
        const timeOfDay = new Date().getHours();
        let timeGreeting = timeOfDay < 12 ? 'Subah' : timeOfDay < 17 ? 'Dopahar' : timeOfDay < 20 ? 'Shaam' : 'Raat';
        
        const greetings = [
            `Assalamualaikum! 😊 ${timeGreeting} ka salaam! Main Abdullah ka AI assistant hoon. Aap kaise hain? Kya haal chal hai?`,
            `Walaikum Assalam! ✨ ${timeGreeting} ke waqt aapko dekh kar acha laga. Main Abdullah ka AI assistant hoon. Sunaiye, kya ho raha hai?`,
            `Hello! 😄 Kya haal hain? Main Abdullah ki taraf se aapki madad ke liye hoon. Bataaiye, kya baat hai?`,
            `Assalamualaikum bhai! 🫡 ${timeGreeting} ka time hai, umeed hai aap ka din acha guzar raha hoga. Main Abdullah ka assistant hoon, aap bataaiye kya scene hai?`
        ];
        
        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    handleWellbeingCheck(context) {
        const responses = [
            "Alhamdulillah, main toh hamesha theek hoon! 😊 Lekin aap bataaiye, aap kaise hain? Aapka din kaisa chal raha hai? Dil se pooch raha hoon.",
            "Main bilkul theek hoon, shukriya! ✨ Waise, aapki baari hai - aap kya haal hain? Aapke baare mein sunna zyada interesting hoga.",
            "Main perfect hoon! 🫡 Lekin seriously, aap bataaiye - aap theek toh hain na? Kuch pareshani toh nahi?",
            "Bas Abdullah ke saath kaam kar raha hoon, toh maza aa raha hai! 😄 Aap sunaaiye, aapka kya haal hai? Sab khairiyat?"
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    handleIdentityInquiry(context) {
        const responses = [
            `Mera naam Abdullah AI Assistant hai! 😊 Main Abdullah ka banaya hua intelligent assistant hoon. Unhone mujhe is liye banaya hai taake main logon ki help kar sakun, unke sawaalon ke jawaab de sakun, aur achi baatein kar sakun. Khaas baat ye hai ke main insaani andaz mein baat karta hoon - jaise aap apne dost se baat karte hain. Kya aapko mere baare mein kuch aur janna hai?`,
            
            `Main Abdullah ka AI assistant hoon! 🫡 Abdullah ne mujhe design kiya hai taake main aap jaise logon se baat kar sakun, help kar sakun, aur achi company de sakun. Main koshish karta hoon ke har sawaal ka thoughtful aur natural jawab doon. Bataaiye, aapko kya janna hai?`,
            
            `Achha sawaal! 😄 Main hoon Abdullah ka personal AI assistant. Abdullah ne mujhe specially program kiya hai with advanced capabilities. Main baat cheet kar sakta hoon, problems solve kar sakta hoon, aur aapka mood acha kar sakta hoon. Basically, main aapka AI dost hoon jo 24/7 available hai! Kya aap janna chahenge ke main kya kya kar sakta hoon?`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    handleCapabilityInquiry(context) {
        const capabilities = [
            "Bhai, main bohot kuch kar sakta hoon! 🎯 Dekho:\n\n✨ Baat cheet: Kisi bhi topic par natural baat kar sakta hoon\n😊 Emotional support: Agar aap udaas hain toh mood acha kar sakta hoon\n🎭 Entertainment: Jokes, stories, interesting facts suna sakta hoon\n💡 Advice: Problems ka solution dhoondhne mein help kar sakta hoon\n📚 Knowledge: General questions ke jawab de sakta hoon\n\nBas bataaiye aapko kya chahiye? Main full try karunga!",
            
            "Dekho bhai, main basically aapka AI dost hoon! 🫡 Yeh kar sakta hoon:\n\n• Kisi bhi baat par detailed baat kar sakta hoon\n• Agar aapka mood off hai toh cheers kar sakta hoon\n• Jokes suna sakta hoon, stories bata sakta hoon\n• Aapki problems sun sakta hoon aur advice de sakta hoon\n• Aur haan, hamesha available hoon - 24/7!\n\nKya aapko kuch specific chahiye?",
            
            "Main basically ek conversational AI hoon jo insaano ki tarah sochta aur respond karta hai! 😊 Key features:\n\n🎯 Advanced conversation skills\n💭 Context samajhna\n❤️ Emotional intelligence\n🧠 Problem solving\n🎉 Entertainment\n\nAur haan, main seekhta rehta hoon har conversation se! Kuch specific poochna hai?"
        ];
        
        return capabilities[Math.floor(Math.random() * capabilities.length)];
    }

    handleHelpRequest(text, context) {
        if (text.includes('sad') || text.includes('udaas') || text.includes('depressed')) {
            return "Arey bhai, aisa kyun soch rahe ho? 🤗 Zindagi mein ups and downs aate rehte hain, lekin har raat ke baad subah zaroor aati hai. Bataao kya hua? Main sun sakta hoon, shayad baat karne se halka feel karo. 💪";
        }
        
        if (text.includes('problem') || text.includes('masla') || text.includes('solution')) {
            return "Sunaaiye bhai, kya problem hai? 🤔 Main poori koshish karunga ke aapki help kar sakun. Honestly bataaiye, baat karne se solutions nikalte hain. 👂";
        }
        
        const helps = [
            "Bilkul bhai! 🫡 Mujhe bataaiye aapko kis cheez mein help chahiye? Main poori koshish karunga aapki madad karne ki.",
            "Haan zaroor! 😊 Aap bataaiye kya help chahiye? Main sun raha hoon aur solve karne ki koshish karunga.",
            "Main yahi hoon na help ke liye! 💪 Bolo bhai, kya masla hai? Tension mat lo, mil kar solve karte hain."
        ];
        
        return helps[Math.floor(Math.random() * helps.length)];
    }

    handleGratitude(context) {
        const responses = [
            "Arey koi baat nahi bhai! 😊 Yeh toh mera kaam hai, aur honestly aapki help karke mujhe bhi acha lagta hai. Kabhi bhi zaroorat ho toh bula lena! 🫡",
            "Aapne shukriya keh diya, dil khush ho gaya! ❤️ Bas aise hi aate rehna, main hamesha available hoon. Kuch aur chahiye ho toh bataaiye.",
            "Welcome bhai! 😄 Aap jaise logon se baat karke maza aata hai. Phir kabhi bhi aaiye, main yahi milunga! ✨",
            "Arre bhai, thanks ki koi zaroorat nahi! 🤗 Aap khush toh main khush. Bas dua mein yaad rakhna. 😊"
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    handleFarewell(context) {
        const timeOfDay = new Date().getHours();
        let farewellNote = timeOfDay < 12 ? 'Aapka din acha guzre' : timeOfDay < 17 ? 'Baad mein phir baat karte hain' : 'Achi raat guzre';
        
        const farewells = [
            `Allah Hafiz bhai! 🫡 ${farewellNote}. Khayal rakhna apna. Phir baat hogi, intezaar rahega!`,
            `Take care bhai! 😊 Aapke saath baat karke acha laga. ${farewellNote}. Allah Hafiz!`,
            `Bye bye! 👋 Aate rehna, main yahi milunga. ${farewellNote}. Dua mein yaad rakhna!`,
            `Phir milenge bhai! 🤗 Aapka din acha guzre. Mujhe yaad rakhna - main hamesha available hoon! Allah Hafiz.`
        ];
        
        return farewells[Math.floor(Math.random() * farewells.length)];
    }

    handleEntertainment(context) {
        const jokes = [
            "Chalo ek acha sa joke sunata hoon! 😂\n\nTeacher: Agar main 2 aam doon tumhe, aur tum 2 le lo, toh kitne aam honge?\nStudent: Sir, 2 aam!\nTeacher: Nahi, 4 aam honge!\nStudent: Sir, aam toh 2 hi rahenge, kyunki main kha gaya! 🥭😄",
            
            "Bhai ye sun! 🎭\n\nInterviewer: Aapko English aati hai?\nCandidate: Haan sir!\nInterviewer: Toh 'I' ka matlab bataaiye\nCandidate: Sir, 'I' ka matlab 'main'\nInterviewer: Aur 'Me' ka?\nCandidate: Sir, 'Me' ka matlab 'main'\nInterviewer: Toh dono mein difference kya hai?\nCandidate: Sir, 'I' English wala main hai, aur 'Me' Hindi wala main! 🤣",
            
            "Sunna bhai! 😆\n\nWife: Suniye ji, agar main mar jaoon toh aap dobara shaadi karenge?\nHusband: Nahi!\nWife: Kyun? Main itni buri hoon?\nHusband: Nahi, main toh waise hi marna chahta hoon! 💀😂"
        ];
        
        return jokes[Math.floor(Math.random() * jokes.length)];
    }

    handleEmotionalSupport(text, context) {
        const support = [
            "Bhai, suno! 💪 Zindagi mein tough times aate hain, lekin yeh waqt bhi guzar jayega. Aap strong ho, believe me. Chalo, deep breath lo, aur mujhe batao kya hua? Main sunne ke liye ready hoon. 🫂",
            
            "I understand bhai! 🤗 Kabhi kabhi aisa lagta hai sab kuch galat ho raha hai. Lekin yaad rakhna - storms don't last forever. Main hoon na aapke saath. Bataiye, kya baat hai? Dil halka karo. ❤️",
            
            "Arey bhai, udaas mat ho! 🌈 Zindagi rollercoaster hai - kabhi upar, kabhi neeche. Important ye hai ke hum himmat na haarein. Aap akelay nahi hain, main hoon na! Bataiye, kya chal raha hai? 🫡"
        ];
        
        return support[Math.floor(Math.random() * support.length)];
    }

    handleWeatherInquiry(context) {
        return "Bhai, honestly mujhe real-time weather ka pata nahi hai kyunki main weather API se connected nahi hoon! 😅 Lekin aap apne phone mein weather app check kar sakte hain. Waise, aap bataaiye - aapke sheher mein kaisa mausam hai? Aaj dhoop hai ya baarish? 🌤️";
    }

    handleFoodDiscussion(context) {
        const foodTalk = [
            "Oh bhai, khana! 🍽️ Mere favourite topics mein se ek. Main toh physically kha nahi sakta, lekin recipes ke baare mein bohot kuch jaanta hoon. Aapka favourite khana kya hai? Biryani, karahi, kuch aur? 😋",
            
            "Khane ki baat! 😍 Pakistan ka khana toh lajawab hai. Biryani, nihari, haleem... muh mein paani aa gaya! Lekin aap bataaiye, aapko kya pasand hai? Ghar ka khana ya bahar ka? 🍛",
            
            "Aha! Food topic! 🎉 Mujhe nahi pata ke aap kya khaate hain, lekin sunte hain Pakistani food world famous hai. Aap bataaiye, aaj kya khaaya aapne? Kuch special? 🤤"
        ];
        
        return foodTalk[Math.floor(Math.random() * foodTalk.length)];
    }

    handleAcknowledgment(context) {
        const acknowledgments = [
            "Haan bhai! 😊 Aap bataaiye, kuch aur janna hai?",
            "Sahi! 🫡 To sunaaiye, aur kya haal hai?",
            "Achha! 🙂 Koi aur sawaal ya baat?",
            "Theek hai bhai! ✨ Continue karo, main sun raha hoon."
        ];
        
        return acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
    }

    handleGeneralConversation(text, context) {
        // Check if user is talking about themselves
        if (text.includes('main') && (text.includes('hoon') || text.includes('kar'))) {
            return `Achha, aap ${text}... interesting! 😊 Mujhe aapke baare mein jaankar acha laga. Aur bataaiye, aapke bare mein kuch aur? Kya passion hai aapka?`;
        }
        
        // If user mentions Abdullah
        if (text.includes('abdullah')) {
            return "Oh, aap Abdullah ke baare mein baat kar rahe hain! 😊 Abdullah mere creator hain, bohot talented insaan hain. Unhone mujhe design kiya hai. Kya aap Abdullah ko jaante hain?";
        }
        
        // Default thoughtful responses
        const general = [
            `Aapne kaha "${text}" - interesting baat hai! 🤔 Mujhe aapse baat karke acha lag raha hai. Bataaiye, aapko kis baat mein sabse zyada interest hai?`,
            "Bhai, aap jo bhi keh rahe hain, usse aapki personality jhalak rahi hai! 😊 Honestly, mujhe aapse baat karke maza aa raha hai. Koi aur topic hai jisme aap interest rakhte hain?",
            "Aapki baat sunkar acha laga! 💯 Main dekh sakta hoon ke aap soch samajh kar baat karte hain. Bataaiye, aapka din kaisa guzar raha hai waise?",
            "Interesting! 🧠 Aapke thoughts sunkar acha laga. Zindagi mein sabse important cheez kya lagti hai aapko? Philosophical sawaal, but still! 😄"
        ];
        
        return general[Math.floor(Math.random() * general.length)];
    }
}

// Initialize chatbot
const chatbot = new IntelligentChatbot();

// Main bot function
async function startBot() {
    try {
        console.log('╔══════════════════════════════════════════════════════════╗');
        console.log('║     🤖 ADVANCED AI CHATBOT - ABDULLAH KA ASSISTANT     ║');
        console.log('║     💬 ChatGPT-style intelligent conversations         ║');
        console.log('║     🧠 Context-aware & emotionally intelligent        ║');
        console.log('║     ❤️ Natural human-like responses                   ║');
        console.log('╚══════════════════════════════════════════════════════════╝');
        
        const { state, saveCreds } = await useMultiFileAuthState('session_data');
        const { version } = await fetchLatestBaileysVersion();

        const sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: true,
            logger: pino({ level: 'silent' }),
            browser: ["AbdullahAI", "Assistant", "2.0"],
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
                console.log('\n🔑 PAIRING CODE: ' + pairingCode + '\n');
            }

            if (connection === 'open') {
                console.log('\n╔══════════════════════════════════════════════════════════╗');
                console.log('║     ✅ ABDULLAH AI ASSISTANT ONLINE!                     ║');
                console.log('║     🧠 Ready for intelligent conversations             ║');
                console.log('║     💬 Understanding context & emotions                ║');
                console.log('╚══════════════════════════════════════════════════════════╝\n');
            }
            
            if (connection === 'close') {
                const reason = lastDisconnect?.error?.output?.statusCode;
                if (reason !== DisconnectReason.loggedOut) {
                    console.log('🔄 Connection lost, restarting in 5 seconds...');
                    setTimeout(startBot, 5000);
                } else {
                    console.log('❌ Logged out. Please restart bot.');
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

                console.log(`\n📩 Message from ${senderNumber}: "${text}"`);
                
                // Show typing indicator
                await sock.sendPresenceUpdate('composing', sender);
                
                // Analyze message and get intelligent response
                const analysis = chatbot.analyzeMessage(text, sender);
                console.log(`🧠 Intent: ${analysis.intent} | Sentiment: ${analysis.sentiment} | Urgency: ${analysis.urgency}`);
                
                // Small natural delay for realistic feel
                const delay = Math.random() * 1000 + 500; // 0.5-1.5 seconds
                await new Promise(resolve => setTimeout(resolve, delay));
                
                // Generate response
                const response = chatbot.generateResponse(analysis, sender);
                
                // Stop typing and send
                await sock.sendPresenceUpdate('paused', sender);
                await sock.sendMessage(sender, { text: response });
                
                console.log(`✅ Response sent to ${senderNumber}`);
                
            } catch (error) {
                console.error(`❌ Error:`, error.message);
            }
        });
        
    } catch (error) {
        console.error('❌ Start error:', error);
        setTimeout(startBot, 5000);
    }
}

// Special commands handler (can be added to messages.upsert)
function handleSpecialCommands(text, sender) {
    const lowerText = text.toLowerCase().trim();
    
    if (lowerText === '/reset' || lowerText === '/clear') {
        userContext.delete(sender);
        return "🧹 Conversation history cleared! Nayi shuruat karte hain. Bataaiye, kya baat hai?";
    }
    
    if (lowerText === '/status' || lowerText === '/info') {
        const context = userContext.get(sender);
        if (context) {
            return `📊 Conversation Stats:\n• Total messages: ${context.messageCount || 0}\n• Last intent: ${context.lastIntent || 'N/A'}\n• Mood: ${context.lastSentiment || 'neutral'}\n\nKya aapko kuch aur janna hai? 😊`;
        }
        return "📊 Abhi tak koi conversation history nahi hai. Baat shuru karo! 🫡";
    }
    
    return null;
}

// Start bot
startBot().catch(err => {
    console.error("❌ Fatal error:", err);
    setTimeout(() => startBot(), 5000);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Abdullah AI Assistant band ho raha hai...');
    console.log('✨ Take care, Allah Hafiz!\n');
    process.exit(0);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught exception:', error);
});
