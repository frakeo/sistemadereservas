import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let eventos = [];
let idEditando = null;
let filtroSalaRegistros = "";
let mesRegistros = new Date().getMonth();
let anoRegistros = new Date().getFullYear();

const STATUS_AGENDADO = "AGENDADO";
const STATUS_CANCELADO = "CANCELADO";
const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const MESES_CURTOS = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
const DIAS_SEMANA = ["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];

const form = document.getElementById("formEvento");
const listaRegistros = document.getElementById("listaRegistrosSalvos");
const mensagemConflito = document.getElementById("mensagemConflito");

function agoraISO(){ return new Date().toISOString(); }
function obterSituacaoEvento(evento){
  if(evento.status === STATUS_CANCELADO) return "CANCELADO";
  if(!evento.data || !evento.hora_fim) return "AGENDADO";
  const fim = new Date(`${evento.data}T${evento.hora_fim}:00`);
  return new Date() > fim ? "CONCLUIDO" : "AGENDADO";
}
function textoStatus(status){ return status === "CANCELADO" ? "Cancelado" : status === "CONCLUIDO" ? "Concluído" : "Agendado"; }
function classeStatus(status){ return status === "CANCELADO" ? "cancelado" : status === "CONCLUIDO" ? "concluido" : "agendado"; }
function formatarDataExtensa(dataStr){
  const [y,m,d] = dataStr.split("-");
  const data = new Date(parseInt(y), parseInt(m)-1, parseInt(d));
  return { dia:String(parseInt(d)), mesCurto:MESES_CURTOS[parseInt(m)-1], semana:DIAS_SEMANA[data.getDay()], completa:`${parseInt(d)} de ${MONTHS[parseInt(m)-1]}` };
}
function pegarDadosFormulario(){
  return {
    sala: document.getElementById("sala").value.trim(),
    evento: document.getElementById("evento").value.trim(),
    organizador: document.getElementById("organizador").value.trim(),
    data: document.getElementById("data").value,
    hora_inicio: document.getElementById("hora_inicio").value,
    hora_fim: document.getElementById("hora_fim").value,
    publico: document.getElementById("publico").value.trim()
  };
}
function validarFormulario(dados){
  if(!dados.sala) return "Informe o local.";
  if(!dados.evento) return "Informe o nome do evento.";
  if(!dados.organizador) return "Informe o órgão responsável.";
  if(!dados.data) return "Informe a data.";
  if(!dados.hora_inicio) return "Informe o horário inicial.";
  if(!dados.hora_fim) return "Informe o horário final.";
  if(dados.hora_fim <= dados.hora_inicio) return "O horário final precisa ser maior que o inicial.";
  if(!dados.publico) return "Informe o número de pessoas.";
  return null;
}
function existeConflito(dados, ignorarId = null){
  return eventos.find((evento)=>{
    if(ignorarId && evento.id === ignorarId) return false;
    if(evento.status === STATUS_CANCELADO) return false;
    if(evento.sala !== dados.sala) return false;
    if(evento.data !== dados.data) return false;
    return ((dados.hora_inicio >= evento.hora_inicio && dados.hora_inicio < evento.hora_fim) || (dados.hora_fim > evento.hora_inicio && dados.hora_fim <= evento.hora_fim) || (dados.hora_inicio <= evento.hora_inicio && dados.hora_fim >= evento.hora_fim));
  });
}
async function carregarEventos(){
  try{
    const q = query(collection(db,"eventos"), orderBy("data","asc"), orderBy("hora_inicio","asc"));
    const snapshot = await getDocs(q);
    eventos = snapshot.docs.map((documento)=>({ id:documento.id, ...documento.data() }));
    renderizarRegistros();
    verificarConflito();
  }catch(err){
    console.error(err);
    listaRegistros.innerHTML = `<p class="empty-list">Erro ao carregar registros. Verifique o Firebase Config e as regras do Firestore.</p>`;
  }
}
function atualizarTituloMes(){ document.getElementById("tituloMesRegistros").textContent = `${MONTHS[mesRegistros]} ${anoRegistros}`; }
function renderizarRegistros(){
  atualizarTituloMes();
  const dataDe = document.getElementById("registroDataDe").value;
  const dataAte = document.getElementById("registroDataAte").value;
  const statusFiltro = document.getElementById("registroStatus").value;
  let lista = eventos.map(e=>({...e, situacaoCalculada:obterSituacaoEvento(e)})).filter((e)=>{
    if(!e.data) return false;
    const dataObj = new Date(`${e.data}T00:00:00`);
    return dataObj.getMonth() === mesRegistros && dataObj.getFullYear() === anoRegistros && (!filtroSalaRegistros || e.sala === filtroSalaRegistros) && (!dataDe || e.data >= dataDe) && (!dataAte || e.data <= dataAte) && (!statusFiltro || e.situacaoCalculada === statusFiltro);
  });
  lista.sort((a,b)=> new Date(`${a.data}T${a.hora_inicio}:00`) - new Date(`${b.data}T${b.hora_inicio}:00`));
  listaRegistros.innerHTML = "";
  if(!lista.length){ listaRegistros.innerHTML = `<p class="empty-list">Nenhum registro encontrado para os filtros selecionados.</p>`; return; }
  lista.forEach((evento)=>{
    const dataInfo = formatarDataExtensa(evento.data);
    const status = evento.situacaoCalculada;
    const card = document.createElement("div");
    card.className = "registro-card";
    card.onclick = ()=>mostrarDetalheRegistro(evento, card);
    card.innerHTML = `
      <div class="date-box"><strong>${dataInfo.dia}</strong><span>${dataInfo.mesCurto}</span></div>
      <div class="registro-info"><h3>${evento.evento || "Sem nome"}</h3><div class="registro-meta"><span class="pill">${evento.sala || "Local não informado"}</span><span>${evento.organizador || "SRA-ES"}</span><span>${evento.hora_inicio || "--:--"} – ${evento.hora_fim || "--:--"}</span><span>${evento.publico || "0"} pessoas</span></div></div>
      <div class="status ${classeStatus(status)}">${textoStatus(status)}</div>`;
    listaRegistros.appendChild(card);
  });
}
function mostrarDetalheRegistro(evento, cardEl){
  document.querySelectorAll(".registro-card").forEach(c=>c.classList.remove("active"));
  if(cardEl) cardEl.classList.add("active");
  const dataInfo = formatarDataExtensa(evento.data);
  const status = obterSituacaoEvento(evento);
  document.getElementById("detailDia").textContent = dataInfo.completa;
  document.getElementById("detailSemana").textContent = dataInfo.semana;
  document.getElementById("detailContent").innerHTML = `
    <div class="detail-card">
      <div class="label">Evento</div><div class="value">${evento.evento || "-"}</div>
      <div class="label">Local</div><div class="value">${evento.sala || "-"}</div>
      <div class="label">Órgão</div><div class="value">${evento.organizador || "SRA-ES"}</div>
      <div class="label">Horário</div><div class="value">${evento.hora_inicio || "--:--"} – ${evento.hora_fim || "--:--"}</div>
      <div class="label">Público</div><div class="value">${evento.publico || "0"} pessoas</div>
      <div class="label">Status</div><div class="value"><span class="status ${classeStatus(status)}">${textoStatus(status)}</span></div>
      <div class="detail-actions"><button type="button" class="btn-edit" data-edit="${evento.id}">Editar</button><button type="button" class="btn-cancel" data-cancel="${evento.id}">Cancelar</button></div>
    </div>`;
}
function verificarConflito(){
  const dados = pegarDadosFormulario();
  if(!dados.sala || !dados.data || !dados.hora_inicio || !dados.hora_fim){ mensagemConflito.textContent = ""; return false; }
  const erro = dados.hora_fim <= dados.hora_inicio ? "⚠ O horário final precisa ser maior que o inicial." : null;
  if(erro){ mensagemConflito.textContent = erro; return true; }
  const conflito = existeConflito(dados, idEditando);
  mensagemConflito.textContent = conflito ? "⚠ Conflito de horário neste local." : "";
  return !!conflito;
}
function limparFormulario(){
  form.reset(); idEditando = null;
  document.getElementById("btnSalvar").textContent = "Salvar Cadastro";
  document.getElementById("formTitle").textContent = "Novo Cadastro";
  mensagemConflito.textContent = "";
}
function editarEvento(id){
  const evento = eventos.find(item=>item.id === id);
  if(!evento){ alert("Registro não encontrado."); return; }
  idEditando = id;
  document.getElementById("sala").value = evento.sala || "";
  document.getElementById("evento").value = evento.evento || "";
  document.getElementById("organizador").value = evento.organizador || "";
  document.getElementById("data").value = evento.data || "";
  document.getElementById("hora_inicio").value = evento.hora_inicio || "";
  document.getElementById("hora_fim").value = evento.hora_fim || "";
  document.getElementById("publico").value = evento.publico || "";
  document.getElementById("btnSalvar").textContent = "Salvar Edição";
  document.getElementById("formTitle").textContent = "Editar Cadastro";
  window.scrollTo({top:0, behavior:"smooth"});
}
async function cancelarEvento(id){
  if(!confirm("Confirmar cancelamento deste registro?")) return;
  const ref = doc(db,"eventos",id);
  await updateDoc(ref,{ status:STATUS_CANCELADO, cancelado_em:agoraISO(), atualizado_em:agoraISO() });
  await carregarEventos();
  document.getElementById("detailDia").textContent = "Selecione um registro";
  document.getElementById("detailSemana").textContent = "Histórico";
  document.getElementById("detailContent").innerHTML = `<p class="detail-empty">Registro cancelado e mantido no histórico.</p>`;
}
async function exportarCSV(){
  if(!eventos.length) await carregarEventos();
  const linhas = [["id","evento","organizador","data","hora_inicio","hora_fim","publico","sala","status","criado_em","atualizado_em","cancelado_em"]];
  eventos.forEach(e=>linhas.push([e.id,e.evento||"",e.organizador||"",e.data||"",e.hora_inicio||"",e.hora_fim||"",e.publico||"",e.sala||"",e.status||"",e.criado_em||"",e.atualizado_em||"",e.cancelado_em||""]));
  const csv = linhas.map(l=>l.map(v=>`"${String(v).replaceAll('"','""')}"`).join(";")).join("\n");
  const blob = new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "eventos_sra.csv"; a.click();
  URL.revokeObjectURL(url);
}

document.querySelectorAll("#chipsRegistros .chip").forEach(chip=>chip.addEventListener("click",()=>{
  document.querySelectorAll("#chipsRegistros .chip").forEach(c=>c.classList.remove("active"));
  chip.classList.add("active"); filtroSalaRegistros = chip.dataset.sala || ""; renderizarRegistros();
}));
document.getElementById("btnMesAnterior").addEventListener("click",()=>{ mesRegistros--; if(mesRegistros<0){mesRegistros=11;anoRegistros--;} renderizarRegistros(); });
document.getElementById("btnMesProximo").addEventListener("click",()=>{ mesRegistros++; if(mesRegistros>11){mesRegistros=0;anoRegistros++;} renderizarRegistros(); });
document.getElementById("btnHoje").addEventListener("click",()=>{ const hoje = new Date(); mesRegistros = hoje.getMonth(); anoRegistros = hoje.getFullYear(); renderizarRegistros(); });
document.getElementById("btnLimparFiltros").addEventListener("click",()=>{ document.getElementById("registroDataDe").value="";document.getElementById("registroDataAte").value="";document.getElementById("registroStatus").value="";filtroSalaRegistros="";document.querySelectorAll("#chipsRegistros .chip").forEach(chip=>chip.classList.toggle("active", chip.dataset.sala === ""));renderizarRegistros(); });
["registroDataDe","registroDataAte","registroStatus"].forEach(id=>document.getElementById(id).addEventListener("change",renderizarRegistros));
["sala","data","hora_inicio","hora_fim"].forEach(id=>document.getElementById(id).addEventListener("change",verificarConflito));
document.body.addEventListener("click",(e)=>{ if(e.target.dataset.edit) editarEvento(e.target.dataset.edit); if(e.target.dataset.cancel) cancelarEvento(e.target.dataset.cancel); });
document.getElementById("exportarCSV").addEventListener("click",(e)=>{ e.preventDefault(); exportarCSV(); });
document.getElementById("btnLimparFormulario").addEventListener("click",limparFormulario);
form.addEventListener("submit", async (event)=>{
  event.preventDefault();
  const dados = pegarDadosFormulario();
  const erro = validarFormulario(dados);
  if(erro){ mensagemConflito.textContent = erro; return; }
  if(existeConflito(dados,idEditando)){ mensagemConflito.textContent = "⚠ Conflito de horário neste local."; return; }
  mensagemConflito.textContent = "";
  try{
    if(idEditando){
      await updateDoc(doc(db,"eventos",idEditando),{...dados,status:STATUS_AGENDADO,atualizado_em:agoraISO()});
      alert("Registro atualizado com sucesso.");
    }else{
      await addDoc(collection(db,"eventos"),{...dados,status:STATUS_AGENDADO,criado_em:agoraISO(),atualizado_em:agoraISO(),cancelado_em:""});
      alert("Registro salvo com sucesso.");
    }
    limparFormulario(); await carregarEventos();
  }catch(err){ console.error(err); alert("Erro ao salvar. Verifique o Firebase Config e as regras do Firestore."); }
});

carregarEventos();