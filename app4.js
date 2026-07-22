window.onload = function() {
    // 1. Cargamos el estado inicial de cada tarjeta al abrir la app
    document.querySelectorAll('.card').forEach(card => {
        const id = card.getAttribute('data-id');
        if (localStorage.getItem(id + '_t')) card.querySelector('.temp-num').innerText = localStorage.getItem(id + '_t');
        if (localStorage.getItem(id + '_c')) card.querySelector('.cap-num').innerText = localStorage.getItem(id + '_c');
        
        const estadoGuardado = localStorage.getItem(id + '_e') || 'viendo'; // Por defecto es 'viendo'
        let btn = card.querySelector('.status-btn');
        
        if (btn) {
            btn.className = 'status-btn';
            if (estadoGuardado === 'espera') {
                btn.classList.add('status-espera');
                btn.innerText = 'En espera';
            } else if (estadoGuardado === 'terminado') {
                btn.classList.add('status-terminada');
                btn.innerText = 'Terminado';
            } else {
                btn.classList.add('status-viendo');
                btn.innerText = 'Viendo';
            }
        }
        actualizarImagenTemporada(id);
    });

    // Iniciamos mostrando la pestaña de "Viendo"
    filtrarCatalogo('viendo');
    chequearNuevosCapitulos();
}

// 2. Función para filtrar las tarjetas según la pestaña activa
function filtrarCatalogo(pestana) {
    // Iluminar la pestaña correcta arriba
    const botones = document.querySelectorAll('.tab-btn');
    botones.forEach(btn => btn.classList.remove('active'));
    botones.forEach(btn => {
        if(btn.textContent.trim().toLowerCase() === pestana.replace('-', ' ')) btn.classList.add('active');
    });

    const tarjetas = document.querySelectorAll('.card');

    // Mostramos u ocultamos las tarjetas según su estado
    tarjetas.forEach(tarjeta => {
        const botonEstado = tarjeta.querySelector('.status-btn');
        const esViendo = botonEstado && botonEstado.classList.contains('status-viendo');
        const esEspera = botonEstado && botonEstado.classList.contains('status-espera');
        const esTerminado = botonEstado && botonEstado.classList.contains('status-terminada');

        if (pestana === 'viendo') {
            tarjeta.style.display = esViendo ? 'flex' : 'none';
        } else if (pestana === 'espera') {
            tarjeta.style.display = esEspera ? 'flex' : 'none';
        } else if (pestana === 'mis-series') {
            // "Mis Series" ahora muestra de forma automática las que estén en estado "Terminado"
            tarjeta.style.display = esTerminado ? 'flex' : 'none';
        } else {
            tarjeta.style.display = 'none';
        }
    });
}

// 3. El botón con la rotación circular de 3 clicks y desaparición inmediata
function toggleEstado(id) {
    let card = document.querySelector(`[data-id="${id}"]`);
    if (!card) return;
    
    let btn = card.querySelector('.status-btn');
    if (!btn) return;

    // Rotación: Viendo -> En espera -> Terminado -> Viendo
    if (btn.classList.contains('status-viendo')) {
        btn.className = 'status-btn status-espera';
        btn.innerText = 'En espera';
        localStorage.setItem(id + '_e', 'espera');
    } else if (btn.classList.contains('status-espera')) {
        btn.className = 'status-btn status-terminada';
        btn.innerText = 'Terminado';
        localStorage.setItem(id + '_e', 'terminado');
    } else {
        btn.className = 'status-btn status-viendo';
        btn.innerText = 'Viendo';
        localStorage.setItem(id + '_e', 'viendo');
    }

    // Al hacer click, la tarjeta desaparece de inmediato de la pestaña actual
    const pestanaActiva = document.querySelector('.tab-btn.active')?.textContent.trim().toLowerCase().replace(' ', '-') || 'viendo';
    filtrarCatalogo(pestanaActiva);
}

// 4. Funciones de soporte originales intactas (imágenes, temporadas, capítulos)
function actualizarImagenTemporada(idSerie) {
    const tarjeta = document.querySelector(`.card[data-id="${idSerie}"]`);
    if (!tarjeta) return;
    const tempNumText = tarjeta.querySelector('.temp-num').innerText;
    const imagen = tarjeta.querySelector('.card-img');
    if (imagen) {
        const nuevoSrc = imagen.getAttribute(`data-t${tempNumText}`);
        if (nuevoSrc) imagen.src = nuevoSrc;
    }
}

function chequearNuevosCapitulos() {
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    document.querySelectorAll('.card').forEach(card => {
        const calendarioStr = card.getAttribute('data-calendario');
        if (!calendarioStr) return;
        const fechas = calendarioStr.split(',');
        const capActualSiguiente = parseInt(card.querySelector('.cap-num').innerText);
        let ultimoCapEstrenado = 0;

        fechas.forEach((fechaStr, index) => {
            const numeroCapitulo = index + 1; 
            if (!fechaStr.trim()) return;
            const partes = fechaStr.trim().split('-');
            const fechaEstreno = new Date(partes[0], partes[1] - 1, partes[2]);
            fechaEstreno.setHours(0, 0, 0, 0);
            if (hoy >= fechaEstreno) ultimoCapEstrenado = numeroCapitulo;
        });

        const badge = card.querySelector('.badge-new');
        if (badge) {
            if (ultimoCapEstrenado > 0 && capActualSiguiente < ultimoCapEstrenado) {
                badge.innerText = `¡NEW! Cap. ${ultimoCapEstrenado}`;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        }
    });
}

function sumarTemporada(id) { 
    let card = document.querySelector(`[data-id="${id}"]`);
    let spanTemp = card.querySelector('.temp-num');
    let nuevaTemp = parseInt(spanTemp.innerText) + 1;
    spanTemp.innerText = nuevaTemp;
    localStorage.setItem(id + '_t', nuevaTemp);
    let spanCap = card.querySelector('.cap-num');
    spanCap.innerText = "1";
    localStorage.setItem(id + '_c', "1");
    actualizarImagenTemporada(id);
    chequearNuevosCapitulos();
}

function restarTemporada(id) {
    let card = document.querySelector(`[data-id="${id}"]`);
    let spanTemp = card.querySelector('.temp-num');
    let tempActual = parseInt(spanTemp.innerText);
    if (tempActual > 1) { 
        tempActual--; spanTemp.innerText = tempActual;
        localStorage.setItem(id + '_t', tempActual);
        let spanCap = card.querySelector('.cap-num');
        spanCap.innerText = "1";
        localStorage.setItem(id + '_c', "1");
        actualizarImagenTemporada(id);
        chequearNuevosCapitulos();
    }
}

function sumarCapituloNormal(id) { 
    let card = document.querySelector(`[data-id="${id}"]`);
    let span = card.querySelector('.cap-num');
    let nuevoCap = (parseInt(span.innerText) || 0) + 1;
    span.innerText = nuevoCap;
    localStorage.setItem(id + '_c', nuevoCap);
    chequearNuevosCapitulos();
}

function restarCapitulo(id) {
    const card = document.querySelector(`.card[data-id="${id}"]`);
    if (!card) return;
    const capSpan = card.querySelector('.cap-num');
    if (!capSpan) return;
    let capActual = parseInt(capSpan.innerText) || 0;
    if (capActual <= 1) return;
    capActual--;
    capSpan.innerText = capActual;
    localStorage.setItem(id + '_c', capActual);
}

function abrirVentana(url) {
    document.getElementById('iframe-imdb').src = url;
    document.getElementById('modal-flotante').style.display = 'block';
}

function cerrarVentana() {
    document.getElementById('modal-flotante').style.display = 'none';
    document.getElementById('iframe-imdb').src = '';
}
function verDatosLucky() {
    alert(
        "Temp: " + localStorage.getItem("lucky_t") +
        "\nCap: " + localStorage.getItem("lucky_c") +
        "\nEstado: " + localStorage.getItem("lucky_e")
    );
}