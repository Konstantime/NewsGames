// admin.js

document.addEventListener("DOMContentLoaded", () => {
  // простая проверка роли на фронте
  const role = localStorage.getItem("userRole");
  if (role !== "admin") {
    window.location.href = "index.html";
    return;
  }

  // кнопка "На главную"
  const backBtn = document.getElementById("adminBackButton");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

  setupAdminPage();
});

function setupAdminPage() {
  const reloadBtn = document.getElementById("reloadArticlesBtn");
  const tableBody = document.querySelector("#adminArticlesTable tbody");
  const addForm = document.getElementById("addArticleForm");
  const errorEl = document.getElementById("addArticleError");
  const successEl = document.getElementById("addArticleSuccess");

  if (!reloadBtn || !tableBody || !addForm) {
    console.error("Элементы админки не найдены");
    return;
  }

  async function loadArticles() {
    const res = await fetch("/admin/articles");
    if (!res.ok) {
      console.error("Ошибка загрузки статей админкой");
      const text = await res.text();
      console.error("Ответ сервера:", text);
      return;
    }

    const articles = await res.json();
    console.log("articles from admin =", articles);

    tableBody.innerHTML = "";

    articles.forEach((a) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${a.id}</td>
        <td>${a.article_title}</td>
        <td>${a.published_at || ""}</td>
        <td>${a.genre || ""}</td>
        <td>
          <button class="admin-articles__delete-btn" data-id="${a.id}">
            Удалить
          </button>
        </td>
      `;

      tableBody.appendChild(tr);
    });
  }

  async function deleteArticle(id) {
    if (!confirm(`Точно удалить статью #${id}?`)) return;

    const res = await fetch(`/admin/articles/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("Ошибка удаления");
      return;
    }

    await loadArticles();
  }

  tableBody.addEventListener("click", (e) => {
    const btn = e.target.closest(".admin-articles__delete-btn");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    deleteArticle(id);
  });

  reloadBtn.addEventListener("click", loadArticles);

  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";
    successEl.textContent = "";

    const formData = new FormData(addForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        errorEl.textContent = data.error || "Ошибка создания статьи";
        return;
      }

      addForm.reset();
      successEl.textContent = "Статья создана";
      await loadArticles();
    } catch (err) {
      console.error(err);
      errorEl.textContent = "Ошибка сети";
    }
  });

  loadArticles();
}
