const baseURL = "https://rickandmortyapi.com/api/character";
const contenedor = document.getElementById("resultados");
const mensaje = document.getElementById("mensaje");
const loader = document.getElementById("loader");
const boton = document.getElementById("btnBuscar");
const input = document.getElementById("busqueda");

boton.addEventListener("click", buscar);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") buscar();
});

async function buscar() {
  const term = input.value.trim();

  contenedor.innerHTML = "";
  mensaje.textContent = "";

  if (!term) {
    mensaje.textContent = "Escribe un personaje para buscar";
    return;
  }

  loader.classList.remove("hidden");

  try {
    let results = [];
    let url = `${baseURL}/?name=${term}`;

    while (url) {
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("No se encontraron resultados");
        }
        throw new Error("Error en la petición");
      }

      const data = await response.json();
      results = results.concat(data.results);
      url = data.info.next;
    }

    if (!results.length) {
      mensaje.textContent = "No se encontraron resultados";
      return;
    }

    contenedor.innerHTML = results
      .map(p => `
        <div class="card">
          <img src="${p.image}" alt="${p.name}">
          <h3>${p.name}</h3>
          <p>Estado: ${p.status}</p>
        </div>
      `)
      .join("");

  } catch (error) {
    mensaje.textContent = error.message;
  } finally {
    loader.classList.add("hidden");
  }
}
