const API_URL = "https://rickandmortyapi.com/api/character";
const form = document.querySelector("#searchForm");
const input = document.querySelector("#busqueda");
const estado = document.querySelector("#estado");
const genero = document.querySelector("#genero");
const limpiar = document.querySelector("#limpiar");
const resultados = document.querySelector("#resultados");
const mensaje = document.querySelector("#mensaje");
const loader = document.querySelector("#loader");
const contador = document.querySelector("#contador");
const tituloResultados = document.querySelector("#tituloResultados");
const paginacion = document.querySelector("#paginacion");
const anterior = document.querySelector("#anterior");
const siguiente = document.querySelector("#siguiente");
const paginaActual = document.querySelector("#paginaActual");

let pagina = 1;
let totalPaginas = 1;
let solicitudActual = 0;

form.addEventListener("submit", (event) => {
  event.preventDefault();
  pagina = 1;
  buscarPersonajes();
});
estado.addEventListener("change", reiniciarBusqueda);
genero.addEventListener("change", reiniciarBusqueda);
limpiar.addEventListener("click", () => {
  input.value = "";
  estado.value = "";
  genero.value = "";
  pagina = 1;
  buscarPersonajes();
});
anterior.addEventListener("click", () => {
  if (pagina > 1) { pagina--; buscarPersonajes(); }
});
siguiente.addEventListener("click", () => {
  if (pagina < totalPaginas) { pagina++; buscarPersonajes(); }
});

function reiniciarBusqueda() {
  pagina = 1;
  buscarPersonajes();
}

async function buscarPersonajes() {
  const idSolicitud = ++solicitudActual;
  const params = new URLSearchParams({ page: String(pagina) });
  const nombre = input.value.trim();
  if (nombre) params.set("name", nombre);
  if (estado.value) params.set("status", estado.value);
  if (genero.value) params.set("gender", genero.value);

  mostrarCarga(true);
  ocultarMensaje();
  resultados.replaceChildren();
  paginacion.classList.add("hidden");
  tituloResultados.textContent = nombre ? `Resultados para “${nombre}”` : "Personajes del multiverso";
  contador.textContent = "Buscando…";

  try {
    const respuesta = await fetch(`${API_URL}/?${params.toString()}`);
    const datos = await respuesta.json();
    if (idSolicitud !== solicitudActual) return;
    if (!respuesta.ok) {
      if (respuesta.status === 404) throw new Error("No encontramos personajes con esos criterios. Prueba otro nombre o cambia los filtros.");
      throw new Error("La API no pudo completar la búsqueda. Inténtalo de nuevo en unos segundos.");
    }

    totalPaginas = datos.info.pages;
    contador.textContent = `${datos.info.count} ${datos.info.count === 1 ? "personaje" : "personajes"}`;
    resultados.innerHTML = datos.results.map(crearTarjeta).join("");
    paginacion.classList.toggle("hidden", totalPaginas <= 1);
    anterior.disabled = pagina <= 1;
    siguiente.disabled = pagina >= totalPaginas;
    paginaActual.textContent = `Página ${pagina} de ${totalPaginas}`;
  } catch (error) {
    if (idSolicitud !== solicitudActual) return;
    mostrarMensaje(error.message || "No fue posible conectar con la API. Comprueba tu conexión e inténtalo otra vez.", true);
    contador.textContent = "Sin resultados";
  } finally {
    if (idSolicitud === solicitudActual) mostrarCarga(false);
  }
}

function crearTarjeta(personaje) {
  const estadoTexto = { Alive: "Vivo", Dead: "Muerto", unknown: "Desconocido" }[personaje.status] || personaje.status;
  const estadoClase = personaje.status.toLowerCase() === "alive" ? "alive" : personaje.status.toLowerCase() === "dead" ? "dead" : "";
  const especie = personaje.type ? `${personaje.species} · ${personaje.type}` : personaje.species;
  return `<article class="character-card">
    <div class="image-wrap">
      <img src="${escapar(personaje.image)}" alt="Retrato de ${escapar(personaje.name)}" loading="lazy" decoding="async">
      <span class="status-tag ${estadoClase}">${escapar(estadoTexto)}</span>
    </div>
    <div class="card-body">
      <h3>${escapar(personaje.name)}</h3>
      <div class="card-details">
        <div class="detail"><span>Especie</span><strong>${escapar(especie)}</strong></div>
        <div class="detail"><span>Género</span><strong>${escapar(traducirGenero(personaje.gender))}</strong></div>
        <div class="detail"><span>Origen</span><strong>${escapar(personaje.origin?.name || "Desconocido")}</strong></div>
        <div class="detail"><span>Ubicación</span><strong>${escapar(personaje.location?.name || "Desconocida")}</strong></div>
      </div>
    </div>
  </article>`;
}

function traducirGenero(valor) {
  return ({ Female: "Femenino", Male: "Masculino", Genderless: "Sin género", unknown: "Desconocido" })[valor] || valor;
}

function escapar(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, (caracter) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[caracter]);
}

function mostrarCarga(activa) {
  loader.classList.toggle("hidden", !activa);
}
function mostrarMensaje(texto, esError = false) {
  mensaje.textContent = texto;
  mensaje.classList.remove("hidden");
  mensaje.classList.toggle("error", esError);
}
function ocultarMensaje() {
  mensaje.textContent = "";
  mensaje.classList.add("hidden");
  mensaje.classList.remove("error");
}

buscarPersonajes();
