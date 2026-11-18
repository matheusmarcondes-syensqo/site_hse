const observer = new IntersectionObserver(
    entries => { // Cada elemento observado pelo observer, gera um objeto entry
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible'); // Para cada elemento observado, adiciona a classe 'visible'
                observer.unobserve(entry.target); // observer observa esse elemento apenas uma vez
            }
        });
    },
    {
        threshold: 0.15 // Anima quando 15% do elemento estiver visível
    }
);

document.querySelectorAll('header').forEach(el => observer.observe(el)); // Encontra todos os elementos que possuem a classe 'header', por exemplo
document.querySelectorAll('.welcome-section').forEach(el => observer.observe(el)); // e registra cada um deles no IntersectionObserver
document.querySelectorAll('.links-rapidos').forEach(el => observer.observe(el));
document.querySelectorAll('.programas').forEach(el => observer.observe(el));
document.querySelectorAll('.report').forEach(el => observer.observe(el));
document.querySelectorAll('footer').forEach(el => observer.observe(el));

const CONFIGURACAO_LISTA = {
    siteUrl:
        "https://syensqosa.sharepoint.com/sites/shditatibamanutenodocumentosscop1findustrial",

    nomeLista:
        "P&C_Leadership_Safety_Visit",

    campos: [
        "Id",
        "DATA_E_HORA",
        "NOME",
        "ACOMPANHANTE",
        "SITE",
        "AREA_INSPECIONADA",
        "ATIVIDADE",
        "REGRAS_SALVAM_VIDAS",
        "OBSERVACOES_POSITIVAS",
        "PONTOS_MELHORIA",
        "ACOES"
    ]
};

document.addEventListener("DOMContentLoaded", carregarVisitas);

async function carregarVisitas() {
    const container = document.getElementById("listaVisitas");
    const mensagem = document.getElementById("mensagemLista");
    const contador = document.getElementById("quantidadeVisitas");

    try {
        mensagem.textContent = "Carregando visitas...";
        mensagem.classList.remove("mensagem--erro", "oculto");

        const nomeListaSeguro = CONFIGURACAO_LISTA.nomeLista
            .replaceAll("'", "''");

        const campos = CONFIGURACAO_LISTA.campos.join(",");

        let proximaUrl =
            `${CONFIGURACAO_LISTA.siteUrl}` +
            `/_api/web/lists/getbytitle('${encodeURIComponent(nomeListaSeguro)}')` +
            `/items` +
            `?$select=${campos}` +
            `&$orderby=DATA_E_HORA desc` +
            `&$top=100`;

        const visitas = [];

        while (proximaUrl) {
            const resposta = await fetch(proximaUrl, {
                method: "GET",
                credentials: "same-origin",
                headers: {
                    Accept: "application/json;odata=nometadata"
                }
            });

            if (!resposta.ok) {
                throw new Error(
                    `A consulta retornou o status ${resposta.status}.`
                );
            }

            const dados = await resposta.json();

            visitas.push(...(dados.value ?? []));

            proximaUrl = dados["@odata.nextLink"] ?? null;
        }

        renderizarVisitas(visitas);

        contador.textContent =
            `${visitas.length} ${visitas.length === 1 ? "visita" : "visitas"}`;

        mensagem.classList.add("oculto");
    } catch (erro) {
        console.error("Erro ao carregar a lista:", erro);

        container.replaceChildren();
        contador.textContent = "";

        mensagem.textContent =
            "Não foi possível carregar as visitas. Verifique se você está " +
            "conectado ao SharePoint e se possui permissão para acessar a lista.";

        mensagem.classList.add("mensagem--erro");
        mensagem.classList.remove("oculto");
    }
}

function renderizarVisitas(visitas) {
    const container = document.getElementById("listaVisitas");

    container.replaceChildren();

    if (visitas.length === 0) {
        const mensagemVazia = document.createElement("p");
        mensagemVazia.className = "mensagem";
        mensagemVazia.textContent = "Nenhuma visita encontrada.";

        container.appendChild(mensagemVazia);
        return;
    }

    const fragmento = document.createDocumentFragment();

    visitas.forEach(visita => {
        fragmento.appendChild(criarCardVisita(visita));
    });

    container.appendChild(fragmento);
}

function criarCardVisita(visita) {
    const artigo = document.createElement("article");
    artigo.className = "visita-card";

    const barra = document.createElement("div");
    barra.className = "visita-card__barra";

    const conteudo = document.createElement("div");
    conteudo.className = "visita-card__conteudo";

    const topo = document.createElement("div");
    topo.className = "visita-card__topo";

    const titulo = document.createElement("h3");
    titulo.textContent = obterTexto(
        visita.ATIVIDADE,
        "Atividade não informada"
    );

    const data = document.createElement("time");
    data.className = "visita-card__data";
    data.textContent = formatarData(visita.DATA_E_HORA);

    topo.append(titulo, data);

    conteudo.appendChild(topo);

    conteudo.appendChild(
        criarCampo("Responsável", visita.NOME)
    );

    conteudo.appendChild(
        criarCampo("Acompanhante", visita.ACOMPANHANTE)
    );

    conteudo.appendChild(
        criarCampo("Unidade", visita.SITE)
    );

    conteudo.appendChild(
        criarCampo("Área inspecionada", visita.AREA_INSPECIONADA)
    );

    if (temValor(visita.OBSERVACOES_POSITIVAS)) {
        conteudo.appendChild(
            criarCampo(
                "Observações positivas",
                visita.OBSERVACOES_POSITIVAS
            )
        );
    }

    if (temValor(visita.PONTOS_MELHORIA)) {
        conteudo.appendChild(
            criarCampo(
                "Pontos de melhoria",
                visita.PONTOS_MELHORIA
            )
        );
    }

    if (temValor(visita.ACOES)) {
        conteudo.appendChild(
            criarCampo("Ações", visita.ACOES)
        );
    }

    if (temValor(visita.REGRAS_SALVAM_VIDAS)) {
        const regra = document.createElement("span");
        regra.className = "visita-card__regra";
        regra.textContent = visita.REGRAS_SALVAM_VIDAS;

        conteudo.appendChild(regra);
    }

    artigo.append(barra, conteudo);

    return artigo;
}

function criarCampo(rotulo, valor) {
    const grupo = document.createElement("div");
    grupo.className = "visita-card__campo";

    const elementoRotulo = document.createElement("span");
    elementoRotulo.className = "visita-card__rotulo";
    elementoRotulo.textContent = rotulo;

    const elementoValor = document.createElement("p");
    elementoValor.className = "visita-card__valor";
    elementoValor.textContent = obterTexto(valor, "Não informado");

    grupo.append(elementoRotulo, elementoValor);

    return grupo;
}

function formatarData(valor) {
    if (!valor) {
        return "Data não informada";
    }

    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) {
        return valor;
    }

    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short"
    }).format(data);
}

function temValor(valor) {
    return valor !== null &&
        valor !== undefined &&
        String(valor).trim() !== "";
}

function obterTexto(valor, valorPadrao) {
    return temValor(valor) ? String(valor).trim() : valorPadrao;
}