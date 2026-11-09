/* ==========================================
   AQUALUZ LAB — RECURSOS COMPLEMENTARES
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
  /* ----------------------------------------
     1. ACESSIBILIDADE: CONTRASTE
  ---------------------------------------- */

  const contrasteBtn = document.getElementById("contrasteBtn");
  const fonteMenos = document.getElementById("fonteMenos");
  const fonteMais = document.getElementById("fonteMais");
  const dislexiaBtn = document.getElementById("dislexiaBtn");
  const resetBtn = document.getElementById("acessibilidadeReset");
  const statusAcessibilidade = document.getElementById("acessibilidadeStatus");

  let tamanhoFonte = 100;

  function atualizarStatus(mensagem) {
    if (statusAcessibilidade) {
      statusAcessibilidade.textContent = mensagem;
    }
  }

  if (contrasteBtn) {
    contrasteBtn.addEventListener("click", () => {
      const ativado = document.body.classList.toggle("high-contrast");

      contrasteBtn.setAttribute("aria-pressed", String(ativado));

      atualizarStatus(
        ativado
          ? "Modo de alto contraste ativado."
          : "Modo de alto contraste desativado."
      );
    });
  }

  /* ----------------------------------------
     2. ACESSIBILIDADE: TAMANHO DA FONTE
  ---------------------------------------- */

  function aplicarTamanhoFonte() {
    document.documentElement.style.setProperty(
      "--access-font-size",
      `${tamanhoFonte}%`
    );

    atualizarStatus(`Tamanho da fonte: ${tamanhoFonte}%.`);
  }

  if (fonteMais) {
    fonteMais.addEventListener("click", () => {
      tamanhoFonte = Math.min(140, tamanhoFonte + 10);
      aplicarTamanhoFonte();
    });
  }

  if (fonteMenos) {
    fonteMenos.addEventListener("click", () => {
      tamanhoFonte = Math.max(80, tamanhoFonte - 10);
      aplicarTamanhoFonte();
    });
  }

  /* ----------------------------------------
     3. ACESSIBILIDADE: FONTE DE LEITURA
  ---------------------------------------- */

  if (dislexiaBtn) {
    dislexiaBtn.addEventListener("click", () => {
      const ativado = document.body.classList.toggle("dyslexia-font");

      dislexiaBtn.setAttribute("aria-pressed", String(ativado));

      atualizarStatus(
        ativado
          ? "Fonte de leitura acessível ativada."
          : "Fonte de leitura acessível desativada."
      );
    });
  }

  /* ----------------------------------------
     4. RESTAURAR CONFIGURAÇÕES
  ---------------------------------------- */

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      document.body.classList.remove("high-contrast");
      document.body.classList.remove("dyslexia-font");

      tamanhoFonte = 100;
      aplicarTamanhoFonte();

      if (contrasteBtn) {
        contrasteBtn.setAttribute("aria-pressed", "false");
      }

      if (dislexiaBtn) {
        dislexiaBtn.setAttribute("aria-pressed", "false");
      }

      atualizarStatus("Configurações de acessibilidade restauradas.");
    });
  }

  /* ----------------------------------------
     5. VALORES DOS CONTROLES DA PISCINA
  ---------------------------------------- */

  const controlesPiscina = [
    {
      id: "intensidadeSolar",
      output: "solarValor",
      sufixo: "%"
    },
    {
      id: "coberturaPiscina",
      output: "coberturaValor",
      sufixo: "%"
    },
    {
      id: "ventoPiscina",
      output: "ventoValor",
      sufixo: "%"
    },
    {
      id: "aquecimentoExtra",
      output: "extraValor",
      sufixo: "%"
    }
  ];

  controlesPiscina.forEach((item) => {
    const controle = document.getElementById(item.id);
    const output = document.getElementById(item.output);

    if (!controle || !output) return;

    const atualizar = () => {
      output.textContent = `${controle.value}${item.sufixo}`;
    };

    controle.addEventListener("input", atualizar);
    atualizar();
  });

  /* ----------------------------------------
     6. VALORES DOS SENSORES
  ---------------------------------------- */

  const controlesSensores = [
    {
      id: "sensorTemperatura",
      output: "sensorTemperaturaValor",
      sufixo: " °C"
    },
    {
      id: "sensorLuminosidade",
      output: "sensorLuminosidadeValor",
      sufixo: "%"
    },
    {
      id: "sensorNivel",
      output: "sensorNivelValor",
      sufixo: "%"
    }
  ];

  controlesSensores.forEach((item) => {
    const controle = document.getElementById(item.id);
    const output = document.getElementById(item.output);

    if (!controle || !output) return;

    const atualizar = () => {
      output.textContent = `${controle.value}${item.sufixo}`;
    };

    controle.addEventListener("input", atualizar);
    atualizar();
  });

  /* ----------------------------------------
     7. FREQUÊNCIA DO SIMULADOR FOTOELÉTRICO
  ---------------------------------------- */

  const frequenciaFoto = document.getElementById("frequenciaFoto");
  const frequenciaFotoValor = document.getElementById("frequenciaFotoValor");

  if (frequenciaFoto && frequenciaFotoValor) {
    const atualizarFrequencia = () => {
      const valor = Number(frequenciaFoto.value);

      frequenciaFotoValor.textContent =
        `${valor.toFixed(1).replace(".", ",")} × 10¹⁴ Hz`;
    };

    frequenciaFoto.addEventListener("input", atualizarFrequencia);
    atualizarFrequencia();
  }

  /* ----------------------------------------
     8. NAVEGAÇÃO POR TECLADO
  ---------------------------------------- */

  document.querySelectorAll("a[href^='#']").forEach((link) => {
    link.addEventListener("click", () => {
      const destino = document.querySelector(link.getAttribute("href"));

      if (destino) {
        destino.setAttribute("tabindex", "-1");

        destino.addEventListener(
          "blur",
          () => destino.removeAttribute("tabindex"),
          { once: true }
        );
      }
    });
  });

  /* ----------------------------------------
     9. VERIFICAÇÃO DE ELEMENTOS
  ---------------------------------------- */

  const elementosEssenciais = [
    "graficoCorpoNegro",
    "temperaturaCorpo",
    "frequenciaFoto",
    "metalFoto",
    "intensidadeSolar",
    "coberturaPiscina",
    "ventoPiscina",
    "sensorTemperatura",
    "sensorLuminosidade",
    "sensorNivel",
    "quizPergunta",
    "quizAlternativas"
  ];

  const ausentes = elementosEssenciais.filter(
    (id) => !document.getElementById(id)
  );

  if (ausentes.length > 0) {
    console.warn(
      "AquaLuz Lab: elementos não encontrados:",
      ausentes
    );
  } else {
    console.info("AquaLuz Lab: recursos complementares carregados.");
  }
});
