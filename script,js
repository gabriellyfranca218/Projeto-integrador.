document.addEventListener("DOMContentLoaded", () => {
  // Utilitários: buscar elementos sem interromper o restante do site.
  const $ = (id) => document.getElementById(id);
  const setText = (id, value) => {
    const el = $(id);
    if (el) el.textContent = value;
  };
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  // =========================================================
  // 1. GRÁFICO DE RADIAÇÃO DE CORPO NEGRO
  // =========================================================
  const canvasCorpo = $("graficoCorpoNegro");
  const ctxCorpo = canvasCorpo ? canvasCorpo.getContext("2d") : null;
  const controleTemperatura = $("temperaturaCorpo");

  function desenharGraficoCorpo() {
    if (!canvasCorpo || !ctxCorpo || !controleTemperatura) return;

    const cssWidth = Math.max(280, canvasCorpo.getBoundingClientRect().width);
    const cssHeight = Math.max(180, canvasCorpo.getBoundingClientRect().height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvasCorpo.width = Math.round(cssWidth * dpr);
    canvasCorpo.height = Math.round(cssHeight * dpr);
    ctxCorpo.setTransform(dpr, 0, 0, dpr, 0, 0);

    const w = cssWidth;
    const h = cssHeight;
    const left = 45, right = 12, top = 18, bottom = 35;
    const plotW = w - left - right;
    const plotH = h - top - bottom;
    const T = Number(controleTemperatura.value);
    const peak = 2.898e6 / T;

    setText("temperaturaCorpoValor", `${T.toLocaleString("pt-BR")} K`);
    setText("tempKelvin", `${T.toLocaleString("pt-BR")} K`);
    setText("picoWien", `${Math.round(peak)} nm`);

    ctxCorpo.clearRect(0, 0, w, h);
    ctxCorpo.fillStyle = "#ffffff";
    ctxCorpo.fillRect(0, 0, w, h);

    // Grade e eixos.
    ctxCorpo.strokeStyle = "#ececf5";
    ctxCorpo.lineWidth = 1;
    ctxCorpo.font = "9px DM Sans, sans-serif";
    ctxCorpo.fillStyle = "#9299b0";
    for (let i = 0; i <= 4; i++) {
      const y = top + plotH * i / 4;
      ctxCorpo.beginPath();
      ctxCorpo.moveTo(left, y);
      ctxCorpo.lineTo(w - right, y);
      ctxCorpo.stroke();
    }
    for (let nm = 400; nm <= 2000; nm += 400) {
      const x = left + ((nm - 200) / 1800) * plotW;
      ctxCorpo.beginPath();
      ctxCorpo.moveTo(x, top);
      ctxCorpo.lineTo(x, top + plotH);
      ctxCorpo.stroke();
      ctxCorpo.fillText(String(nm), x - 9, h - 14);
    }
    ctxCorpo.fillText("Intensidade", 5, 12);
    ctxCorpo.fillText("Comprimento de onda (nm)", Math.max(5, w / 2 - 65), h - 2);

    // Lei de Planck simplificada, normalizada para cada curva.
    const planck = (lambdaNm, temp) => {
      const lambda = lambdaNm * 1e-9;
      const c2 = 1.4387769e-2;
      const exponent = c2 / (lambda * temp);
      if (exponent > 700) return 0;
      return 1 / (Math.pow(lambda, 5) * (Math.exp(exponent) - 1));
    };

    const curves = [
      { temp: 3000, color: "#e9a15f", width: 1.8 },
      { temp: T, color: "#8268dc", width: 2.8 },
      { temp: 5500, color: "#e477ac", width: 1.8 }
    ];

    // Normalização comum aproximada: cada curva é escalada pelo próprio máximo
    // para facilitar a comparação da posição dos picos.
    curves.forEach((curve) => {
      const values = [];
      let max = 0;
      for (let i = 0; i <= 180; i++) {
        const nm = 200 + i * 10;
        const value = planck(nm, curve.temp);
        values.push({ nm, value });
        if (value > max) max = value;
      }
      ctxCorpo.beginPath();
      values.forEach((point, index) => {
        const normalized = max ? point.value / max : 0;
        const x = left + ((point.nm - 200) / 1800) * plotW;
        const y = top + plotH - normalized * (plotH * 0.88);
        if (index === 0) ctxCorpo.moveTo(x, y);
        else ctxCorpo.lineTo(x, y);
      });
      ctxCorpo.strokeStyle = curve.color;
      ctxCorpo.lineWidth = curve.width;
      ctxCorpo.stroke();
    });

    // Marca o pico da temperatura selecionada, se estiver dentro da área.
    if (peak >= 200 && peak <= 2000) {
      const x = left + ((peak - 200) / 1800) * plotW;
      ctxCorpo.setLineDash([4, 4]);
      ctxCorpo.strokeStyle = "#8268dc";
      ctxCorpo.beginPath();
      ctxCorpo.moveTo(x, top);
      ctxCorpo.lineTo(x, top + plotH);
      ctxCorpo.stroke();
      ctxCorpo.setLineDash([]);
    }
  }

  if (controleTemperatura) {
    controleTemperatura.addEventListener("input", desenharGraficoCorpo);
  }

  // =========================================================
  // 2. EFEITO FOTOELÉTRICO
  // =========================================================
  const frequencia = $("frequenciaFoto");
  const metal = $("metalFoto");

  function atualizarFotoeletrico() {
    if (!frequencia || !metal) return;

    const f = Number(frequencia.value) * 1e14;
    const trabalho = Number(metal.value);
    const h = 4.135667696e-15;
    const energia = h * f;
    const libera = energia >= trabalho;
    const cinetica = Math.max(0, energia - trabalho);

    setText("frequenciaFotoValor", `${(f / 1e14).toFixed(1).replace(".", ",")} × 10¹⁴ Hz`);
    setText("energiaFoton", `${energia.toFixed(2)} eV`);
    setText("funcaoTrabalho", `${trabalho.toFixed(2)} eV`);

    const resultado = $("resultadoFoto");
    if (resultado) {
      resultado.classList.toggle("warning", !libera);
      resultado.innerHTML = libera
        ? `<strong>Elétrons liberados!</strong><span>Energia cinética máxima aproximada: ${cinetica.toFixed(2)} eV.</span>`
        : `<strong>Não há emissão de elétrons.</strong><span>A energia do fóton é menor que a função trabalho desse material.</span>`;
    }

    const visual = document.querySelector(".photo-visual");
    if (visual) visual.classList.toggle("photo-active", libera);
  }

  frequencia?.addEventListener("input", atualizarFotoeletrico);
  metal?.addEventListener("change", atualizarFotoeletrico);

  // =========================================================
  // 3. SIMULADOR DA PISCINA
  // =========================================================
  const solar = $("intensidadeSolar");
  const cobertura = $("coberturaPiscina");
  const vento = $("ventoPiscina");
  const extra = $("aquecimentoExtra");

  function atualizarPiscina() {
    if (!solar || !cobertura || !vento || !extra) return;

    const s = Number(solar.value);
    const c = Number(cobertura.value);
    const v = Number(vento.value);
    const a = Number(extra.value);

    // Modelo didático relativo, não uma previsão térmica real.
    const retencao = clamp(Math.round(48 + c * 32 - v * 0.18), 25, 90);
    const perda = 100 - retencao;
    const temperatura = clamp(Math.round(20 + s * 0.075 + c * 2.5 - v * 0.035 + a * 3), 10, 40);

    setText("solarValor", `${s}%`);
    setText("coberturaValor", c ? "Ligada" : "Desligada");
    setText("ventoValor", `${v}%`);
    setText("extraValor", a ? "Ligado" : "Desligado");
    setText("temperaturaPiscina", String(temperatura));
    setText("energiaSolarTexto", `${s}%`);
    setText("retencaoTexto", `${retencao}%`);
    setText("perdaTexto", `${perda}%`);

    const status = temperatura < 23 ? "Água mais fria" : temperatura < 30 ? "Condição confortável" : "Água aquecida";
    setText("statusPiscina", status);

    const barraSolar = $("barraSolar");
    const barraRetencao = $("barraRetencao");
    const barraPerda = $("barraPerda");
    if (barraSolar) barraSolar.style.width = `${s}%`;
    if (barraRetencao) barraRetencao.style.width = `${retencao}%`;
    if (barraPerda) barraPerda.style.width = `${perda}%`;

    let explicacao = "";
    if (s < 25) explicacao = "Com pouca luz solar, o coletor recebe menos energia. A temperatura estimada tende a subir menos.";
    else if (v > 65 && !c) explicacao = "O vento e a ausência de cobertura favorecem a perda de calor para o ambiente.";
    else if (c && s >= 50) explicacao = "A boa incidência solar e a cobertura térmica favorecem o aquecimento e a retenção de calor.";
    else if (a) explicacao = "O aquecimento auxiliar acrescenta energia ao sistema, além da contribuição solar.";
    else explicacao = "A piscina recebe energia solar, mas continua trocando calor com o ambiente.";
    setText("explicacaoPiscina", explicacao);
  }

  [solar, cobertura, vento, extra].forEach((control) => {
    control?.addEventListener("input", atualizarPiscina);
    control?.addEventListener("change", atualizarPiscina);
  });

  $("resetPiscina")?.addEventListener("click", () => {
    solar.value = 75;
    cobertura.value = 1;
    vento.value = 25;
    extra.value = 0;
    atualizarPiscina();
  });

  // =========================================================
  // 4. SIMULADOR DE ROBÓTICA
  // =========================================================
  const sensorTemp = $("sensorTemperatura");
  const sensorLuz = $("sensorLuminosidade");
  const sensorNivel = $("sensorNivel");

  function atualizarRobo() {
    if (!sensorTemp || !sensorLuz || !sensorNivel) return;

    const t = Number(sensorTemp.value);
    const l = Number(sensorLuz.value);
    const n = Number(sensorNivel.value);

    setText("sensorTemperaturaValor", `${t} °C`);
    setText("sensorLuminosidadeValor", `${l}%`);
    setText("sensorNivelValor", `${n}%`);

    let estado = "Sistema em operação";
    let resposta = "Bomba em modo de espera";
    let registro = "Leituras dentro dos parâmetros definidos. Nenhuma ação necessária.";

    if (n < 25) {
      estado = "Nível baixo detectado";
      resposta = "Bomba de abastecimento acionada";
      registro = `Sensor de nível detectou ${n}%. Controlador acionou o abastecimento da piscina.`;
    } else if (t < 22 && l > 40) {
      estado = "Água abaixo da temperatura-alvo";
      resposta = "Circulação pelo aquecedor solar ativada";
      registro = `Temperatura de ${t} °C e luminosidade de ${l}%. Sistema priorizou o aquecimento solar.`;
    } else if (t >= 32) {
      estado = "Temperatura elevada detectada";
      resposta = "Aquecimento desligado";
      registro = `Temperatura de ${t} °C. Controlador interrompeu o aquecimento para evitar elevação adicional.`;
    } else if (l < 20) {
      estado = "Baixa luminosidade";
      resposta = "Aquecimento solar em espera";
      registro = `Luminosidade de ${l}%. O controlador identificou pouca energia solar disponível.`;
    } else {
      registro = `Sensores registraram ${t} °C, ${l}% de luminosidade e ${n}% de nível. Sistema em monitoramento.`;
    }

    setText("estadoControlador", estado);
    setText("respostaAtuador", resposta);
    setText("registroRobo", registro);
  }

  [sensorTemp, sensorLuz, sensorNivel].forEach((control) => {
    control?.addEventListener("input", atualizarRobo);
    control?.addEventListener("change", atualizarRobo);
  });

  // =========================================================
  // 5. QUIZ
  // =========================================================
  const perguntas = [
    {
      categoria: "RADIAÇÃO TÉRMICA",
      pergunta: "O que acontece com o pico de emissão de um corpo negro quando sua temperatura aumenta?",
      alternativas: [
        "Desloca-se para comprimentos de onda menores.",
        "Desloca-se para comprimentos de onda maiores.",
        "Permanece sempre no mesmo comprimento de onda.",
        "A radiação deixa de ser emitida."
      ],
      correta: 0,
      explicacao: "Pela lei de Wien, o aumento da temperatura desloca o pico para comprimentos de onda menores."
    },
    {
      categoria: "EFEITO FOTOELÉTRICO",
      pergunta: "O que determina se um fóton consegue liberar um elétron de um material?",
      alternativas: [
        "Somente a cor aparente do material.",
        "A energia do fóton em relação à função trabalho.",
        "A massa do material.",
        "A distância entre a fonte de luz e o material."
      ],
      correta: 1,
      explicacao: "A energia do fóton precisa ser igual ou maior que a função trabalho do material."
    },
    {
      categoria: "ENERGIA SOLAR",
      pergunta: "Qual é a principal função de um coletor solar térmico usado no aquecimento de piscinas?",
      alternativas: [
        "Transformar água em eletricidade.",
        "Diminuir a temperatura da água.",
        "Absorver energia solar e transferir calor para a água.",
        "Impedir toda troca de energia com o ambiente."
      ],
      correta: 2,
      explicacao: "O coletor absorve a radiação solar e transfere energia térmica para a água que circula pelo sistema."
    },
    {
      categoria: "TRANSFERÊNCIA DE CALOR",
      pergunta: "Por que uma cobertura térmica ajuda a piscina a conservar calor?",
      alternativas: [
        "Porque aumenta a velocidade do vento.",
        "Porque ajuda a reduzir a evaporação e a perda de calor.",
        "Porque transforma calor em luz.",
        "Porque impede a incidência da gravidade."
      ],
      correta: 1,
      explicacao: "A cobertura reduz principalmente a evaporação, que é uma importante forma de perda de energia térmica."
    },
    {
      categoria: "ROBÓTICA",
      pergunta: "Em um sistema automatizado, qual é a função do controlador?",
      alternativas: [
        "Apenas decorar o equipamento.",
        "Armazenar água na piscina.",
        "Substituir todos os sensores.",
        "Interpretar os dados dos sensores e comandar os atuadores."
      ],
      correta: 3,
      explicacao: "O controlador recebe e interpreta as informações dos sensores e decide quais ações os atuadores devem executar."
    }
  ];

  let perguntaAtual = 0;
  let pontos = 0;
  let respondeu = false;

  function carregarPergunta() {
    const pergunta = perguntas[perguntaAtual];
    if (!pergunta) return;

    respondeu = false;
    $("quizConteudo").hidden = false;
    $("quizFinal").hidden = true;
    $("quizProximo").disabled = true;
    $("quizProximo").textContent = perguntaAtual === perguntas.length - 1
      ? "Ver resultado →"
      : "Próxima pergunta →";

    setText("quizProgressoTexto", `PERGUNTA ${perguntaAtual + 1} DE ${perguntas.length}`);
    setText("quizPontuacao", `Pontos: ${pontos}`);
    setText("quizCategoria", pergunta.categoria);
    setText("quizPergunta", pergunta.pergunta);
    setText("quizFeedback", "");

    const barra = $("quizBarra");
    if (barra) barra.style.width = `${(perguntaAtual / perguntas.length) * 100}%`;

    const alternativas = $("quizAlternativas");
    alternativas.innerHTML = "";

    pergunta.alternativas.forEach((alternativa, index) => {
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "quiz-option";
      botao.textContent = `${String.fromCharCode(65 + index)}. ${alternativa}`;
      botao.addEventListener("click", () => selecionarResposta(index));
      alternativas.appendChild(botao);
    });
  }

  function selecionarResposta(indice) {
    if (respondeu) return;
    respondeu = true;

    const pergunta = perguntas[perguntaAtual];
    const botoes = $("quizAlternativas").querySelectorAll("button");
    botoes.forEach((botao, i) => {
      botao.disabled = true;
      if (i === pergunta.correta) botao.classList.add("correct");
      if (i === indice && i !== pergunta.correta) botao.classList.add("incorrect");
    });

    const acertou = indice === pergunta.correta;
    if (acertou) pontos++;

    const feedback = $("quizFeedback");
    feedback.className = `quiz-feedback ${acertou ? "good" : "bad"}`;
    feedback.textContent = `${acertou ? "Resposta correta! " : "Não foi dessa vez. "}${pergunta.explicacao}`;

    setText("quizPontuacao", `Pontos: ${pontos}`);
    $("quizProximo").disabled = false;
  }

  function avancarQuiz() {
    if (!respondeu) return;

    perguntaAtual++;
    if (perguntaAtual < perguntas.length) {
      carregarPergunta();
      return;
    }

    $("quizConteudo").hidden = true;
    $("quizFinal").hidden = false;
    $("quizBarra").style.width = "100%";
    setText("quizProgressoTexto", "QUIZ CONCLUÍDO");
    setText("quizResultadoFinal", `Você acertou ${pontos} de ${perguntas.length} perguntas. ${
      pontos === perguntas.length ? "Excelente! Você dominou os conceitos." :
      pontos >= 3 ? "Bom trabalho! Você já compreendeu boa parte dos conceitos." :
      "Continue explorando o laboratório e tente novamente."
    }`);
  }

  function reiniciarQuiz() {
    perguntaAtual = 0;
    pontos = 0;
    respondeu = false;
    carregarPergunta();
  }

  $("quizProximo")?.addEventListener("click", avancarQuiz);
  $("quizReiniciar")?.addEventListener("click", reiniciarQuiz);

  // =========================================================
  // 6. INICIALIZAÇÃO E REDIMENSIONAMENTO
  // =========================================================
  atualizarFotoeletrico();
  atualizarPiscina();
  atualizarRobo();
  carregarPergunta();

  // Aguarda o layout calcular as dimensões reais dos gráficos.
  requestAnimationFrame(() => {
    desenharGraficoCorpo();
    requestAnimationFrame(desenharGraficoCorpo);
  });

  window.addEventListener("resize", desenharGraficoCorpo);

  if (canvasCorpo && "ResizeObserver" in window) {
    const observador = new ResizeObserver(() => desenharGraficoCorpo());
    observador.observe(canvasCorpo);
  }
});
