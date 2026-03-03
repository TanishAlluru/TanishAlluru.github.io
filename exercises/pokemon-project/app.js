// ======== CONFIG ========
const API_BASE = "https://pokeapi.co/api/v2/pokemon/";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h cache to reduce API calls
const TEAM_MAX = 6;

// ======== DOM ========
const searchForm = document.getElementById("searchForm");
const queryInput = document.getElementById("query");
const statusEl = document.getElementById("status");

const imgEl = document.getElementById("pokeImg");
const audioEl = document.getElementById("pokeAudio");
const audioNoteEl = document.getElementById("audioNote");

const selects = [
  document.getElementById("move1"),
  document.getElementById("move2"),
  document.getElementById("move3"),
  document.getElementById("move4"),
];

const addBtn = document.getElementById("addBtn");

const teamEmpty = document.getElementById("teamEmpty");
const teamTable = document.getElementById("teamTable");
const teamBody = document.getElementById("teamBody");

// ======== STATE ========
let currentPokemon = null; // { id, name, sprite, cryUrl, moves[] }
let team = loadTeam();

// ======== CACHE HELPERS ========
function cacheKey(query) {
  return `poke_cache_${String(query).toLowerCase().trim()}`;
}

function getCachedPokemon(query) {
  try {
    const raw = localStorage.getItem(cacheKey(query));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.timestamp || !parsed.data) return null;

    const age = Date.now() - parsed.timestamp;
    if (age > CACHE_TTL_MS) return null;

    return parsed.data;
  } catch {
    return null;
  }
}

function setCachedPokemon(query, data) {
  try {
    localStorage.setItem(
      cacheKey(query),
      JSON.stringify({ timestamp: Date.now(), data })
    );
  } catch {
    // ignore cache failures (storage full/private mode)
  }
}

// ======== TEAM STORAGE ========
function loadTeam() {
  try {
    return JSON.parse(localStorage.getItem("poke_team")) || [];
  } catch {
    return [];
  }
}

function saveTeam() {
  localStorage.setItem("poke_team", JSON.stringify(team));
}

// ======== UI HELPERS ========
function setStatus(msg) {
  statusEl.textContent = msg || "";
}

function resetViewer() {
  currentPokemon = null;

  imgEl.style.display = "none";
  imgEl.src = "";
  imgEl.alt = "";

  audioEl.style.display = "none";
  audioEl.src = "";
  audioEl.load();

  audioNoteEl.textContent = "";

  for (const sel of selects) {
    sel.innerHTML = "";
    sel.disabled = true;
  }

  addBtn.disabled = true;
}

function setSelectOptions(selectEl, moveNames) {
  // Add a "placeholder" option at the top
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "— choose a move —";
  selectEl.appendChild(placeholder);

  for (const name of moveNames) {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    selectEl.appendChild(opt);
  }

  selectEl.disabled = false;
  selectEl.value = "";
}

function renderTeam() {
  teamBody.innerHTML = "";

  if (!team.length) {
    teamEmpty.hidden = false;
    teamTable.hidden = true;
    return;
  }

  teamEmpty.hidden = true;
  teamTable.hidden = false;

  for (const entry of team) {
    const tr = document.createElement("tr");

    const tdPoke = document.createElement("td");
    tdPoke.className = "pokeCell";

    const icon = document.createElement("img");
    icon.src = entry.sprite || "";
    icon.alt = entry.name;

    const name = document.createElement("div");
    name.innerHTML = `<strong>${entry.name}</strong><div class="note">#${entry.id}</div>`;

    tdPoke.appendChild(icon);
    tdPoke.appendChild(name);

    const tdMoves = document.createElement("td");
    const ul = document.createElement("ul");
    ul.className = "movesList";
    for (const m of entry.selectedMoves) {
      const li = document.createElement("li");
      li.textContent = m;
      ul.appendChild(li);
    }
    tdMoves.appendChild(ul);

    tr.appendChild(tdPoke);
    tr.appendChild(tdMoves);
    teamBody.appendChild(tr);
  }
}

// ======== DATA PARSING ========
function normalizePokemonData(data) {
  const sprite =
    data?.sprites?.front_default ||
    data?.sprites?.other?.["official-artwork"]?.front_default ||
    "";

  // PokeAPI includes cries in modern schema as `cries.latest` / `cries.legacy`
  const cryUrl = data?.cries?.latest || data?.cries?.legacy || "";

  const moves = Array.isArray(data?.moves)
    ? data.moves
        .map((m) => m?.move?.name)
        .filter(Boolean)
    : [];

  return {
    id: data.id,
    name: data.name,
    sprite,
    cryUrl,
    moves,
  };
}

// ======== FETCH ========
async function fetchPokemon(query) {
  const q = String(query).toLowerCase().trim();
  if (!q) throw new Error("Please enter a Pokémon name or ID.");

  // 1) Try cache first
  const cached = getCachedPokemon(q);
  if (cached) return cached;

  // 2) Otherwise fetch
  const res = await fetch(API_BASE + encodeURIComponent(q));
  if (!res.ok) {
    throw new Error("Pokémon not found. Try a name (e.g. pikachu) or 1–151.");
  }
  const json = await res.json();

  // Cache the raw API response to minimize future calls
  setCachedPokemon(q, json);

  return json;
}

// ======== EVENTS ========
searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  resetViewer();
  setStatus("Loading…");

  try {
    const raw = await fetchPokemon(queryInput.value);
    const p = normalizePokemonData(raw);

    currentPokemon = p;

    // Image
    if (p.sprite) {
      imgEl.src = p.sprite;
      imgEl.alt = p.name;
      imgEl.style.display = "block";
    } else {
      imgEl.style.display = "none";
    }

    // Audio
    if (p.cryUrl) {
      audioEl.src = p.cryUrl;
      audioEl.style.display = "block";
      audioNoteEl.textContent = "";
    } else {
      audioEl.style.display = "none";
      audioNoteEl.textContent = "No cry audio available for this Pokémon.";
    }

    // Moves → dropdowns
    const moveNames = p.moves.length ? p.moves : ["(no moves found)"];
    for (const sel of selects) setSelectOptions(sel, moveNames);

    addBtn.disabled = team.length >= TEAM_MAX;

    setStatus(`Loaded: ${p.name} (#${p.id})`);
  } catch (err) {
    setStatus(err.message || "Something went wrong.");
  }
});

addBtn.addEventListener("click", () => {
  if (!currentPokemon) return;

  if (team.length >= TEAM_MAX) {
    setStatus(`Team is full (max ${TEAM_MAX}).`);
    return;
  }

  const selectedMoves = selects.map((s) => s.value).filter(Boolean);

  // If user leaves some blank, fill with "—" or just keep fewer; I’ll keep fewer.
  if (!selectedMoves.length) {
    setStatus("Pick at least one move before adding to team.");
    return;
  }

  team.push({
    id: currentPokemon.id,
    name: currentPokemon.name,
    sprite: currentPokemon.sprite,
    selectedMoves,
  });

  saveTeam();
  renderTeam();

  addBtn.disabled = team.length >= TEAM_MAX;
  setStatus(`Added ${currentPokemon.name} to your team.`);
});

// ======== INIT ========
resetViewer();
renderTeam();
setStatus("Ready.");