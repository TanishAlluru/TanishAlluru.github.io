// 10_js.js

// Runs after the HTML is parsed because we use `defer`
document.addEventListener("DOMContentLoaded", () => {
  // Requirement: menus should appear only after clicking buttons.
  // We'll start with both hidden, then show filter by default if you want.
  const filterForm = document.getElementById("filterContent");
  const newForm = document.getElementById("newContent");

  if (filterForm) filterForm.style.display = "none"; // hide until "Filter Articles"
  if (newForm) newForm.style.display = "none";       // already hidden in CSS, but enforce

  // Apply filtering once on load (in case checkboxes changed)
  filterArticles();
});

function showFilter() {
  const filterForm = document.getElementById("filterContent");
  const newForm = document.getElementById("newContent");

  if (!filterForm || !newForm) return;

  // Toggle filter menu
  const isShowing = filterForm.style.display !== "none";
  filterForm.style.display = isShowing ? "none" : "block";

  // Always hide the add-new form when opening filter
  newForm.style.display = "none";
}

function showAddNew() {
  const filterForm = document.getElementById("filterContent");
  const newForm = document.getElementById("newContent");

  if (!filterForm || !newForm) return;

  // Toggle add-new menu
  const isShowing = newForm.style.display !== "none";
  newForm.style.display = isShowing ? "none" : "flex";

  // Always hide filter menu when opening add-new
  filterForm.style.display = "none";
}

function filterArticles() {
  const opinionOn = document.getElementById("opinionCheckbox")?.checked ?? true;
  const recipeOn = document.getElementById("recipeCheckbox")?.checked ?? true;
  const updateOn = document.getElementById("updateCheckbox")?.checked ?? true;

  // Show/hide articles by class
  document.querySelectorAll("article.opinion").forEach(a => {
    a.style.display = opinionOn ? "" : "none";
  });

  document.querySelectorAll("article.recipe").forEach(a => {
    a.style.display = recipeOn ? "" : "none";
  });

  document.querySelectorAll("article.update").forEach(a => {
    a.style.display = updateOn ? "" : "none";
  });
}

function addNewArticle() {
  const titleEl = document.getElementById("inputHeader");
  const textEl = document.getElementById("inputArticle");

  const title = (titleEl?.value ?? "").trim();
  const text = (textEl?.value ?? "").trim();

  // Determine selected type
  const opinion = document.getElementById("opinionRadio")?.checked ?? false;
  const recipe = document.getElementById("recipeRadio")?.checked ?? false;
  const update = document.getElementById("lifeRadio")?.checked ?? false;

  let typeClass = "";
  let typeLabel = "";

  if (opinion) {
    typeClass = "opinion";
    typeLabel = "Opinion";
  } else if (recipe) {
    typeClass = "recipe";
    typeLabel = "Recipe";
  } else if (update) {
    typeClass = "update";
    typeLabel = "Update";
  }

  // Basic validation
  if (!title || !text || !typeClass) {
    alert("Please enter a Title, select a Type, and enter Text.");
    return;
  }

  const list = document.getElementById("articleList");
  if (!list) return;

  // Build the new <article> to match existing structure/styles
  const article = document.createElement("article");
  article.className = typeClass;
  article.id = `user_${Date.now()}`;

  const marker = document.createElement("span");
  marker.className = "marker";
  marker.textContent = typeLabel;

  const h2 = document.createElement("h2");
  h2.textContent = title.toUpperCase(); // matches your sample “HELLO WORLD” vibe

  const pText = document.createElement("p");
  pText.textContent = text;

  const pLink = document.createElement("p");
  const a = document.createElement("a");
  a.href = "moreDetails.html";
  a.textContent = "Read more...";
  pLink.appendChild(a);

  article.appendChild(marker);
  article.appendChild(h2);
  article.appendChild(pText);
  article.appendChild(pLink);

  // Add to the list (append to bottom like the sample)
  list.appendChild(article);

  // Clear form inputs
  if (titleEl) titleEl.value = "";
  if (textEl) textEl.value = "";
  const opR = document.getElementById("opinionRadio");
  const reR = document.getElementById("recipeRadio");
  const liR = document.getElementById("lifeRadio");
  if (opR) opR.checked = false;
  if (reR) reR.checked = false;
  if (liR) liR.checked = false;

  // Re-apply filtering so the new article obeys current checkbox settings
  filterArticles();
}
