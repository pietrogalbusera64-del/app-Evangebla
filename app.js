const navButtons = document.querySelectorAll('[data-section]');
const sections = document.querySelectorAll('.section');

function showSection(id) {
  sections.forEach(sec => sec.classList.toggle('active', sec.id === id));
  navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.section === id));
  switch(id) {
    case 'historial': renderContacts(); break;
    case 'seguimiento': initSeguimiento(); break;
    case 'reportes': renderChart(); break;
    case 'grupos': initGrupos(); break;
    case 'chat': initChat(); break;
    case 'calendario': initEventos(); break;
  }
}

navButtons.forEach(btn => btn.addEventListener('click', () => showSection(btn.dataset.section)));
window.addEventListener('DOMContentLoaded', () => showSection('splash'));

// Inicializar Storage
['contacts','interactions','groups','chat','events'].forEach(key => {
  if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify([]));
});

// Funciones - Contactos
document.getElementById('form-contacto')?.addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;
  const contacts = JSON.parse(localStorage.getItem('contacts'));
  const newContact = {
    id: Date.now(),
    nombre: form.nombre.value,
    edad: form.edad.value,
    telefono: form.telefono.value,
    genero: form.genero.value,
    ubicacion: form.ubicacion.value,
    aceptoCristo: form.aceptoCristo.checked,
    bautizado: form.bautizado.checked,
    discipulado: form.discipulado.checked
  };
  contacts.push(newContact);
  localStorage.setItem('contacts', JSON.stringify(contacts));
  form.reset();
  alert('Contacto guardado');
});

function renderContacts() {
  const contacts = JSON.parse(localStorage.getItem('contacts'));
  const filtro = document.getElementById('filtro-estado').value;
  const tbody = document.getElementById('lista-contactos');
  tbody.innerHTML = '';
  contacts.filter(c => filtro === 'all' || c[filtro])
    .forEach(c => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${c.nombre}</td>
        <td>${c.edad}</td>
        <td>${c.telefono}</td>
        <td>${c.genero}</td>
        <td>${c.ubicacion}</td>
        <td><button class="btn" onclick="deleteContact(${c.id})">Eliminar</button></td>
      `;
      tbody.appendChild(row);
    });
  // Actualizar selects
  populateSelect('contacto-seg', contacts, 'nombre');
  populateSelect('miembros-grupo', contacts, 'nombre');
}

function deleteContact(id) {
  const contacts = JSON.parse(localStorage.getItem('contacts')).filter(c => c.id !== id);
  localStorage.setItem('contacts', JSON.stringify(contacts));
  renderContacts();
}

// Funciones - Seguimiento
function initSeguimiento() {
  renderInteractions();
  populateSelect('contacto-seg', JSON.parse(localStorage.getItem('contacts')), 'nombre');
}

document.getElementById('form-seguimiento')?.addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;
  const interactions = JSON.parse(localStorage.getItem('interactions'));
  const temas = Array.from(document.querySelectorAll('.check-tema:checked')).map(el => el.value);
  interactions.push({
    id: Date.now(),
    contacto: form['contacto-seg'].value,
    fecha: form['fecha-seg'].value,
    tipo: form['tipo-seg'].value,
    temas
  });
  localStorage.setItem('interactions', JSON.stringify(interactions));
  form.reset();
  renderInteractions();
});

function renderInteractions() {
  const interactions = JSON.parse(localStorage.getItem('interactions'));
  const list = document.getElementById('lista-seguimiento');
  list.innerHTML = '';
  interactions.forEach(i => {
    const item = document.createElement('li');
    item.textContent = `${i.fecha} - ${i.contacto} (${i.tipo}): ${i.temas.join(', ')}`;
    list.appendChild(item);
  });
}

// Funciones - Reportes
function renderChart() {
  const contacts = JSON.parse(localStorage.getItem('contacts'));
  const interactions = JSON.parse(localStorage.getItem('interactions'));
  const ctx = document.getElementById('chart-estadisticas').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Registrados', 'Decisiones', 'Bautismos', 'Discipulados', 'Interacciones'],
      datasets: [{
        label: 'Cantidad',
        data: [
          contacts.length,
          contacts.filter(c => c.aceptoCristo).length,
          contacts.filter(c => c.bautizado).length,
          contacts.filter(c => c.discipulado).length,
          interactions.length
        ],
        backgroundColor: ['#18ABDA','#F39C12','#27AE60','#8E44AD','#E74C3C'],
        borderColor: ['#157E91','#D68910','#1E8449','#71368A','#C0392B'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, grid: { color: '#ecf0f1' } },
        x: { grid: { display: false } }
      }
    }
  });
}

// Funciones - Grupos
document.getElementById('form-grupo')?.addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;
  const groups = JSON.parse(localStorage.getItem('groups'));
  const members = Array.from(document.getElementById('miembros-grupo').selectedOptions).map(o => o.value);
  groups.push({ id: Date.now(), nombre: form['nombre-grupo'].value, miembros: members });
  localStorage.setItem('groups', JSON.stringify(groups));
  renderGroups();
});

function initGrupos() {
  renderGroups();
}

function renderGroups() {
  const groups = JSON.parse(localStorage.getItem('groups'));
  const list = document.getElementById('lista-grupos');
  list.innerHTML = '';
  groups.forEach(g => {
    const item = document.createElement('li');
    item.innerHTML = `<strong>${g.nombre}:</strong> ${g.miembros.length} miembros`;
    list.appendChild(item);
  });
}

// Funciones - Chat
document.getElementById('form-chat')?.addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;
  const chat = JSON.parse(localStorage.getItem('chat'));
  chat.push({
    id: Date.now(),
    usuario: form['usuario-chat'].value,
    mensaje: form['mensaje-chat'].value,
    privado: form['privado-chat'].checked
  });
  localStorage.setItem('chat', JSON.stringify(chat));
  form.reset();
  renderChat();
});

function initChat() {
  renderChat();
}

function renderChat() {
  const chat = JSON.parse(localStorage.getItem('chat'));
  const list = document.getElementById('lista-chat');
  list.innerHTML = '';
  chat.forEach(m => {
    const item = document.createElement('li');
    item.innerHTML = `${m.privado ? '🔒 ' : ''}<strong>${m.usuario}:</strong> ${m.mensaje}`;
    list.appendChild(item);
  });
}

// Funciones - Eventos
document.getElementById('form-evento')?.addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;
  const events = JSON.parse(localStorage.getItem('events'));
  events.push({
    id: Date.now(),
    nombre: form['nombre-evento'].value,
    tipo: form['tipo-evento'].value,
    fecha: form['fecha-evento'].value,
    detalles: form['detalles-evento'].value
  });
  localStorage.setItem('events', JSON.stringify(events));
  renderEventos();
});

function initEventos() {
  renderEventos();
}

function renderEventos() {
  const events = JSON.parse(localStorage.getItem('events'));
  const list = document.getElementById('lista-eventos');
  list.innerHTML = '';
  events.forEach(ev => {
    const item = document.createElement('li');
    item.innerHTML = `<strong>${ev.fecha}</strong> [${ev.tipo}] ${ev.nombre}`;
    list.appendChild(item);
  });
}

// Utilidad: popular selects
function populateSelect(id, items, prop) {
  const sel = document.getElementById(id);
  if (!sel) return;
  sel.innerHTML = '<option value="">Selecciona</option>';
  items.forEach(i => {
    const opt = document.createElement('option');
    opt.value = i[prop]; opt.textContent = i[prop];
    sel.appendChild(opt);
  });
}

// Función para exportar contactos a Excel
function exportContacts() {
  const contacts = JSON.parse(localStorage.getItem('contacts'));
  if (contacts.length === 0) {
    alert('No hay contactos para exportar.');
    return;
  }
  const ws_data = [
    ['Nombre','Edad','Teléfono','Género','Ubicación','Aceptó Cristo','Bautizado','Discipulado']
  ];
  contacts.forEach(c => ws_data.push([
    c.nombre,c.edad,c.telefono,c.genero,c.ubicacion,c.aceptoCristo?'Sí':'No',c.bautizado?'Sí':'No',c.discipulado?'Sí':'No'
  ]));
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Contactos');
  XLSX.writeFile(wb, 'contactos_evangelismo.xlsx');
}

document.getElementById('export-contactos')?.addEventListener('click', exportContacts);

// Función para exportar interacciones a Excel
function exportInteractions() {
  const interactions = JSON.parse(localStorage.getItem('interactions'));
  if (interactions.length === 0) { alert('No hay interacciones para exportar.'); return; }
  const ws_data = [['Contacto','Fecha','Tipo','Temas']];
  interactions.forEach(i => ws_data.push([i.contacto,i.fecha,i.tipo,i.temas.join(', ')]));
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Interacciones');
  XLSX.writeFile(wb, 'interacciones_evangelismo.xlsx');
}

document.getElementById('export-interacciones')?.addEventListener('click', exportInteractions);

// Función para exportar grupos a Excel
function exportGroups() {
  const groups = JSON.parse(localStorage.getItem('groups'));
  if (groups.length === 0) { alert('No hay grupos para exportar.'); return; }
  const ws_data = [['Nombre Grupo','Miembros']];
  groups.forEach(g => ws_data.push([g.nombre, g.miembros.join(', ')]));
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Grupos');
  XLSX.writeFile(wb, 'grupos_evangelismo.xlsx');
}

document.getElementById('export-grupos')?.addEventListener('click', exportGroups);

// Función para exportar eventos a Excel
function exportEvents() {
  const events = JSON.parse(localStorage.getItem('events'));
  if (events.length === 0) { alert('No hay eventos para exportar.'); return; }
  const ws_data = [['Nombre Evento','Tipo','Fecha','Detalles']];
  events.forEach(ev => ws_data.push([ev.nombre, ev.tipo, ev.fecha, ev.detalles]));
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Eventos');
  XLSX.writeFile(wb, 'eventos_evangelismo.xlsx');
}

document.getElementById('export-eventos')?.addEventListener('click', exportEvents);
// Función para exportar reporte en PDF
document.getElementById('export-pdf')?.addEventListener('click', () => {
  const canvas = document.getElementById('chart-estadisticas');
  const imgData = canvas.toDataURL('image/png', 1.0);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  // Ajustar imagen al PDF
  doc.addImage(imgData, 'PNG', 10, 10, pageWidth - 20, pageHeight - 20);
  doc.save('reporte_estadisticas.pdf');
});


