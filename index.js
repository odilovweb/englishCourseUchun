require("dotenv").config(); // ✅ to'g'ri chaqirilgan

const { initializeApp, initializeServerApp } = require("firebase/app");
const { Telegraf } = require("telegraf");
const {
  getDoc,
  setDoc,
  doc,
  updateDoc,
  arrayUnion,
  getFirestore,
} = require("firebase/firestore");

// Import the functions you need from the SDKs you need
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDmDHnQJK40zeUIqsDRCuyHr8HViIT1XP4",
  authDomain: "giveawy-bot.firebaseapp.com",
  projectId: "giveawy-bot",
  storageBucket: "giveawy-bot.firebasestorage.app",
  messagingSenderId: "451955492501",
  appId: "1:451955492501:web:e874157db9272806efbd9c",
  measurementId: "G-QSXH4W54GY",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

//functions

async function checkMembership(userId) {
  try {
    const chatMember = await bot.telegram.getChatMember(-1002561429546, userId);
    return ["member", "administrator", "creator"].includes(chatMember.status);
  } catch (error) {
    return false;
  }
}

async function isNew(userId, inviterId) {
  const docRef = doc(db, "users", String(userId));
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return false; // User already exists
  } else {
    // Add a new user
    await setDoc(docRef, { userId, balance: 0, invitedUsers: [] });
    if (inviterId) {
      const inviterRef = doc(db, "users", String(inviterId));
      const inviterSnap = await getDoc(inviterRef);
      await updateDoc(inviterRef, {
        invitedUsers: arrayUnion(userId),
        balance: inviterSnap.data().balance + 1,
      });
    }
    return true; // New user added
  }
}
const Inviters = new Map();

//bot
const BOT_TOKEN = process.env.BOT_TOKEN;
const REQUIRED_CHANNEL = process.env.REQUIRED_CHANNEL;

const bot = new Telegraf(BOT_TOKEN);

bot.telegram.setMyCommands([
  { command: "/start", description: "Botni ishga tushirish 🔥" },
  { command: "/help", description: "Bot haqida ma'lumot olish 👇" },
  { command: "/balance", description: "Balansni tekshirish 💰" },
  { command: "/invite", description: "Do'stlaringizni taklif qilish 👥" },
  { command: "/courses", description: "Kurslar ro'yxatini ko'rish 📃" },
]);

bot.start(async (ctx) => {
  const isMember = await checkMembership(ctx.from.id);
  try {
    await ctx.replyWithPhoto({
      url: "https://media-hosting.imagekit.io/7c3fb0fd206b4146/ChatGPT%20Image%20May%2013,%202025,%2002_26_36%20PM.png?Expires=1841737392&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=u1~nH0EGLpPOAkenl40TAEyKMO5aL284Wwm1HixlU0hAveZbkRUPS7D79tKZvWcqZccYRiHriSBf96714HxAA5hNmBXU-zZdu5O3-I9P8lOaR~I9S9GSqtvRv94Qchnq5R8FL2lBfq8q-XEyY6B0Srq4nlt1bwQjofyfnQ7p2wr4CQ1Ig7Xffsie5~VAWBX2bo1CJ22eBOwsJshCMTgvJcYrChI2HohrgYx~T9T-wQASyoVHVuGdjyZDOdQADO1BJ5oEHuvPDvMcnanxG0sYwc9MQf6~V2JOxSGK1E5Lo6gGDsDvxKBUZef1Ua~keY6R2RHnT6nET4m~RiIaWhrzPA__",
    });
  } catch (error) {
    console.log("Error checking membership:", error);
  }
  if (!isMember) {
    ctx.reply(
      `Salom ${ctx.from.first_name}, botimizdan foydalanish uchun ${REQUIRED_CHANNEL} kanaliga obuna bo'lishingiz kerak.
      
Va qayta /start bosing.`
    );
  } else {
    const inviterId = Inviters.get(ctx.from.id);
    const isNewUser = await isNew(ctx.from.id, inviterId);
    ctx.reply(
      `Salom ${ctx.from.first_name}, botimizga xush kelibsiz! Ushbu bot orqali siz kurslarimizga a'zo bo'lishingiz mumkin.

Siz ushbu bot orqali 2 mln so'mlik kurslarni tekinga qo'lga kiritishingiz mumkin.

1 mln so'mlik kurs - 5 ta referral
2 mln so'mlik kurs - 10 ta referral

Referral link olish uchun /invite buyrug'ini bosing.

Batafsil ma'lumot uchun /help buyrug'ini bosing.`
    );
  }

  Inviters.set(ctx.from.id, ctx.payload);
});

bot.command("help", async (ctx) => {
  const isMember = await checkMembership(ctx.from.id);
  if (!isMember) {
    try {
      ctx.reply(
        `Salom ${ctx.from.first_name}, botimizdan foydalanish uchun ${REQUIRED_CHANNEL} kanaliga obuna bo'lishingiz kerak.
      
Va qayta /start bosing.`
      );
    } catch (error) {
      console.error("Error sending help message:", error);
      ctx.reply(
        "Xatolik yuz berdi. Iltimos, keyinroq qaytadan urinib ko'ring."
      );
    }
  } else {
    try {
      ctx.reply(`Bot uchun buyruqlar ro'yxati:
      
1. /start - Botni ishga tushirish
2. /help - Bot haqida ma'lumot olish
3. /balance - Balansni tekshirish
4. /invite - Do'stlaringizni taklif qilish
5. /courses - Kurslar ro'yxatini ko'rish`);
    } catch (error) {
      console.error("Error sending help message:", error);
      ctx.reply(
        "Xatolik yuz berdi. Iltimos, keyinroq qaytadan urinib ko'ring."
      );
    }
  }
});

bot.command("invite", async (ctx) => {
  const isMember = await checkMembership(ctx.from.id);
  if (!isMember) {
    try {
      ctx.reply(
        `Salom ${ctx.from.first_name}, botimizdan foydalanish uchun ${REQUIRED_CHANNEL} kanaliga obuna bo'lishingiz kerak.
      
Va qayta /start bosing.`
      );
    } catch (error) {
      console.error("Error sending help message:", error);
      ctx.reply(
        "Xatolik yuz berdi. Iltimos, keyinroq qaytadan urinib ko'ring."
      );
    }
  } else {
    try {
      const docRef = doc(db, "users", String(ctx.from.id));
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        ctx.reply(
          `
Do'stingizni taklif qilsangiz, har bir do'stingiz uchun 1 Ball olasiz.
BALL orqali siz kurslarga a'zo bo'lishingiz mumkin.

Sizning taklif qilgan do'stlaringiz soni: ${docSnap.data().invitedUsers.length}


Sizning referal havolangiz: https://t.me/${ctx.botInfo.username}?start=${
            ctx.from.id
          }`
        );
      }
    } catch (error) {
      console.error("Error sending help message:", error);
      ctx.reply(
        "Xatolik yuz berdi. Iltimos, keyinroq qaytadan urinib ko'ring."
      );
    }
  }
});

bot.command("balance", async (ctx) => {
  const isMember = await checkMembership(ctx.from.id);
  if (!isMember) {
    try {
      ctx.reply(
        `Salom ${ctx.from.first_name}, botimizdan foydalanish uchun ${REQUIRED_CHANNEL} kanaliga obuna bo'lishingiz kerak.
      
Va qayta /start bosing.`
      );
    } catch (error) {
      console.error("Error sending help message:", error);
      ctx.reply(
        "Xatolik yuz berdi. Iltimos, keyinroq qaytadan urinib ko'ring."
      );
    }
  } else {
    try {
      const docRef = doc(db, "users", String(ctx.from.id));
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        ctx.reply(
          `
Ballar orqali siz kurslarga a'zo bo'lishingiz mumkin 💰

Sizning ballaringiz : ${docSnap.data().balance} BALL 💲
Ko'proq ball olish uchun /invite buyrug'ini bosing.`
        );
      }
    } catch (error) {
      console.error("Error sending help message:", error);
      ctx.reply(
        "Xatolik yuz berdi. Iltimos, keyinroq qaytadan urinib ko'ring."
      );
    }
  }
});

bot.command("courses", async (ctx) => {
  const isMember = await checkMembership(ctx.from.id);
  if (!isMember) {
    try {
      ctx.reply(
        `Salom ${ctx.from.first_name}, botimizdan foydalanish uchun ${REQUIRED_CHANNEL} kanaliga obuna bo'lishingiz kerak.
      
Va qayta /start bosing.`
      );
    } catch (error) {
      console.error("Error sending help message:", error);
      ctx.reply(
        "Xatolik yuz berdi. Iltimos, keyinroq qaytadan urinib ko'ring."
      );
    }
  } else {
    const docRef = doc(db, "course", "courses");
    const docSnap = await getDoc(docRef);

    const userRef = doc(db, "users", String(ctx.from.id));
    const userSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      if (userSnap.exists() && userSnap.data().balance > 3) {
        const courses = docSnap.data().courses;
        let message = "Kurslar ro'yxati:\n\n";
        message += `Sizning balingiz: ${userSnap
          .data()
          .balance.toString()}\n\n`;

        courses.forEach((course, index) => {
          message += `${index + 1}. ${course.name} - ${course.price} BALL
Link: ${course.link}\n`;
        });
        message += `\n ♦ Diqqat ! Agar siz linkka bossangiz , ball balansingizdan yechib olinadi va kursga qo'shilasiz. \n\n`;
        ctx.reply(message);
      } else {
        const courses = docSnap.data().courses;
        let message = "Kurslar ro'yxati:\n\n";
        message += `Sizning balingiz: ${userSnap
          .data()
          .balance.toString()}\n\n`;

        courses.forEach((course, index) => {
          message += `${index + 1}. ${course.name} - ${course.price} BALL \n`;
        });
        message += `\n Sizning balansingiz kurs narxiga yetganda kanal linklari ko'rina boshlaydi hozir esa ko'proq ball yig'ing. /invite bosing \n\n`;
        ctx.reply(message);
      }
    } else {
      ctx.reply("Kurslar ro'yxati topilmadi.");
    }
  }
});

bot.on("chat_join_request", async (ctx) => {
  const userId = ctx.from.id;
  const chatId = ctx.chat.id;
  const docRef = doc(db, "users", String(userId));
  const docSnap = await getDoc(docRef);

  const courseRef = doc(db, "course", "courses");
  const courseSnap = await getDoc(courseRef);

  const courses = courseSnap.data().courses;
  if (docSnap.exists()) {
    const balance = docSnap.data().balance;

    let courseIndex = 0;
    courses.forEach((course, i) => {
      if (course.id == chatId) {
        courseIndex = i;
      }
    });

    if (balance >= courses[courseIndex].price) {
      const courseI = courses[courseIndex];
      try {
        ctx.telegram.approveChatJoinRequest(chatId, userId);
        ctx.telegram.sendMessage(
          ctx.from.id,
          `Siz kursga muvaffaqiyatli qo'shildingiz! Sizning balansingiz: ${
            balance - courseI.price
          } BALL`
        );
        updateDoc(docRef, {
          balance: balance - courseI.price,
        });
      } catch (error) {
        console.error("Error approving chat join request:", error);
      }
    } else {
      try {
        ctx.telegram.declineChatJoinRequest(chatId, userId);
        ctx.telegram.sendMessage(
          ctx.from.id,
          `Sizning balansingiz yetarli emas. Sizda ${balance} BALL bor.`
        );
      } catch (error) {
        console.log("Error declining chat join request:", error);
      }
    }
  }
});

bot.launch();
