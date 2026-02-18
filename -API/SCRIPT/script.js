const baseURL = "https://rickandmortyapi.com/api/character";
const contenedor = document.getElementById("resultados");
const mensaje = document.getElementById("mensaje");

async function buscar() {
  const term = document.getElementById("busqueda").value.trim();
  contenedor.innerHTML = mensaje.textContent = "";
  try {
    let results = [];
    let url = `${baseURL}/?name=${term}`;

    while (url) {
      const { results: page, info } = await (await fetch(url)).json();
      results = results.concat(page);
      url = info.next;
    }

    if (!results.length) return mensaje.textContent = "No se encontraron resultados";

    contenedor.innerHTML = results
      .map(p => `
        <div class="card">
          <img src="${p.image}" alt="${p.name}">
          <h3>${p.name}</h3>
          <p>Estado: ${p.status}</p>
        </div>
      `)
      .join("");

  } catch (e) {
    console.error(e);
    mensaje.textContent = "Error al buscar";
  }
}