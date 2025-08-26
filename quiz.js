function embaralhar(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Extrai "(p. xx)" ou "(p. xx-yy)" do texto
function extrairPagina(texto) {
  const match = texto.match(/\(p\. ?\d+(-\d+)?\)/);
  return match ? match[0] : "";
}

// Remove o número de página do texto
function removerPagina(texto) {
  return texto.replace(/\s*\(p\. ?\d+(-\d+)?\)/, "");
}

// Modos disponíveis
const modos = {
  historia: "Quiz na ordem do livro",
  aleatoria: "Quiz de perguntas aleatórias"
};

// Recupera modo escolhido, padrão: historia
const categoria = localStorage.getItem('categoria') || "historia";
document.getElementById('categoria-titulo').textContent = modos[categoria] || modos.historia;

// Sempre carrega perguntas do array 'historia'
let perguntas = window.quizData && window.quizData["historia"] ? window.quizData["historia"].slice() : [];

let perguntasUsadas = JSON.parse(localStorage.getItem('perguntas_usadas') || "[]");
let score = parseInt(localStorage.getItem('score') || "0");
let perguntasVisualizadas = parseInt(localStorage.getItem('perguntas_visualizadas') || "0");

// Protege contra array vazio
if (!perguntas || perguntas.length === 0) {
  document.getElementById('pergunta').textContent = "Nenhuma pergunta disponível!";
  document.getElementById('contador').textContent = "";
  document.getElementById('next-btn').style.display = "none";
  document.getElementById('restart-btn').style.display = "";
} else {
  // Embaralha para modo aleatório
  if (categoria === "aleatoria") perguntas = embaralhar(perguntas);

  // Verifica se acabou as perguntas
  if (perguntasVisualizadas >= perguntas.length) {
    document.getElementById('pergunta').textContent = "Fim do quiz! Seu score: " + score;
    document.getElementById('contador').textContent = `Perguntas respondidas: ${perguntasVisualizadas} | Score: ${score}`;
    document.getElementById('next-btn').style.display = "none";
    document.getElementById('restart-btn').style.display = "";
  } else {
    let perguntaAtual = perguntas[perguntasVisualizadas];

    // Exibe contador e score
    document.getElementById('contador').textContent = `Pergunta ${perguntasVisualizadas + 1} | Score: ${score}`;

    // Exibe pergunta
    document.getElementById('pergunta').textContent = perguntaAtual.pergunta;

    // Monta alternativas embaralhadas, removendo o número da página da correta
    const alternativas = embaralhar([
      removerPagina(perguntaAtual.correta),
      ...perguntaAtual.alternativas
    ]);
    const respostasDiv = document.getElementById('respostas');
    respostasDiv.innerHTML = "";
    document.getElementById('fonte').innerHTML = "";
    document.getElementById('next-btn').style.display = "none";
    document.getElementById('restart-btn').style.display = "";

    alternativas.forEach(alternativa => {
      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.textContent = alternativa;
      btn.onclick = () => {
        document.querySelectorAll('.answer-btn').forEach(b => b.disabled = true);
        const pagina = extrairPagina(perguntaAtual.correta);
        const respostaCorretaSemPagina = removerPagina(perguntaAtual.correta);
        if (alternativa === respostaCorretaSemPagina) {
          btn.style.background = "#8EB69B";
          btn.style.color = "#fff";
          document.getElementById('fonte').innerHTML =
            `✅ Correta! ${pagina}`;
          score++;
          localStorage.setItem('score', score);
        } else {
          btn.style.background = "#f8d7da";
          btn.style.color = "#721c24";
          document.getElementById('fonte').innerHTML =
            `❌ Incorreta! ${pagina}`;
        }
        document.getElementById('contador').textContent =
          `Pergunta ${perguntasVisualizadas + 1} | Score: ${score}`;
        document.getElementById('next-btn').style.display = '';
        // Marca pergunta como usada
        perguntasUsadas.push(perguntaAtual.pergunta);
        localStorage.setItem('perguntas_usadas', JSON.stringify(perguntasUsadas));
      };
      respostasDiv.appendChild(btn);
    });

    // Botão próxima pergunta
    document.getElementById('next-btn').onclick = () => {
      perguntasVisualizadas++;
      localStorage.setItem('perguntas_visualizadas', perguntasVisualizadas);
      window.location.reload();
    };
  }
}

// Botão reiniciar quiz
document.getElementById('restart-btn').onclick = () => {
  localStorage.removeItem('perguntas_usadas');
  localStorage.removeItem('score');
  localStorage.removeItem('perguntas_visualizadas');
  localStorage.removeItem('categoria');
  window.location.href = 'inicio.html';
};