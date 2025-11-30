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
  const contentId = userContentIds[day - 1];
  const entry = allData.find(item => item.id == contentId);
  
  if (!entry) return;
  
  const contentType = (entry.kind == 1 || entry.kind == "1") ? "雑学メモ" : "ネタツイの下書き";
  
  document.getElementById("contentTypeLabel").textContent = `${contentType}が入っていたよ！`;
  document.getElementById("modalContent").textContent = entry.contents;
  document.getElementById("modalContent").style.whiteSpace = "pre-wrap";
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
    const baseUrl = window.location.origin + window.location.pathname;
    const pageUrl = `${baseUrl}?contentId=${contentId}`;
    const displayContent = entry.contents.length > 77 ? entry.contents.substring(0, 74) + "　……" : entry.contents;
    const text = `／\n12月${day}日分の #旧Twittermasアドベントカレンダー を開けたよ！\n中身は${contentType}でした\n＼\n\n${displayContent}\n\n${pageUrl}`;
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

document.getElementById("goToMyCalendar").onclick = () => {
  window.location.href = window.location.origin + window.location.pathname;
};

// モーダル背景クリックで閉じる
document.getElementById("contentModal").onclick = (e) => {
  if (e.target.id === "contentModal") {
    document.getElementById("contentModal").classList.add("hidden");
  }
};

document.getElementById("howToPlayModal").onclick = (e) => {
  if (e.target.id === "howToPlayModal") {
    document.getElementById("howToPlayModal").classList.add("hidden");
  }
};

let userContentIds = [];
let openedDays = JSON.parse(localStorage.getItem("openedDays") || "[]");
let allData = [];

(async () => {
  allData = await fetchCSVData();
  
  if (allData.length < 24) {
    document.getElementById("splash").classList.add("hidden");
    alert(`エラー: スプレッドシートのデータが不足しています。\n現在: ${allData.length}件\n必要: 24件以上`);
    return;
  }
  
  // URLパラメータをチェック
  const urlParams = new URLSearchParams(window.location.search);
  const contentId = urlParams.get('contentId');
  
  if (contentId) {
    // 共有コンテンツモード
    const sharedContent = allData.find(item => item.id == contentId);
    if (sharedContent) {
      const sharedContentType = (sharedContent.kind == 1 || sharedContent.kind == "1") ? "雑学メモ" : "ネタツイの下書き";
      document.getElementById("sharedContentTypeLabel").textContent = `だれかが開けたアドベントカレンダーの中身を見せてもらったら、${sharedContentType}が入っていたよ！`;
      document.getElementById("sharedContentBody").textContent = sharedContent.contents;
      document.getElementById("sharedContentBody").style.whiteSpace = "pre-wrap";
      document.getElementById("sharedContentModal").classList.remove("hidden");
    }
    
    const splash = document.getElementById("splash");
    splash.classList.add("fade-out");
    setTimeout(() => {
      splash.classList.add("hidden");
    }, 500);
    
    return; // 通常のカレンダー表示をスキップ
  }
  
  // 通常モード - IDのみ保存
  if (!localStorage.getItem("userContentIds") || JSON.parse(localStorage.getItem("userContentIds")).length < 24) {
    const selected = getRandomSubset(allData, 24);
    const selectedIds = selected.map(item => item.id);
    localStorage.setItem("userContentIds", JSON.stringify(selectedIds));
  }
  userContentIds = JSON.parse(localStorage.getItem("userContentIds"));
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