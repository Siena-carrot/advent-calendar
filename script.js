const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx8ZdlUttqlPuwG-PmqRogNAK0gACct54dFSOAqGpVy8xx7SUJ7LeJuQPIRZ8Wa-gT_Rw/exec';

async function fetchCSVData() {
  const res = await fetch(SCRIPT_URL);
  const data = await res.json();
  return data;
}

function getRandomSubset(array, k) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, k);
}

function getCardRarity(day) {
  if (day === 24) return "card-special";
  if ([3, 10, 17].includes(day)) return "card-legendary";
  if ([6, 12, 18].includes(day)) return "card-epic";
  if ([9, 15, 21].includes(day)) return "card-rare";
  return "";
}

function renderCalendar(today, openedDays) {
  const calendar = document.getElementById("calendar");
  for (let i = 1; i <= 24; i++) {
    const box = document.createElement("div");
    box.classList.add("day");
    box.textContent = `${i}`;

    if (i > today) {
      box.classList.add("locked");
    } else {
      box.addEventListener("click", () => openDay(i));
      if (openedDays.includes(i)) {
        box.classList.add("opened");
        const rarityClass = getCardRarity(i);
        if (rarityClass) {
          box.classList.add(rarityClass);
        }
      }
    }

    calendar.appendChild(box);
  }
}

function openDay(day) {
  const entry = userContent[day - 1];
  document.getElementById("modalContent").textContent = entry.contents;
  document.getElementById("contentModal").classList.remove("hidden");

  if (!openedDays.includes(day)) {
    openedDays.push(day);
    localStorage.setItem("openedDays", JSON.stringify(openedDays));
    const dayElement = document.querySelectorAll(".day")[day - 1];
    dayElement.classList.add("opened");
    const rarityClass = getCardRarity(day);
    if (rarityClass) {
      dayElement.classList.add(rarityClass);
    }
  }

  document.getElementById("shareButton").onclick = () => {
    const pageUrl = window.location.href;
    const text = `今日は12月${day}日、アドベントカレンダーを開けました！\n${entry.contents}\n\n${pageUrl}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };
}

document.getElementById("closeModal").onclick = () => {
  document.getElementById("contentModal").classList.add("hidden");
};

document.getElementById("howToPlayButton").onclick = () => {
  document.getElementById("howToPlayModal").classList.remove("hidden");
};

document.getElementById("closeHowToPlay").onclick = () => {
  document.getElementById("howToPlayModal").classList.add("hidden");
};

let userContent = [];
let openedDays = JSON.parse(localStorage.getItem("openedDays") || "[]");

(async () => {
  const allData = await fetchCSVData();
  
  if (allData.length < 24) {
    document.getElementById("splash").classList.add("hidden");
    alert(`エラー: スプレッドシートのデータが不足しています。\n現在: ${allData.length}件\n必要: 24件以上`);
    return;
  }
  
  if (!localStorage.getItem("userContent") || JSON.parse(localStorage.getItem("userContent")).length < 24) {
    const selected = getRandomSubset(allData, 24);
    localStorage.setItem("userContent", JSON.stringify(selected));
  }
  userContent = JSON.parse(localStorage.getItem("userContent"));
  const today = new Date();
  // テスト用: 11月でも機能するように変更 (12月用は === 11)
  const day = today.getMonth() === 10 ? today.getDate() : 0;
  renderCalendar(day, openedDays);
  
  const splash = document.getElementById("splash");
  splash.classList.add("fade-out");
  setTimeout(() => {
    splash.classList.add("hidden");
  }, 500);
})();