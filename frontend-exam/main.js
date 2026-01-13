let allArticles = [];
let currentGenre = "all";
let currentQuery = "";

/* ==============================
   ФИЛЬТРЫ И ЗАГРУЗКА СТАТЕЙ
   ============================== */

function setupGenreFilter() {
  const select = document.getElementById("genreSelect");
  if (!select) return;

  select.addEventListener("change", () => {
    currentGenre = select.value;
    applyFilters();
  });
}

function setupSearch() {
  const input = document.querySelector(".search-input");
  if (!input) return;

  input.addEventListener("input", () => {
    currentQuery = input.value;
    applyFilters();
  });
}

async function loadArticles() {
  const response = await fetch("/articles");
  const articles = await response.json();
  allArticles = articles;

  applyFilters();
}

function applyFilters() {
  let filtered = [...allArticles];

  // жанр
  if (currentGenre !== "all") {
    filtered = filtered.filter((a) => a.genre === currentGenre);
  }

  // поиск
  if (currentQuery.trim() !== "") {
    const q = currentQuery.trim().toLowerCase();
    filtered = filtered.filter((a) =>
      a.article_title.toLowerCase().includes(q)
    );
  }

  // блок "Новые" — только если жанр all
  if (currentGenre === "all") {
    const sortedByDate = [...allArticles].sort((a, b) =>
      (b.published_at || "").localeCompare(a.published_at || "")
    );
    const newest = sortedByDate.slice(0, 4);
    renderNewArticles(newest);
  } else {
    renderNewArticles([]);
  }

  // блок "Самые просматриваемые" — тоже только если жанр all
  if (currentGenre === "all") {
    const sortedByViews = [...allArticles].sort(
      (a, b) => (b.views || 0) - (a.views || 0)
    );
    const mostViewed = sortedByViews.slice(0, 4);
    renderPopularArticles(mostViewed);
  } else {
    renderPopularArticles([]);
  }

  if (filtered.length === 0) {
    clearFeatured();
    clearArticlesList();
    return;
  }

  const [featured, ...rest] = filtered;
  renderFeatured(featured);
  renderArticles(rest);
}

/* ==============================
   РЕНДЕР КАРТОЧЕК
   ============================== */

function renderFeatured(article) {
  const container = document.querySelector(".featured-article");
  if (!container) return;

  if (!article) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <a class="featured-card" href="/article.html?id=${article.id}">
      <div class="featured-card__bg" style="background-image: url('${article.image_url}')"></div>
      <div class="featured-card__overlay">
        <p class="featured-card__genre">${article.genre}</p>
        <h2 class="featured-card__title">${article.article_title}</h2>
        <p class="featured-card__meta">${article.published_at}</p>
      </div>
    </a>
  `;
}

function clearFeatured() {
  const container = document.querySelector(".featured-article");
  if (container) {
    container.innerHTML = "";
  }
}

function renderArticles(list) {
  const listEl = document.querySelector(".articles-list");
  if (!listEl) return;

  listEl.innerHTML = "";

  list.forEach((a) => {
    const card = document.createElement("a");
    card.className = "article-card";
    card.href = `/article.html?id=${a.id}`;

    card.innerHTML = `
      <div class="article-card__bg" style="background-image: url('${a.image_url}')"></div>
      <div class="article-card__overlay">
        <h2 class="article-card__title">${a.article_title}</h2>
        <p class="article-card__date">${a.published_at}</p>
      </div>
    `;

    listEl.appendChild(card);
  });
}

function clearArticlesList() {
  const listEl = document.querySelector(".articles-list");
  if (listEl) {
    listEl.innerHTML = "";
  }
}

/* ==============================
   БЛОК "НОВЫЕ"
   ============================== */

function renderNewArticles(articles) {
  const section = document.getElementById("newArticlesSection");
  const container = document.querySelector(".new-articles__list");
  if (!section || !container) return;

  container.innerHTML = "";

  if (!articles || articles.length === 0) {
    section.style.display = "none";
    return;
  }

  section.style.display = "block";

  articles.forEach((article) => {
    const card = document.createElement("a");
    card.className = "new-article-card";
    card.href = `article.html?id=${article.id}`;

    const bg = document.createElement("div");
    bg.className = "new-article-card__bg";
    bg.style.backgroundImage = `url('${article.image_url}')`;

    const overlay = document.createElement("div");
    overlay.className = "new-article-card__overlay";

    const titleEl = document.createElement("h3");
    titleEl.className = "new-article-card__title";
    titleEl.textContent = article.article_title;

    const dateEl = document.createElement("p");
    dateEl.className = "new-article-card__date";
    dateEl.textContent = article.published_at;

    overlay.appendChild(titleEl);
    overlay.appendChild(dateEl);

    card.appendChild(bg);
    card.appendChild(overlay);

    container.appendChild(card);
  });
}
function renderPopularArticles(articles) {
  const section = document.getElementById("popularArticlesSection");
  const container = document.querySelector(".popular-articles__list");
  if (!section || !container) return;

  container.innerHTML = "";

  if (!articles || articles.length === 0) {
    section.style.display = "none";
    return;
  }

  section.style.display = "block";

  articles.forEach((article) => {
    const card = document.createElement("a");
    card.className = "new-article-card"; // те же стили
    card.href = `article.html?id=${article.id}`;

    const bg = document.createElement("div");
    bg.className = "new-article-card__bg";
    bg.style.backgroundImage = `url('${article.image_url}')`;

    const overlay = document.createElement("div");
    overlay.className = "new-article-card__overlay";

    const titleEl = document.createElement("h3");
    titleEl.className = "new-article-card__title";
    titleEl.textContent = article.article_title;

    const metaEl = document.createElement("p");
    metaEl.className = "new-article-card__date";
    metaEl.textContent = `Просмотры: ${article.views ?? 0}`;

    overlay.appendChild(titleEl);
    overlay.appendChild(metaEl);

    card.appendChild(bg);
    card.appendChild(overlay);

    container.appendChild(card);
  });
}

/* ==============================
   МОДАЛКА ЛОГИНА
   ============================== */

function setupLoginModal() {
  const profileBtn = document.getElementById("profileButton");
  const modal = document.getElementById("loginModal");
  const backdrop = modal?.querySelector(".login-modal__backdrop");
  const closeBtn = modal?.querySelector(".login-modal__close");
  const form = document.getElementById("loginForm");
  const errorEl = document.getElementById("loginError");

  if (!profileBtn || !modal || !form) return;

  function openModal() {
    modal.classList.add("login-modal--open");
    errorEl.textContent = "";
    form.reset();
  }

  function closeModal() {
    modal.classList.remove("login-modal--open");
  }

  profileBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  backdrop.addEventListener("click", closeModal);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";

    const formData = new FormData(form);
    const login = formData.get("login");
    const password = formData.get("password");

    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        errorEl.textContent = data.error || "Ошибка входа";
        return;
      }

      localStorage.setItem("userRole", data.role);
      localStorage.setItem("userLogin", data.login);

      closeModal();

      profileBtn.textContent = data.role === "admin" ? "🛠️" : "👤";
      profileBtn.title =
        data.role === "admin" ? "Администратор" : "Пользователь";

      // если админ — просто остаёмся на главной, кнопка "Админка" уже появится
      // переход в admin.html теперь делаем по кнопке, а не сразу после логина
    } catch (err) {
      console.error(err);
      errorEl.textContent = "Ошибка сети";
    }
  });
}

/* ==============================
   КНОПКА "АДМИНКА"
   ============================== */

function setupAdminButtonVisibility() {
  const adminBtn = document.getElementById("adminButton");
  if (!adminBtn) return;

  const role = localStorage.getItem("userRole");
  if (role === "admin") {
    adminBtn.style.display = "inline-block";
  } else {
    adminBtn.style.display = "none";
  }

  adminBtn.addEventListener("click", () => {
    window.location.href = "admin.html";
  });
}

/* ==============================
   ИНИЦИАЛИЗАЦИЯ
   ============================== */

document.addEventListener("DOMContentLoaded", () => {
  setupLoginModal();
  setupAdminButtonVisibility();
  setupGenreFilter();
  setupSearch();
  loadArticles();
});
