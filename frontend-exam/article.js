function getArticleIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function loadArticle() {
  const id = getArticleIdFromUrl();
  if (!id) {
    document.querySelector(".article-page").innerHTML =
      "<p>Не указан id статьи</p>";
    return;
  }

  const response = await fetch(`/articles/${id}`);
  if (!response.ok) {
    document.querySelector(".article-page").innerHTML =
      "<p>Статья не найдена</p>";
    return;
  }

  const a = await response.json();

  document.querySelector(".article-hero__img").src = a.image_url;
  document.querySelector(".article-hero__img").alt = a.game_name;
  document.querySelector(".article-title").textContent = a.article_title;

  // content — длинный текст статьи
  const bodyEl = document.querySelector(".article-body");
  bodyEl.textContent = a.content; // если хочешь поддерживать \n -> <br>, можно доработать
}

loadArticle();
