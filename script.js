document.addEventListener("DOMContentLoaded", () => {
  // FUNÇÕES AUXILIARES
  const byId = (id) => document.getElementById(id);
  const numberBR = (value, decimals = 1) =>
    Number(value).toFixed(decimals).replace(".", ",");

  // 1. RADIAÇÃO DE CORPO NEGRO
  function iniciarCorpoNegro() {
    const canvas = byId("graficoCorpoNegro");
    const slider = byId("temperaturaCorpo");
    const valor = byId("temperaturaCorpoValor");
    const kelvin = byId("tempKelvin");
    const pico = byId("picoWien");
    const explicacao = byId("explicacaoCorpo");

    if (!canvas || !slider) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function desenhar() {
      const temperatura = Number(slider.value);
      const largura = canvas.width;
      const altura = canvas.height;
      const margem = { left: 65, right: 20, top: 20, bottom: 48 };
      const graficoW = largura - margem.left - margem.right;
      const graficoH = altura - margem.top - margem.bottom;

      ctx.clearRect(0, 0, largura, altura);
      ctx.fillStyle = "#fbfcff";
      ctx.fillRect(0, 0, largura, altura);

      // Grade e eixos
      ctx.strokeStyle = "#e7eaf4";
      ctx.lineWidth = 1;
      ctx.font = "17px DM Sans, sans-serif";
      ctx.fillStyle = "#78829d";

      for (let i = 0; i <= 4; i++) {
        const y = margem.top + (graficoH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(margem.left, y);
        ctx.lineTo(largura - margem.right, y);
        ctx.stroke();
      }

      for (let i = 0; i <= 5; i++) {
        const x = margem.left + (graficoW / 5) * i;
        ctx.beginPath();
        ctx.moveTo(x, margem.top);
        ctx.lineTo(x, altura - margem.bottom);
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.fillText(String(i), x, altura - 17);
      }

      ctx.save();
      ctx.translate(17, altura / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = "center";
      ctx.fillStyle = "#68738f";
      ctx.fillText("Intensidade relativa", 0, 0);
      ctx.restore();

      ctx.textAlign = "center";
      ctx.fillStyle = "#68738f";
      ctx.fillText("Comprimento de onda (µm)", largura / 2, altura - 2);

      // Lei de Planck: curva normalizada para comparação visual.
      const c2 = 14387.77; // µm.K
      const pontos = [];
      let maximo = 0;

      for (let i = 0; i <= 300; i++) {
        const lambda = 0.25 + (5.75 * i / 300);
        const expoente = c2 / (lambda * temperatura);
        const seguro = Math.min(expoente, 700);
        const intensidade =
          1 / (Math.pow(lambda, 5) * (Math.exp(seguro) - 1));

        pontos.push({ lambda, intensidade });
        if (intensidade > maximo) maximo = intensidade;
      }

      ctx.beginPath();
      pontos.forEach((p, i) => {
        const x = margem.left + ((p.lambda - 0.25) / 5.75) * graficoW;
        const y = margem.top + graficoH -
          (p.intensidade / maximo) * graficoH * 0.9;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      const gradiente = ctx.createLinearGradient(0, margem.top, 0, altura);
      gradiente.addColorStop(0, "rgba(125, 91, 221, 0.28)");
      gradiente.addColorStop(1, "rgba(125, 91, 221, 0.01)");

      ctx.lineTo(largura - margem.right, altura - margem.bottom);
      ctx.lineTo(margem.left, altura - margem.bottom);
      ctx.closePath();
      ctx.fillStyle = gradiente;
      ctx.fill();

      ctx.beginPath();
      pontos.forEach((p, i) => {
        const x = margem.left + ((p.lambda - 0.25) / 5.75) * graficoW;
        const y = margem.top + graficoH -
          (p.intensidade / maximo) * graficoH * 0.9;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.strokeStyle = "#8058d9";
      ctx.lineWidth = 4;
      ctx.stroke();

      // Pico de Wien
      const lambdaPico = 2898 / temperatura;
      const xPico = margem.left +
        ((lambdaPico - 0.25) / 5.75) * graficoW;

      ctx.setLineDash([7, 6]);
      ctx.strokeStyle = "#e68bb8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(xPico, margem.top);
      ctx.lineTo(xPico, altura - margem.bottom);
      ctx.stroke();
      ctx.setLineDash([]);

      valor.textContent = `${temperatura} K`;
      kelvin.textContent = `${temperatura} K`;
      pico.textContent = `${numberBR(lambdaPico * 1000, 0)} nm`;

      explicacao.textContent =
        temperatura >= 5500
          ? "Com essa temperatura, o pico de emissão está em comprimentos de onda menores."
          : "Com essa temperatura, o pico de emissão está em comprimentos de onda maiores.";
    }

    slider.addEventListener("input", desenhar);
    desenhar();
  }

  // 2. EFEITO FOTOELÉTRICO
  function iniciarFotoeletrico() {
    const frequencia = byId("frequenciaFoto");
    const metal = byId("metalFoto");
    const frequenciaValor = byId("frequenciaFotoValor");
    const energia = byId("energiaFoton");
    const trabalho = byId("funcaoTrabalho");
    const resultado = byId("resultadoFoto");
    const cena = document.querySelector(".photo-scene");

    if (!frequencia || !metal) return;

    // Constante de Planck em eV.s
    const h = 4.135667696e-15;

    function atualizar() {
      const f = Number(frequencia.value) * 1e14;
      const funcao = Number(metal.value);
      const energiaFoton = h * f;
      const liberaEletrons = energiaFoton >= funcao;
      const energiaCinetica = Math.max(0, energiaFoton - funcao);

      frequenciaValor.textContent =
        `${numberBR(Number(frequencia.value), 1)} × 10¹⁴ Hz`;

      energia.textContent = `${numberBR(energiaFoton, 2)} eV`;
      trabalho.textContent = `${numberBR(funcao, 2)} eV`;

      if (liberaEletrons) {
        resultado.textContent =
          `Efeito fotoelétrico: elétrons são liberados! Energia cinética máxima estimada: ${numberBR(energiaCinetica, 2)} eV.`;
        resultado.classList.add("success");
        cena?.classList.add("emitting");
      } else {
        resultado.textContent =
          "A energia do fóton é menor que a função trabalho. Não há emissão de elétrons.";
        resultado.classList.remove("success");
        cena?.classList.remove("emitting");
      }
    }

    frequencia.addEventListener("input", atualizar);
    metal.addEventListener("change", atualizar);
    atualizar();
  }

  // 3. SIMULADOR DA PISCINA
  function iniciarPiscina() {
    const solar = byId("intensidadeSolar");
    const cobertura = byId("coberturaPiscina");
    const vento = byId("ventoPiscina");
    const extra = byId("aquecimentoExtra");

    if (!solar || !cobertura || !vento || !extra) return;

    const saidas = {
      solar: byId("solarValor"),
      cobertura: byId("coberturaValor"),
      vento: byId("ventoValor"),
      extra: byId("extraValor")
    };

    function atualizar() {
      const s = Number(solar.value);
      const c = Number(cobertura.value);
      const v = Number(vento.value);
      const a = Number(extra.value);

      saidas.solar.textContent = `${s}%`;
      saidas.cobertura.textContent = `${c}%`;
      saidas.vento.textContent = `${v}%`;
      saidas.extra.textContent = `${a}%`;

      // Modelo didático: representa uma temperatura estimada.
      // Não substitui um cálculo térmico de uma piscina real.
      const temperatura = Math.max(
        15,
        Math.min(42, 20 + s * 0.075 + c * 0.025 - v * 0.035 + a * 0.03)
      );

      const retencao = Math.min(100, Math.max(0, 35 + c * 0.55 - v * 0.2));
      const perda = 100 - retencao;

      byId("temperaturaPiscina").textContent =
        `${numberBR(temperatura, 1)} °C`;

      byId("energiaSolarTexto").textContent = `${s}%`;
      byId("retencaoTexto").textContent = `${Math.round(retencao)}%`;
      byId("perdaTexto").textContent = `${Math.round(perda)}%`;

      byId("barraSolar").style.width = `${s}%`;
      byId("barraRetencao").style.width = `${retencao}%`;
      byId("barraPerda").style.width = `${perda}%`;

      let status = "A água está em uma faixa de temperatura moderada.";
      if (temperatura >= 32) status = "A estimativa indica uma água mais aquecida.";
      if (temperatura < 24) status = "A estimativa indica uma água mais fria.";

      byId("statusPiscina").textContent = status;

      let explicacao = "Ajuste os controles e observe o resultado.";
      if (c < 30 && v > 60) {
        explicacao = "Pouca cobertura e vento intenso favorecem a perda de calor.";
      } else if (c > 70 && s > 60) {
        explicacao = "Boa incidência solar e cobertura elevada favorecem o aquecimento e a conservação do calor.";
      } else if (s < 20) {
        explicacao = "Com pouca incidência solar, o ganho de energia térmica é menor.";
      }

      byId("explicacaoPiscina").textContent = explicacao;
    }

    [solar, cobertura, vento, extra].forEach((controle) => {
      controle.addEventListener("input", atualizar);
    });

    byId("resetPiscina")?.addEventListener("click", () => {
      solar.value = 70;
      cobertura.value = 80;
      vento.value = 30;
      extra.value = 0;
      atualizar();
    });

    atualizar();
  }

  // 4. ROBÓTICA E SENSORES
  function iniciarRobotica() {
    const temperatura = byId("sensorTemperatura");
    const luminosidade = byId("sensorLuminosidade");
    const nivel = byId("sensorNivel");

    if (!temperatura || !luminosidade || !nivel) return;

    const registro = byId("registroRobo");
    let ultimoEstado = "";

    function atualizar() {
      const t = Number(temperatura.value);
      const l = Number(luminosidade.value);
      const n = Number(nivel.value);

      byId("sensorTemperaturaValor").textContent = `${t} °C`;
      byId("sensorLuminosidadeValor").textContent = `${l}%`;
      byId("sensorNivelValor").textContent = `${n}%`;

      const acoes = [];

      if (t < 20) acoes.push("Temperatura baixa: avaliar acionamento do aquecimento.");
      else if (t > 32) acoes.push("Temperatura alta: reduzir o aquecimento.");
      else acoes.push("Temperatura dentro da faixa definida.");

      if (l < 25) acoes.push("Pouca luminosidade: acender iluminação.");
      else acoes.push("Luminosidade suficiente: iluminação desligada.");

      if (n < 25) acoes.push("Nível baixo: acionar alerta de nível.");
      else if (n > 90) acoes.push("Nível muito alto: interromper o abastecimento.");
      else acoes.push("Nível de água adequado.");

      byId("estadoControlador").textContent =
        "Dados recebidos e analisados pelo controlador.";

      byId("respostaAtuador").textContent = acoes.join(" ");

      const estadoAtual = `${t}|${l}|${n}`;
      if (estadoAtual !== ultimoEstado) {
        ultimoEstado = estadoAtual;

        const item = document.createElement("li");
        item.textContent =
          `Leitura: ${t} °C, luminosidade ${l}%, nível ${n}%.`;

        registro.prepend(item);

        while (registro.children.length > 5) {
          registro.removeChild(registro.lastElementChild);
        }
      }
    }

    [temperatura, luminosidade, nivel].forEach((controle) => {
      controle.addEventListener("input", atualizar);
    });

    atualizar();
  }

  // 5. QUIZ
  function iniciarQuiz() {
    const perguntas = [
      {
        categoria: "Radiação de corpo negro",
        pergunta: "O que caracteriza um corpo negro ideal?",
        alternativas: [
          "Reflete toda a luz que recebe.",
          "Absorve toda a radiação que recebe.",
          "Não emite energia térmica.",
          "Só absorve luz azul."
        ],
        correta: 1,
        explicacao: "Um corpo negro ideal absorve toda a radiação incidente e também emite radiação térmica."
      },
      {
        categoria: "Lei de Wien",
        pergunta: "Quando a temperatura de um corpo negro aumenta, o que acontece com o comprimento de onda de pico?",
        alternativas: [
          "Aumenta.",
          "Permanece sempre igual.",
          "Diminui.",
          "Desaparece."
        ],
        correta: 2,
        explicacao: "Pela lei de Wien, o comprimento de onda de máxima emissão é inversamente proporcional à temperatura."
      },
      {
        categoria: "Efeito fotoelétrico",
        pergunta: "O que é necessário para que ocorra a emissão de elétrons no efeito fotoelétrico?",
        alternativas: [
          "A energia do fóton deve atingir a função trabalho.",
          "A luz precisa ser sempre vermelha.",
          "O material precisa estar congelado.",
          "A intensidade precisa ser zero."
        ],
        correta: 0,
        explicacao: "A energia de cada fóton precisa ser igual ou maior que a função trabalho do material."
      },
      {
        categoria: "Energia solar",
        pergunta: "Qual é a principal função de um coletor solar térmico em uma piscina?",
        alternativas: [
          "Transformar água em eletricidade.",
          "Absorver energia solar e transferir calor para a água.",
          "Diminuir a temperatura da piscina.",
          "Produzir vento."
        ],
        correta: 1,
        explicacao: "O coletor térmico absorve energia solar e transfere calor para a água que circula pelo sistema."
      },
      {
        categoria: "Transferência de calor",
        pergunta: "Por que uma capa térmica ajuda a conservar a temperatura da piscina?",
        alternativas: [
          "Porque aumenta a evaporação.",
          "Porque impede a entrada de luz solar.",
          "Porque reduz principalmente a evaporação e a perda de calor.",
          "Porque transforma calor em água."
        ],
        correta: 2,
        explicacao: "A cobertura reduz a evaporação e ajuda a diminuir as perdas de energia térmica."
      },
      {
        categoria: "Robótica",
        pergunta: "Qual é a função dos sensores em um sistema automatizado?",
        alternativas: [
          "Executar movimentos mecânicos diretamente.",
          "Coletar informações do ambiente.",
          "Substituir todas as partes do robô.",
          "Armazenar energia solar."
        ],
        correta: 1,
        explicacao: "Os sensores coletam dados do ambiente, que são enviados ao controlador para orientar as ações do sistema."
      }
    ];

    const conteudo = byId("quizConteudo");
    const final = byId("quizFinal");
    const perguntaEl = byId("quizPergunta");
    const alternativasEl = byId("quizAlternativas");
    const feedbackEl = byId("quizFeedback");
    const proximo = byId("quizProximo");

    if (!conteudo || !perguntaEl || !alternativasEl || !proximo) return;

    let indice = 0;
    let pontuacao = 0;
    let respondeu = false;

    function mostrarPergunta() {
      respondeu = false;

      const atual = perguntas[indice];

      conteudo.hidden = false;
      final.hidden = true;

      byId("quizProgressoTexto").textContent =
        `Pergunta ${indice + 1} de ${perguntas.length}`;

      byId("quizPontuacao").textContent = pontuacao;
      byId("quizBarra").style.width =
        `${(indice / perguntas.length) * 100}%`;

      byId("quizCategoria").textContent = atual.categoria;
      perguntaEl.textContent = atual.pergunta;
      feedbackEl.textContent = "";

      proximo.disabled = true;
      proximo.textContent =
        indice === perguntas.length - 1
          ? "Ver resultado →"
          : "Próxima pergunta →";

      alternativasEl.innerHTML = "";

      atual.alternativas.forEach((alternativa, i) => {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "quiz-option";
        botao.textContent = alternativa;

        botao.addEventListener("click", () => selecionarResposta(i));

        alternativasEl.appendChild(botao);
      });
    }

    function selecionarResposta(escolha) {
      if (respondeu) return;
      respondeu = true;

      const atual = perguntas[indice];
      const botoes = alternativasEl.querySelectorAll("button");

      botoes.forEach((botao, i) => {
        botao.disabled = true;

        if (i === atual.correta) {
          botao.classList.add("correct");
        } else if (i === escolha) {
          botao.classList.add("incorrect");
        }
      });

      if (escolha === atual.correta) {
        pontuacao++;
        feedbackEl.textContent = `Correto! ${atual.explicacao}`;
        feedbackEl.style.color = "#28785d";
      } else {
        feedbackEl.textContent = `Não foi dessa vez. ${atual.explicacao}`;
        feedbackEl.style.color = "#a84c66";
      }

      byId("quizPontuacao").textContent = pontuacao;
      proximo.disabled = false;
    }

    function terminarQuiz() {
      conteudo.hidden = true;
      final.hidden = false;
      byId("quizBarra").style.width = "100%";

      byId("quizProgressoTexto").textContent = "Quiz concluído";

      byId("quizResultadoFinal").textContent =
        `Você acertou ${pontuacao} de ${perguntas.length} perguntas. ` +
        (pontuacao === perguntas.length
          ? "Excelente! Você dominou os conteúdos."
          : "Continue explorando o AquaLuz Lab para aprender ainda mais.");
    }

    proximo.addEventListener("click", () => {
      if (!respondeu) return;

      if (indice < perguntas.length - 1) {
        indice++;
        mostrarPergunta();
      } else {
        terminarQuiz();
      }
    });

    byId("quizReiniciar")?.addEventListener("click", () => {
      indice = 0;
      pontuacao = 0;
      mostrarPergunta();
    });

    mostrarPergunta();
  }

  // INICIALIZAÇÃO DOS COMPONENTES
  // Um erro em um simulador não impede os outros de funcionar.
  const componentes = [
    ["Corpo negro", iniciarCorpoNegro],
    ["Efeito fotoelétrico", iniciarFotoeletrico],
    ["Piscina", iniciarPiscina],
    ["Robótica", iniciarRobotica],
    ["Quiz", iniciarQuiz]
  ];

  componentes.forEach(([nome, iniciar]) => {
    try {
      iniciar();
    } catch (erro) {
      console.error(`Erro no componente ${nome}:`, erro);
    }
  });

  console.info("AquaLuz Lab: JavaScript carregado e inicializado.");
});
