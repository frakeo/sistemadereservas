import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SALAS = {
  "COWORKING":"Coworking",
  "AUDITÓRIO MEZANINO":"Auditório Mezanino",
  "AUDITÓRIO 8° ANDAR":"Auditório 8° Andar",
  "SALA 360°":"Sala 360°",
  "SALA DE REUNIÃO 9° ANDAR":"Sala de Reunião 9° Andar"
};
function formatarData(data){ if(!data) return "—"; const [ano,mes,dia] = data.split("-"); return `${dia}/${mes}/${ano}`; }
function eventoJaTerminou(evento){ if(!evento.data || !evento.hora_fim) return false; return new Date() > new Date(`${evento.data}T${evento.hora_fim}:00`); }
function eventoHoje(data){ const hoje = new Date(); const ev = new Date(`${data}T00:00:00`); return hoje.toDateString() === ev.toDateString(); }
async function carregarEventosPainel(){
  try{
    const q = query(collection(db,"eventos"), orderBy("data","asc"), orderBy("hora_inicio","asc"));
    const snapshot = await getDocs(q);
    const eventos = snapshot.docs.map(documento=>({id:documento.id,...documento.data()}));
    const validos = eventos.filter(e=>e.status !== "CANCELADO" && !eventoJaTerminou(e));
    montarPainel(validos);
  }catch(err){ console.error(err); }
}
function montarPainel(eventos){
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  Object.entries(SALAS).forEach(([sala,label])=>{
    const proximos = eventos.filter(e=>e.sala === sala).sort((a,b)=>new Date(`${a.data}T${a.hora_inicio}:00`) - new Date(`${b.data}T${b.hora_inicio}:00`));
    const evento = proximos[0];
    const hoje = evento && eventoHoje(evento.data);
    const card = document.createElement("div");
    card.className = "room-card" + (hoje ? " hoje" : "");
    card.innerHTML = `
      <div class="room">${label}</div>
      <div class="badge ${hoje ? "active" : ""}">${hoje ? "Em uso hoje" : evento ? "Agendado" : "Disponível"}</div>
      <div class="event ${evento ? "" : "empty"}">${evento ? evento.evento.toUpperCase() : "À Agendar"}</div>
      <div class="meta"><div><span>Data</span>${evento ? formatarData(evento.data) : "—"}</div><div><span>Horário</span>${evento ? `${evento.hora_inicio} – ${evento.hora_fim}` : "—"}</div><div><span>Órgão</span>${evento ? evento.organizador || "SRA-ES" : "SRA-ES"}</div></div>`;
    grid.appendChild(card);
  });
}
function atualizarRelogio(){ const clock = document.getElementById("clock"); if(clock) clock.textContent = new Date().toLocaleTimeString("pt-BR",{hour12:false}); }
setInterval(carregarEventosPainel,30000);
setInterval(atualizarRelogio,1000);
carregarEventosPainel();
atualizarRelogio();