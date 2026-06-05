const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzOPgePsKqJZ3hpeUTis-7Gcf0FN_ntsz48bq1erESgYqlFIiV_sPO3YpvlLILE6Fra/exec";

const contenedor = document.getElementById("partidos");
const nombreInput = document.getElementById("nombre");
const mensaje = document.getElementById("mensaje");
const barra = document.getElementById("barra");
const contador = document.getElementById("contador");

let grupoActual = "";

partidos.forEach(p => {
  if (p.grupo !== grupoActual) {
    grupoActual = p.grupo;
    contenedor.innerHTML += `<div class="grupo">${grupoActual}</div>`;
  }

  contenedor.innerHTML += `
    <div class="partido">
      <h4>${p.id}. ${p.equipo1} vs ${p.equipo2}</h4>

      <div class="opciones">
        <label>
          <input type="radio" name="pronostico_${p.id}" value="${p.equipo1}">
          ${p.equipo1}
        </label>

        <label>
          <input type="radio" name="pronostico_${p.id}" value="Empate">
          Empate
        </label>

        <label>
          <input type="radio" name="pronostico_${p.id}" value="${p.equipo2}">
          ${p.equipo2}
        </label>
      </div>
    </div>
  `;
});

function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = tipo;
  mensaje.style.display = "block";
}

function obtenerDatos() {
  const participante = nombreInput.value.trim();

  const pronosticos = partidos.map(p => {
    const seleccionado = document.querySelector(
      `input[name="pronostico_${p.id}"]:checked`
    );

    return {
      grupo: p.grupo,
      id: p.id,
      partido: `${p.equipo1} vs ${p.equipo2}`,
      equipo1: p.equipo1,
      equipo2: p.equipo2,
      pronostico: seleccionado ? seleccionado.value : ""
    };
  });

  return {
    participante,
    pronosticos
  };
}

function actualizarProgreso() {
  const datos = obtenerDatos();
  const completos = datos.pronosticos.filter(x => x.pronostico !== "").length;
  const porcentaje = (completos / partidos.length) * 100;

  barra.style.width = porcentaje + "%";
  contador.textContent = `${completos} / ${partidos.length} partidos completados`;
}

function guardarBorrador() {
  const datos = obtenerDatos();
  localStorage.setItem("polla_mundialista_dNFTSD", JSON.stringify(datos));
  actualizarProgreso();
}

function cargarBorrador() {
  const guardado = localStorage.getItem("polla_mundialista_dNFTSD");

  if (!guardado) return;

  const datos = JSON.parse(guardado);

  nombreInput.value = datos.participante || "";

  datos.pronosticos.forEach(x => {
    if (x.pronostico) {
      const radios = document.getElementsByName(`pronostico_${x.id}`);

      radios.forEach(radio => {
        if (radio.value === x.pronostico) {
          radio.checked = true;
        }
      });
    }
  });

  actualizarProgreso();
}

function validar() {
  const datos = obtenerDatos();

  if (!datos.participante) {
    mostrarMensaje("Debe ingresar el nombre del participante.", "error");
    return false;
  }

  const faltantes = datos.pronosticos.filter(x => x.pronostico === "");

  if (faltantes.length > 0) {
    mostrarMensaje(`Faltan ${faltantes.length} partidos por completar.`, "error");
    return false;
  }

  return true;
}

document.addEventListener("change", () => {
  guardarBorrador();
});

nombreInput.addEventListener("input", () => {
  guardarBorrador();
});

document.getElementById("btnBorrador").addEventListener("click", () => {
  guardarBorrador();
  mostrarMensaje("Borrador guardado correctamente en este navegador.", "ok");
});

document.getElementById("btnLimpiar").addEventListener("click", () => {
  localStorage.removeItem("polla_mundialista_dNFTSD");
  location.reload();
});

document.getElementById("btnEnviar").addEventListener("click", () => {
  if (!validar()) return;

  guardarBorrador();

  const datos = obtenerDatos();

  document.getElementById("payload").value = JSON.stringify(datos);

  const formulario = document.getElementById("formulario");
  formulario.action = SCRIPT_URL;

  mostrarMensaje("Enviando pronóstico, por favor espere...", "ok");

  formulario.submit();
});

window.addEventListener("message", function(event) {
  if (event.data.status === "ok") {
    mostrarMensaje("Pronóstico enviado correctamente.", "ok");
    localStorage.removeItem("polla_mundialista_dNFTSD");
  }

  if (event.data.status === "error") {
    mostrarMensaje("Error al guardar: " + event.data.message, "error");
  }
});

cargarBorrador();
actualizarProgreso();