document.addEventListener("DOMContentLoaded", () => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const fmt = (v, digits = 1) => Number(v).toLocaleString("pt-BR", {minimumFractionDigits: digits, maximumFractionDigits: digits});

  // Menu responsivo
  const menuToggle = $("menuToggle"), mainNav = $("mainNav");
  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      const open = mainNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
    });
    mainNav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      mainNav.classList.remove("open"); menuToggle.setAttribute("aria-expanded", "false");
    }));
  }

  // Gráfico de corpo negro: aproximação de Planck normalizada
  const canvas = $("graficoCorpoNegro");
  const tempSlider = $("temperaturaCorpo");
  function drawBlackbody() {
    if (!canvas || !tempSlider) return;
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(320, Math.floor(rect.width || 600));
    const h = 290, dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr; canvas.height = h * dpr;
    const ctx = canvas.getContext("2d"); ctx.scale(dpr, dpr);
    const T = Number(tempSlider.value);
    const left = 48, right = w - 16, top = 18, bottom = h - 38;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(190,203,255,.18)"; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = top + (bottom-top)*i/4;
      ctx.beginPath(); ctx.moveTo(left,y); ctx.lineTo(right,y); ctx.stroke();
    }
    const points = [];
    let max = 0;
    for (let i = 0; i <= 240; i++) {
      const nm = 100 + i * 10;
      const lm = nm * 1e-9;
      const c2 = 1.4387769e-2;
      const exponent = c2/(lm*T);
      const val = 1/(Math.pow(lm,5)*(Math.exp(Math.min(exponent,700))-1));
      points.push({nm,val}); if (val > max) max = val;
    }
    const peak = points.reduce((a,b) => b.val>a.val?b:a, points[0]);
    ctx.beginPath();
    points.forEach((p,i) => {
      const x = left + (p.nm-100)/2400*(right-left);
      const y = bottom - (p.val/max)*(bottom-top)*.88;
      if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.lineTo(right,bottom); ctx.lineTo(left,bottom); ctx.closePath();
    const grad = ctx.createLinearGradient(0,top,0,bottom);
    grad.addColorStop(0,"rgba(102,228,239,.32)"); grad.addColorStop(1,"rgba(102,228,239,0)");
    ctx.fillStyle=grad; ctx.fill();
    ctx.beginPath();
    points.forEach((p,i) => {
      const x = left + (p.nm-100)/2400*(right-left);
      const y = bottom - (p.val/max)*(bottom-top)*.88;
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    });
    ctx.strokeStyle="#66e4ef";ctx.lineWidth=2.5;ctx.stroke();
    const px=left+(peak.nm-100)/2400*(right-left);
    const py=bottom-(peak.val/max)*(bottom-top)*.88;
    ctx.beginPath();ctx.arc(px,py,4,0,Math.PI*2);ctx.fillStyle="#f49bd0";ctx.fill();
    ctx.fillStyle="#b3bdd8";ctx.font="11px DM Sans, sans-serif";
    ctx.fillText("100",left-8,h-14);ctx.fillText("1.300",left+(right-left)*.5-15,h-14);ctx.fillText("2.500 nm",right-48,h-14);
    ctx.fillText("Intensidade relativa",left,12);
    const wien=2.897771955e6/T;
    $("temperaturaCorpoValor").textContent=Number(T).toLocaleString("pt-BR")+" K";
    $("tempKelvin").textContent=Number(T).toLocaleString("pt-BR")+" K";
    $("picoWien").textContent=fmt(wien,1)+" nm";
    $("explicacaoCorpo").textContent = T < 3000
      ? "Nesta faixa, o pico está no infravermelho: o corpo emite energia térmica, mesmo sem emitir muita luz visível."
      : T < 6500
      ? "O aumento da temperatura desloca o pico para comprimentos de onda menores, aproximando-o da região visível."
      : "Em temperaturas elevadas, o pico se desloca para comprimentos de onda ainda menores, em direção à região visível e ultravioleta.";
  }
  if(tempSlider){tempSlider.addEventListener("input",drawBlackbody);drawBlackbody();}

  // Efeito fotoelétrico
  const freq=$("frequenciaFoto"), metal=$("metalFoto");
  function updatePhoto(){
    if(!freq||!metal)return;
    const f=Number(freq.value), phi=Number(metal.value), energy=4.135667696e-15*f*1e14;
    const emits=energy>=phi, kinetic=Math.max(0,energy-phi);
    $("frequenciaValor").textContent=fmt(f,1)+" × 10¹⁴ Hz";
    $("energiaFoton").textContent=fmt(energy,2)+" eV";
    $("funcaoTrabalho").textContent=fmt(phi,2)+" eV";
    $("resultadoFoto").textContent=emits
      ? "Há energia suficiente: a emissão de elétrons é possível. Energia cinética máxima aproximada: "+fmt(kinetic,2)+" eV."
      : "Não há energia suficiente para vencer a função trabalho deste material. Não ocorre emissão neste modelo.";
    $("fotoExplicacao").textContent=emits
      ? "A frequência escolhida supera a frequência de corte do material. Os fótons podem liberar elétrons."
      : "Aumente a frequência ou escolha outro material. Abaixo da frequência de corte, aumentar apenas a intensidade não resolve.";
    document.querySelector(".photo-scene").classList.toggle("emission",emits);
  }
  if(freq&&metal){freq.addEventListener("input",updatePhoto);metal.addEventListener("change",updatePhoto);updatePhoto();}

  // Simulador térmico da piscina
  const poolIds=["intensidadeSolar","coberturaPiscina","ventoPiscina","aquecimentoExtra"];
  function updatePool(){
    if(!$("temperaturaPiscina"))return;
    const s=+$("intensidadeSolar").value,c=+$("coberturaPiscina").value,v=+$("ventoPiscina").value,a=+$("aquecimentoExtra").value;
    const retention=clamp(35+c*.55-v*.2,0,100),loss=100-retention;
    const temperature=clamp(20+s*.075+c*.025-v*.035+a*.03,15,42);
    $("solarValor").textContent=s+"%";$("coberturaValor").textContent=c+"%";$("ventoValor").textContent=v+"%";$("extraValor").textContent=a+"%";
    $("temperaturaPiscina").textContent=fmt(temperature,1)+" °C";
    $("statusPiscina").textContent=temperature>=28?"Condição favorável":temperature>=24?"Aquecimento moderado":"Água em temperatura mais baixa";
    $("barraSolar").style.width=s+"%";$("barraRetencao").style.width=retention+"%";$("barraPerda").style.width=loss+"%";
    $("solarTexto").textContent=s+"%";$("retencaoTexto").textContent=Math.round(retention)+"%";$("perdaTexto").textContent=Math.round(loss)+"%";
  }
  poolIds.forEach(id=>$(id)?.addEventListener("input",updatePool));
  $("resetPiscina")?.addEventListener("click",()=>{[70,80,20,0].forEach((v,i)=>$(poolIds[i]).value=v);updatePool();});
  updatePool();

  // Sensores, controlador e atuadores
  function updateRobot(){
    const t=+$("sensorTemperatura").value,l=+$("sensorLuminosidade").value,n=+$("sensorNivel").value;
    $("sensorTempValor").textContent=t+" °C";$("sensorLuzValor").textContent=l+"%";$("sensorNivelValor").textContent=n+"%";
    let state="Sistema operando normalmente", action="Bomba em modo automático";
    const logs=[];
    if(n<25){state="Atenção: nível de água baixo";action="Alerta de nível; verificar abastecimento";logs.push("Nível baixo detectado: alerta emitido.");}
    else if(n>95){state="Atenção: nível de água elevado";action="Verificar entrada de água";logs.push("Nível elevado detectado: entrada deve ser verificada.");}
    if(t<25){action="Priorizar aquecimento da água";logs.push("Temperatura abaixo da meta: aquecimento solicitado.");}
    else if(t>=30){action="Reduzir aquecimento para economizar energia";logs.push("Temperatura atingiu a faixa alta: aquecimento reduzido.");}
    if(l>60)logs.push("Boa luminosidade: aproveitar geração/energia solar.");
    else logs.push("Baixa luminosidade: reduzir expectativa de ganho solar.");
    if(!logs.length)logs.push("Sensores dentro das faixas definidas.");
    $("estadoControlador").textContent=state;$("respostaAtuador").textContent=action;
    $("registroRobo").innerHTML="";
    logs.slice(0,4).forEach(msg=>{const li=document.createElement("li");li.textContent=msg;$("registroRobo").appendChild(li);});
  }
  ["sensorTemperatura","sensorLuminosidade","sensorNivel"].forEach(id=>$(id)?.addEventListener("input",updateRobot));
  updateRobot();

  // Acessibilidade
  let fontScale=1;
  $("aumentarFonte")?.addEventListener("click",()=>{fontScale=clamp(fontScale+.1,.9,1.4);document.documentElement.style.setProperty("--font-scale",fontScale);});
  $("diminuirFonte")?.addEventListener("click",()=>{fontScale=clamp(fontScale-.1,.9,1.4);document.documentElement.style.setProperty("--font-scale",fontScale);});
  $("contrasteToggle")?.addEventListener("click",e=>{const on=document.body.classList.toggle("high-contrast");e.currentTarget.setAttribute("aria-pressed",String(on));});
  $("dislexiaToggle")?.addEventListener("click",e=>{const on=document.body.classList.toggle("dyslexia-font");e.currentTarget.setAttribute("aria-pressed",String(on));});
  $("resetAcessibilidade")?.addEventListener("click",()=>{
    fontScale=1;document.documentElement.style.setProperty("--font-scale","1");
    document.body.classList.remove("high-contrast","dyslexia-font");
    $("contrasteToggle")?.setAttribute("aria-pressed","false");$("dislexiaToggle")?.setAttribute("aria-pressed","false");
  });

  // Quiz interativo
  const questions=[
    {cat:"Ondas eletromagnéticas",q:"Qual afirmação descreve corretamente as ondas eletromagnéticas?",a:["Precisam sempre de água para se propagar.","Podem se propagar no vácuo, transportando energia.","São todas visíveis ao olho humano.","Não transportam energia."],c:1,why:"A luz visível e o infravermelho são ondas eletromagnéticas e podem se propagar no vácuo."},
    {cat:"Corpo negro",q:"O que acontece com o pico da emissão quando a temperatura aumenta?",a:["Desloca-se para comprimentos de onda menores.","Desloca-se sempre para o vermelho.","Não muda.","Desaparece."],c:0,why:"Pela lei do deslocamento de Wien, o comprimento de onda de pico é inversamente proporcional à temperatura."},
    {cat:"Efeito fotoelétrico",q:"O que determina a energia de cada fóton?",a:["A cor do objeto iluminado.","A frequência da luz.","A distância até a lâmpada, apenas.","O tamanho da placa metálica."],c:1,why:"A energia do fóton é E = h · f: quanto maior a frequência, maior a energia."},
    {cat:"Projeto da piscina",q:"Qual é a função principal de um coletor solar térmico?",a:["Transformar água em eletricidade.","Absorver radiação solar e transferir calor para a água.","Diminuir a temperatura da piscina.","Medir o nível da água."],c:1,why:"O coletor absorve energia da radiação solar e a transfere como energia térmica."},
    {cat:"Sustentabilidade",q:"Por que uma cobertura térmica ajuda a piscina?",a:["Aumenta a evaporação.","Impede toda troca de energia para sempre.","Reduz a evaporação e ajuda a conservar calor.","Produz luz visível."],c:2,why:"A cobertura reduz principalmente a evaporação e contribui para diminuir a perda de calor."},
    {cat:"Robótica",q:"Em um sistema automatizado, qual é o papel dos sensores?",a:["Medir condições do ambiente e enviar dados ao controlador.","Aquecer a água diretamente.","Substituir toda a programação.","Armazenar a água."],c:0,why:"Sensores coletam dados; o controlador interpreta as leituras e pode acionar atuadores."}
  ];
  let qi=0,score=0,answered=false;
  function renderQuiz(){
    if(!$("quizPergunta"))return;
    const q=questions[qi];answered=false;
    $("quizProgressoTexto").textContent=`Pergunta ${qi+1} de ${questions.length}`;
    $("quizPontuacao").textContent=score;
    $("quizBarra").style.width=(qi/questions.length*100)+"%";
    $("quizCategoria").textContent=q.cat;$("quizPergunta").textContent=q.q;$("quizFeedback").textContent="";
    $("quizAlternativas").innerHTML="";
    q.a.forEach((answer,index)=>{
      const b=document.createElement("button");b.type="button";b.textContent=answer;
      b.addEventListener("click",()=>chooseAnswer(index));$("quizAlternativas").appendChild(b);
    });
    $("quizProximo").disabled=true;$("quizProximo").hidden=false;$("quizFinal").hidden=true;
  }
  function chooseAnswer(index){
    if(answered)return;answered=true;
    const q=questions[qi],buttons=[...$("quizAlternativas").querySelectorAll("button")];
    buttons.forEach((b,i)=>{b.disabled=true;if(i===q.c)b.classList.add("correct");if(i===index&&i!==q.c)b.classList.add("wrong");});
    if(index===q.c){score++;$("quizFeedback").textContent="Correto! "+q.why;}
    else $("quizFeedback").textContent="Ainda não! "+q.why;
    $("quizPontuacao").textContent=score;$("quizProximo").disabled=false;
    $("quizProximo").textContent=qi===questions.length-1?"Ver resultado":"Próxima pergunta →";
  }
  $("quizProximo")?.addEventListener("click",()=>{
    if(!answered)return;
    if(qi<questions.length-1){qi++;renderQuiz();}
    else{$("quizBarra").style.width="100%";$("quizAlternativas").innerHTML="";$("quizPergunta").textContent="";$("quizCategoria").textContent="RESULTADO";$("quizFeedback").textContent="";$("quizProximo").hidden=true;$("quizFinal").hidden=false;$("quizResultadoFinal").textContent=`Você acertou ${score} de ${questions.length} perguntas. ${score===questions.length?"Excelente domínio dos conceitos!":"Revise os simuladores e tente novamente para melhorar sua pontuação."}`;}
  });
  $("quizReiniciar")?.addEventListener("click",()=>{qi=0;score=0;renderQuiz();});
  renderQuiz();

  // Redesenha o gráfico quando o tamanho da janela muda.
  let resizeTimer;
  window.addEventListener("resize",()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(drawBlackbody,120);});
});
