import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const WORDS = {
  en: [
    { word: "JAVASCRIPT", hint: "Popular programming language" },
    { word: "MOUNTAIN", hint: "Large natural elevation" },
    { word: "ELEPHANT", hint: "Largest land animal" },
    { word: "SUNSHINE", hint: "Light from the sun" },
    { word: "KEYBOARD", hint: "Computer input device" },
    { word: "RAINBOW", hint: "Colorful arc in the sky" },
    { word: "BUTTERFLY", hint: "Insect with colorful wings" },
    { word: "CHOCOLATE", hint: "Sweet brown treat" },
    { word: "COMPUTER", hint: "Electronic device for processing data" },
    { word: "PENGUIN", hint: "Bird that cannot fly but swims" },
    { word: "VOLCANO", hint: "Mountain that erupts with lava" },
    { word: "WATERFALL", hint: "River water falling from a height" },
    { word: "DESERT", hint: "Dry, sandy region with little rain" },
    { word: "HURRICANE", hint: "Powerful swirling tropical storm" },
    { word: "THUNDER", hint: "Sound following a flash of lightning" },
    { word: "OCEAN", hint: "Massive body of salt water" },
    { word: "DIAMOND", hint: "Hardest natural mineral" },
    { word: "FOREST", hint: "Large area covered chiefly with trees" },
    { word: "KANGAROO", hint: "Australian animal that hops" },
    { word: "GIRAFFE", hint: "Animal with a very long neck" },
    { word: "OCTOPUS", hint: "Sea creature with eight arms" },
    { word: "CHAMELEON", hint: "Lizard that changes color" },
    { word: "PLATYPUS", hint: "Egg-laying mammal with a duck bill" },
    { word: "SQUIRREL", hint: "Nut-gathering rodent with a bushy tail" },
    { word: "SCORPION", hint: "Arachnid with a venomous stinger" },
    { word: "DINOSAUR", hint: "Extinct prehistoric reptile" },
    { word: "ALGORITHM", hint: "Step-by-step procedure for calculations" },
    { word: "INTERNET", hint: "Global network of computers" },
    { word: "SATELLITE", hint: "Object orbiting a planet" },
    { word: "TELESCOPE", hint: "Instrument used to see distant stars" },
    { word: "DATABASE", hint: "Organized collection of structured data" },
    { word: "MICROSCOPE", hint: "Tool used to see tiny objects" },
    { word: "ASTRONAUT", hint: "Person trained to travel in space" },
    { word: "BLUETOOTH", hint: "Wireless technology for short distances" },
    { word: "SPAGHETTI", hint: "Long, thin Italian noodles" },
    { word: "PINEAPPLE", hint: "Spiky tropical fruit" },
    { word: "SANDWICH", hint: "Food items between two slices of bread" },
    { word: "AVOCADO", hint: "Green fruit used to make guacamole" },
    { word: "COFFEE", hint: "Caffeinated morning beverage" },
    { word: "MUSHROOM", hint: "Type of fungus often eaten on pizza" },
    { word: "PANCAKE", hint: "Flat, round breakfast cake" },
    { word: "LEMONADE", hint: "Drink made from citrus and sugar" },
    { word: "UMBRELLA", hint: "Protection from rain or sun" },
    { word: "BACKPACK", hint: "Bag carried on one's back" },
    { word: "CALENDAR", hint: "System for organizing days and months" },
    { word: "BINOCULARS", hint: "Device used for seeing far away" },
    { word: "HEADPHONES", hint: "Device worn over ears to listen to music" },
    { word: "FLASHLIGHT", hint: "Portable battery-operated light" },
    { word: "MIRROR", hint: "Surface that reflects an image" },
    { word: "BICYCLE", hint: "Two-wheeled vehicle powered by pedals" },
    { word: "ADVENTURE", hint: "Exciting or unusual experience" },
    { word: "SYMPHONY", hint: "Elaborate musical composition for orchestra" },
    { word: "CHESS", hint: "Strategic board game with a King and Queen" },
    { word: "LABYRINTH", hint: "A complicated irregular network of passages" },
    { word: "MYSTERY", hint: "Something that is difficult to explain" },
    { word: "LIBRARY", hint: "Place where books are kept" },
    { word: "PYRAMID", hint: "Ancient triangular stone structure" },
    { word: "CARNIVAL", hint: "Traveling amusement show or festival" },
    { word: "JOURNEY", hint: "The act of traveling from one place to another" },
    { word: "WHISPER", hint: "Speaking in a very quiet breathy voice" },
  ],
  ru: [
    { word: "КОМПЬЮТЕР", hint: "Электронное устройство для обработки данных" },
    { word: "КЛАВИАТУРА", hint: "Устройство ввода компьютера" },
    { word: "БАБОЧКА", hint: "Насекомое с красивыми крыльями" },
    { word: "СЛОН", hint: "Крупнейшее наземное животное" },
    { word: "РАДУГА", hint: "Цветная дуга в небе" },
    { word: "ШОКОЛАД", hint: "Сладкое коричневое лакомство" },
    { word: "ВУЛКАН", hint: "Гора которая извергает лаву" },
    { word: "ВОДОПАД", hint: "Вода реки падающая с высоты" },
    { word: "УРАГАН", hint: "Мощный тропический шторм" },
    { word: "АЛМАЗ", hint: "Самый твёрдый природный минерал" },
    { word: "ЖИРАФ", hint: "Животное с очень длинной шеей" },
    { word: "ОСЬМИНОГ", hint: "Морское существо с восемью руками" },
    { word: "ДИНОЗАВР", hint: "Вымершая доисторическая рептилия" },
    { word: "АЛГОРИТМ", hint: "Пошаговая процедура для вычислений" },
    { word: "ИНТЕРНЕТ", hint: "Глобальная сеть компьютеров" },
    { word: "СПУТНИК", hint: "Объект вращающийся вокруг планеты" },
    { word: "ТЕЛЕСКОП", hint: "Инструмент для наблюдения за звёздами" },
    { word: "КОСМОНАВТ", hint: "Человек путешествующий в космос" },
    { word: "АНАНАС", hint: "Тропический колючий фрукт" },
    { word: "АВОКАДО", hint: "Зелёный фрукт для гуакамоле" },
    { word: "ГРИБ", hint: "Гриб который едят на пицце" },
    { word: "ЗОНТ", hint: "Защита от дождя или солнца" },
    { word: "КАЛЕНДАРЬ", hint: "Система организации дней и месяцев" },
    { word: "НАУШНИКИ", hint: "Устройство для прослушивания музыки" },
    { word: "ЗЕРКАЛО", hint: "Поверхность отражающая изображение" },
    { word: "ВЕЛОСИПЕД", hint: "Транспорт на двух колёсах с педалями" },
    { word: "ПРИКЛЮЧЕНИЕ", hint: "Захватывающий или необычный опыт" },
    { word: "СИМФОНИЯ", hint: "Музыкальное произведение для оркестра" },
    { word: "ЛАБИРИНТ", hint: "Сложная сеть проходов" },
    { word: "БИБЛИОТЕКА", hint: "Место где хранятся книги" },
    { word: "ПИРАМИДА", hint: "Древнее треугольное каменное сооружение" },
    { word: "ПИНГВИН", hint: "Птица которая не летает но плавает" },
    { word: "КЕНГУРУ", hint: "Австралийское прыгающее животное" },
    { word: "ХАМЕЛЕОН", hint: "Ящерица которая меняет цвет" },
    { word: "УТКОНОС", hint: "Яйцекладущее млекопитающее с утиным клювом" },
    { word: "СОЛНЦЕ", hint: "Звезда нашей солнечной системы" },
    { word: "ОКЕАН", hint: "Огромное тело солёной воды" },
    { word: "РАДОСТЬ", hint: "Чувство большого счастья" },
    { word: "ШАХМАТЫ", hint: "Стратегическая настольная игра" },
    { word: "КАРНАВАЛ", hint: "Праздник с весёлыми гуляниями" },
  ],
  uz: [
    { word: "NON", hint: "Har kuni yeyiladigan asosiy taom" },
    { word: "CHOY", hint: "Issiq ichimlik, o'zbek uyida har doim bor" },
    { word: "OSHPAZ", hint: "Ovqat pishiradigan odam" },
    { word: "BOZOR", hint: "Savdo qilinadigan ochiq joy" },
    { word: "MAKTAB", hint: "Bolalar o'qiydigan joy" },
    { word: "KITOB", hint: "O'qiladigan narsa, sahifalari bor" },
    { word: "DERAZA", hint: "Uyning yorug' kiradigan oynali joyi" },
    { word: "STOL", hint: "Ustiga narsa qo'yiladigan mebel" },
    { word: "KALIT", hint: "Eshikni ochadigan narsa" },
    { word: "TELEFON", hint: "Gaplashish va internet uchun ishlatiladigan qurilma" },
    { word: "MASHINA", hint: "To'rt g'ildirakli transport" },
    { word: "AVTOBUS", hint: "Ko'p odam tashiydigan katta transport" },
    { word: "BOLA", hint: "Kichik yosh inson" },
    { word: "ONA", hint: "Seni tug'gan ayol" },
    { word: "OTA", hint: "Oiladagi erkak bosh" },
    { word: "AKA", hint: "Katta erkak birodar" },
    { word: "OPA", hint: "Katta ayol birodar" },
    { word: "UY", hint: "Odamlar yashaydigan bino" },
    { word: "BOG", hint: "Meva va sabzavot o'stiriladi" },
    { word: "QOVUN", hint: "Yozda yeyiladigan shirin sariq meva" },
    { word: "TARVUZ", hint: "Yashil po'stloqli qizil shirin meva" },
    { word: "OLMA", hint: "Qizil yoki yashil dumaloq meva" },
    { word: "NOK", hint: "Uzunchoq shakldagi shirin meva" },
    { word: "GILOS", hint: "Kichkina qizil shirin meva" },
    { word: "PIYOZ", hint: "Ovqatga ta'm beradigan achchiq sabzavot" },
    { word: "SABZI", hint: "To'q sariq rangli uzun sabzavot" },
    { word: "POMIDOR", hint: "Qizil dumaloq sabzavot, salatda ishlatiladi" },
    { word: "GURUCH", hint: "Oshning asosiy ingrediyenti" },
    { word: "MUSHUK", hint: "Uyda saqlanadigan, miyovlaydigan hayvon" },
    { word: "IT", hint: "Uyda saqlanadigan, vovullaydigan hayvon" },
    { word: "SIGIR", hint: "Sut beradigan qishloq hayvoni" },
    { word: "OT", hint: "Minib yuriladigan tez hayvon" },
    { word: "TOVUQ", hint: "Tuxum beradigan uy parranda" },
    { word: "QUSH", hint: "Uchib yuradigan qanotli jonzot" },
    { word: "BALIK", hint: "Suvda yashaydigan suzuvchi jonzot" },
    { word: "DARAXT", hint: "Shoxlari va barglari bor katta o'simlik" },
    { word: "KOSA", hint: "Ichiga ovqat solinadigan yumaloq idish" },
    { word: "PIYOLA", hint: "Choy ichiladigan kichik idish" },
    { word: "SICHQON", hint: "Kichik, tez yuguradigan kemiruvchi hayvon" },
    { word: "SUPUR", hint: "Polni tozalaydigan asbob" },
  ],
};

const DIFFICULTY = {
  easy:   { label: "Easy",   maxWrong: 8, showHint: true,  color: "#16a34a", bg: "#f0fdf4", border: "#86efac", badge: "#dcfce7", badgeText: "#15803d" },
  medium: { label: "Medium", maxWrong: 6, showHint: true,  color: "#d97706", bg: "#fffbeb", border: "#fcd34d", badge: "#fef3c7", badgeText: "#92400e" },
  hard:   { label: "Hard",   maxWrong: 4, showHint: false, color: "#dc2626", bg: "#fef2f2", border: "#fecaca", badge: "#fee2e2", badgeText: "#991b1b" },
};

const KEYBOARDS = {
  en: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  ru: "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ".split(""),
  uz: ["A","B","D","E","F","G","G'","H","I","J","K","L","M","N","NG","O","O'","P","Q","R","S","SH","T","U","V","X","Y","Z","CH"],
};

const BODY_PARTS = [
  <circle key="head" cx="100" cy="47" r="12" fill="none" stroke="#ef4444" strokeWidth="3" />,
  <line key="body" x1="100" y1="59" x2="100" y2="95" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />,
  <line key="larm" x1="100" y1="68" x2="82" y2="82" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />,
  <line key="rarm" x1="100" y1="68" x2="118" y2="82" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />,
  <line key="lleg" x1="100" y1="95" x2="82" y2="115" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />,
  <line key="rleg" x1="100" y1="95" x2="118" y2="115" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />,
];

function pickRandom(lang) {
  const arr = WORDS[lang];
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function GuessTheWord() {
  const navigate = useNavigate();
  const [lang, setLang] = useState("en");
  const [difficulty, setDifficulty] = useState("medium");
  const [wordData, setWordData] = useState(() => pickRandom("en"));
  const [guessed, setGuessed] = useState(new Set());
  const [wrong, setWrong] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const diff = DIFFICULTY[difficulty];
  const maxWrong = diff.maxWrong;
  const won = gameOver && wordData.word.split("").every((l) => guessed.has(l));
  const triesLeft = maxWrong - wrong;

  const partsToShow = Math.round((wrong / maxWrong) * 6);

  useEffect(() => {
    const handler = (e) => {
      if (/^[a-zA-ZА-Яа-яЁё]$/.test(e.key)) guess(e.key.toUpperCase());
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [guessed, gameOver]);

  function guess(letter) {
    if (guessed.has(letter) || gameOver) return;
    const next = new Set(guessed).add(letter);
    setGuessed(next);
    if (!wordData.word.includes(letter)) {
      const newWrong = wrong + 1;
      setWrong(newWrong);
      if (newWrong >= maxWrong) setGameOver(true);
    } else if (wordData.word.split("").every((l) => next.has(l))) {
      setGameOver(true);
    }
  }

  function reset() {
    setWordData(pickRandom(lang));
    setGuessed(new Set());
    setWrong(0);
    setGameOver(false);
  }

  function handleLangChange(newLang) {
    setLang(newLang);
    setWordData(pickRandom(newLang));
    setGuessed(new Set());
    setWrong(0);
    setGameOver(false);
  }

  function handleDiffChange(newDiff) {
    setDifficulty(newDiff);
    setWordData(pickRandom(lang));
    setGuessed(new Set());
    setWrong(0);
    setGameOver(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "Segoe UI, sans-serif" }}>
      <div style={{ background: "white", borderRadius: 20, boxShadow: "0 4px 32px rgba(0,0,0,0.10)", padding: "40px 32px", width: "100%", maxWidth: 560 }}>
        <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748b", background: "none", border: "none", cursor: "pointer", marginBottom: 24, fontSize: 15 }}>
          <ArrowLeft size={18} /> Back to Games
        </button>
        <h1 style={{ textAlign: "center", fontSize: 28, fontWeight: 800, color: "#1e293b", margin: 0 }}>Guess the Word</h1>
        <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 14, marginTop: 4, marginBottom: 20 }}>Guess the word letter by letter</p>

        {/* Language Selector */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 12 }}>
          {[["en", "English"], ["ru", "Русский"], ["uz", "O'zbek"]].map(([code, label]) => (
            <button
              key={code}
              onClick={() => handleLangChange(code)}
              style={{
                padding: "6px 18px",
                borderRadius: 999,
                border: lang === code ? "none" : "1.5px solid #e2e8f0",
                background: lang === code ? "#2563eb" : "transparent",
                color: lang === code ? "white" : "#64748b",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Difficulty Selector */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16 }}>
          {Object.entries(DIFFICULTY).map(([key, val]) => (
            <button
              key={key}
              onClick={() => handleDiffChange(key)}
              style={{
                padding: "6px 18px",
                borderRadius: 999,
                border: difficulty === key ? "none" : "1.5px solid #e2e8f0",
                background: difficulty === key ? val.color : "transparent",
                color: difficulty === key ? "white" : "#64748b",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {val.label}
            </button>
          ))}
        </div>

        {/* Difficulty info badges */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20 }}>
          <span style={{ background: diff.badge, color: diff.badgeText, fontSize: 12, fontWeight: 700, padding: "4px 14px", borderRadius: 999, border: `1.5px solid ${diff.border}` }}>
            {maxWrong} mistakes allowed
          </span>
          <span style={{
            background: diff.showHint ? "#eff6ff" : "#f8fafc",
            color: diff.showHint ? "#1d4ed8" : "#94a3b8",
            fontSize: 12, fontWeight: 700, padding: "4px 14px", borderRadius: 999,
            border: `1.5px solid ${diff.showHint ? "#bfdbfe" : "#e2e8f0"}`
          }}>
            {diff.showHint ? "💡 Hint on" : "🚫 No hint"}
          </span>
        </div>

        {/* Gallows */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <svg viewBox="0 0 160 160" style={{ width: 150, height: 150 }}>
            <line x1="20" y1="150" x2="140" y2="150" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
            <line x1="60" y1="150" x2="60" y2="20" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
            <line x1="60" y1="20" x2="100" y2="20" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
            <line x1="100" y1="20" x2="100" y2="35" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
            {BODY_PARTS.slice(0, partsToShow)}
          </svg>
        </div>

        {/* Tries */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <span style={{ background: "#fef2f2", color: "#dc2626", fontWeight: 700, fontSize: 14, padding: "6px 18px", borderRadius: 999, border: "1.5px solid #fecaca" }}>
            {triesLeft} {triesLeft === 1 ? "try" : "tries"} left
          </span>
        </div>

        {/* Hint */}
        {diff.showHint && (
          <div style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
            <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", margin: 0 }}>Hint</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#1d4ed8", margin: "4px 0 0" }}>{wordData.hint}</p>
          </div>
        )}

        {/* Word display */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 24 }}>
          {wordData.word.split("").map((letter, i) => (
            <div key={i} style={{ width: 40, height: 52, borderBottom: "3px solid #3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#1e293b" }}>
              {guessed.has(letter) ? letter : ""}
            </div>
          ))}
        </div>

        {/* Keyboard */}
        <p style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>Click a letter or use your keyboard</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 24 }}>
          {KEYBOARDS[lang].map((letter) => {
            const isGuessed = guessed.has(letter);
            const isCorrect = isGuessed && wordData.word.includes(letter);
            const isWrong = isGuessed && !wordData.word.includes(letter);
            let bg = "#f8fafc", color = "#334155", border = "1.5px solid #e2e8f0", cursor = "pointer";
            if (isCorrect) { bg = "#22c55e"; color = "white"; border = "none"; }
            else if (isWrong) { bg = "#ef4444"; color = "white"; border = "none"; }
            else if (gameOver) { color = "#cbd5e1"; cursor = "not-allowed"; }
            return (
              <button
                key={letter}
                onClick={() => guess(letter)}
                disabled={isGuessed || gameOver}
                style={{ minWidth: 40, height: 40, padding: "0 6px", borderRadius: 8, border, background: bg, color, fontSize: 13, fontWeight: 600, cursor, transition: "all 0.1s" }}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* Result */}
        {gameOver && (
          <div>
            <div style={{ background: won ? "#f0fdf4" : "#fef2f2", border: `1.5px solid ${won ? "#86efac" : "#fecaca"}`, borderRadius: 12, padding: 16, textAlign: "center", marginBottom: 12 }}>
              <p style={{ fontSize: 20, fontWeight: 800, color: won ? "#15803d" : "#b91c1c", margin: 0 }}>
                {won ? "🎉 You Won!" : "💀 Game Over"}
              </p>
              <p style={{ fontSize: 14, color: won ? "#16a34a" : "#dc2626", margin: "4px 0 0" }}>
                {won ? "You guessed: " : "The word was: "}<strong>{wordData.word}</strong>
              </p>
            </div>
            <button
              onClick={reset}
              style={{ width: "100%", background: "#2563eb", color: "white", border: "none", borderRadius: 12, padding: "14px 0", fontSize: 16, fontWeight: 700, cursor: "pointer" }}
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}