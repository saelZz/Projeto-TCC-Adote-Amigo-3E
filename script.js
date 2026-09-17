// ==========================================================================
// PARTE BANCO DE DADOS (REDE ADOTE AMIGO)
// ==========================================================================
const bancoDeDadosPets = {
    "1": { 
        nome: "Helke", 
        idade: "3 anos", 
        porte: "Border Collie", 
        bairro: "Mooca", 
        localRetirada: "Adote Amigo - Unidade Mooca", 
        enderecoSimulado: "Rua Borges de Figueiredo, 500", 
        referencia: "Unidade Mooca — Próximo à Estação Juventus-Mooca", 
        historia: "Helke é uma fêmea de Border Collie super inteligente. É ativa, carinhosa, se dá muito bem com crianças e adora aprender novos truques.", 
        imagem: "imagens/pet1.jpg",
        imagem2: "imagens/pet1.jpg"
    },
    "2": { 
        nome: "Mel", 
        idade: "5 anos", 
        porte: "Basset Hound", 
        bairro: "Bandeirantes", 
        localRetirada: "Adote Amigo - Unidade Bandeirantes", 
        enderecoSimulado: "Avenida Nazaré, 1200", 
        referencia: "Unidade Bandeirantes — Próximo ao Museu do Ipiranga", 
        historia: "Mel é uma companheira fantástica da raça Basset Hound. É muito dócil, calma, adora tirar sonecas e convive muito bem com outros cães.", 
        imagem: "imagens/pet2.jpg",
        imagem2: "imagens/pet2.jpg"
    },
    "3": { 
        nome: "Pipoca", 
        idade: "2 anos", 
        porte: "Vira-lata (SRD)", 
        bairro: "Tatuape", 
        localRetirada: "Adote Amigo - Unidade Tatuapé", 
        enderecoSimulado: "Rua Tuiuti, 1800", 
        referencia: "Unidade Tatuapé — Em frente ao Parque do Piqueri", 
        historia: "Pipoca é uma fêmea vira-lata cheia de carisma. Super dócil, companheira e brincalhona, procura um lar amoroso para compartilhar alegria.", 
        imagem: "imagens/pet3.jpg",
        imagem2: "imagens/pet3.jpg"
    },
    "4": { 
        nome: "Fredd", 
        idade: "6 anos", 
        porte: "Pastor Alemão", 
        bairro: "Mooca", 
        localRetirada: "Adote Amigo - Unidade Mooca", 
        enderecoSimulado: "Rua dos Trilhos, 900", 
        referencia: "Unidade Mooca — Esquina com a UNIP Campus Mooca", 
        historia: "Fredd é um Pastor Alemão macho imponente e extremamente leal. Muito inteligente, obediente e excelente protetor para a família.", 
        imagem: "imagens/pet4.jpg",
        imagem2: "imagens/pet4.jpg"
    },
    "5": { 
        nome: "Bidu", 
        idade: "4 anos", 
        porte: "Shih Tzu", 
        bairro: "Santana", 
        localRetirada: "Adote Amigo - Unidade Santana", 
        enderecoSimulado: "Avenida Cruzeiro do Sul, 2500", 
        referencia: "Unidade Santana — Ao lado do Parque da Juventude", 
        historia: "Bidu é um Shih Tzu macho dócil e companheiro. Perfeito para quem mora em apartamento, adora um colinho e passeios tranquilos.", 
        imagem: "imagens/pet5.jpg",
        imagem2: "imagens/pet5.jpg"
    }
};

// ==========================================================================
// VARIÁVEIS E FUNÇÕES DO CARROSSEL DE IMAGENS
// ==========================================================================
const carousel = document.querySelector(".carousel");
const slides = document.querySelector(".slides");
const slide = document.querySelectorAll(".slide");
const indicators = document.querySelectorAll(".indicator");
const modal = document.getElementById("modal-adocao");
const btnFechar = document.querySelector(".close-modal");
const formAdocao = document.getElementById("form-adocao");

let index = 0;
let isDragging = false;
let startX = 0;
let currentTranslate = 0;
let prevTranslate = 0;

function mostrarSlide() {
    if (!carousel || !slides) return;
    const larguraReal = carousel.clientWidth;
    currentTranslate = -index * larguraReal;
    prevTranslate = currentTranslate;
    
    slides.style.transition = 'transform 0.5s ease-in-out';
    slides.style.transform = `translateX(${currentTranslate}px)`;
    
    if (indicators.length > 0) {
        indicators.forEach((indicator, idx) => {
            if (idx === index) indicator.classList.add("active");
            else indicator.classList.remove("active");
        });
    }
}

// ==========================================================================
// FAQ, HASH E LÓGICA EM CADEIA DOS FILTROS
// ==========================================================================
document.addEventListener("DOMContentLoaded", function () {
    
    const perguntas = document.querySelectorAll(".faq-question");
    perguntas.forEach(function (pergunta) {
        pergunta.addEventListener("click", function () {
            const item = this.parentElement;
            document.querySelectorAll(".faq-item").forEach(function (faq) {
                if (faq !== item) faq.classList.remove("active");
            });
            item.classList.toggle("active");
        });
    });

    const hash = window.location.hash;
    if (hash) {
        const alvo = document.querySelector(hash);
        if (alvo) {
            alvo.classList.add("active");
            setTimeout(() => { alvo.scrollIntoView({ behavior: "smooth", block: "center" }); }, 300);
        }
    }

    const selectEstado = document.getElementById("filtro-estado");
    const selectCidade = document.getElementById("filtro-cidade");
    const selectBairro = document.getElementById("filtro-bairro");
    const btnLimpar = document.querySelector(".btn-limpar-filtros");
    const todosOsCards = document.querySelectorAll(".pet-card");

    if (selectEstado && selectCidade && selectBairro) {
        
        selectEstado.addEventListener("change", function() {
            const estadoSelecionado = selectEstado.value;

            if (estadoSelecionado === "SP") {
                selectCidade.innerHTML = `
                    <option value="">Selecione</option>
                    <option value="Sao Paulo">São Paulo</option>
                `;
            } else if (estadoSelecionado === "RJ") {
                selectCidade.innerHTML = `
                    <option value="">Selecione</option>
                    <option value="Rio de Janeiro">Rio de Janeiro</option>
                `;
            } else {
                selectCidade.innerHTML = `<option value="">Selecione</option>`;
            }
            
            selectBairro.innerHTML = `<option value="">Selecione</option>`;
            aplicarFiltros();
        });

        selectCidade.addEventListener("change", function() {
            const cidadeSelecionada = selectCidade.value;

            if (cidadeSelecionada === "Sao Paulo") {
                selectBairro.innerHTML = `
                    <option value="">Selecione</option>
                    <option value="Mooca">Unidade Mooca</option>
                    <option value="Bandeirantes">Unidade Bandeirantes</option>
                    <option value="Tatuape">Unidade Tatuapé</option>
                    <option value="Santana">Unidade Santana</option>
                `;
            } else if (cidadeSelecionada === "Rio de Janeiro") {
                selectBairro.innerHTML = `
                    <option value="">Selecione</option>
                    <option value="Copacabana">Unidade Copacabana</option>
                `;
            } else {
                selectBairro.innerHTML = `<option value="">Selecione</option>`;
            }
            
            aplicarFiltros();
        });

        selectBairro.addEventListener("change", aplicarFiltros);
    }

    function normalizarTexto(texto) {
        if (!texto) return "";
        return texto.toString()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .toLowerCase()
                    .trim();
    }

    function aplicarFiltros() {
        const estadoSelecionado = normalizarTexto(selectEstado.value);
        const cidadeSelecionada = normalizarTexto(selectCidade.value);
        const bairroSelecionado = normalizarTexto(selectBairro.value);

        todosOsCards.forEach(function (card) {
            const petEstado = normalizarTexto(card.getAttribute("data-estado"));
            const petCidade = normalizarTexto(card.getAttribute("data-cidade"));
            const petBairro = normalizarTexto(card.getAttribute("data-bairro"));

            const bateEstado = estadoSelecionado === "" || petEstado === estadoSelecionado;
            const bateCidade = cidadeSelecionada === "" || petCidade === cidadeSelecionada;
            const bateBairro = bairroSelecionado === "" || petBairro === bairroSelecionado;

            if (bateEstado && bateCidade && bateBairro) {
                card.style.setProperty('display', 'flex', 'important'); 
            } else {
                card.style.setProperty('display', 'none', 'important'); 
            }
        });
    }

    if (btnLimpar) {
        btnLimpar.addEventListener("click", function () {
            selectEstado.value = "";
            selectCidade.innerHTML = `<option value="">Selecione</option>`;
            selectBairro.innerHTML = `<option value="">Selecione</option>`;
            
            todosOsCards.forEach(function (card) {
                card.style.setProperty('display', 'flex', 'important');
            });
        });
    }

    // ==========================================================================
// INJEÇÃO DO MODAL DE DUAS COLUNAS, DRAG E MULTI-PASSO
// ==========================================================================
    document.querySelectorAll(".btn-adotar-card").forEach(botao => {
        botao.addEventListener("click", function(e) {
            e.preventDefault();
            const card = botao.closest(".pet-card");
            if (!card) return;

            const petId = card.getAttribute("data-id");
            const petInfo = bancoDeDadosPets[petId];

            if (petInfo) {
                const modalConteudo = document.querySelector(".modal-conteudo");
                if (modalConteudo) {
                    modalConteudo.className = "modal-conteudo modal-conteudo-pet";
                    modalConteudo.innerHTML = `
                        <span class="close-modal">&times;</span>
                        <div class="modal-col-esquerda">
                            <div class="modal-wrapper-fotos">
                                <img id="modal-pet-img-grande" class="modal-foto-grande" src="${petInfo.imagem}" alt="${petInfo.nome}">
                            </div>
                            <div class="modal-galeria-miniaturas">
                                <img class="modal-foto-miniatura ativa" src="${petInfo.imagem}" alt="Ângulo 1" onclick="document.getElementById('modal-pet-img-grande').src='${petInfo.imagem}'; document.querySelectorAll('.modal-foto-miniatura').forEach(i=>i.classList.remove('ativa')); this.classList.add('ativa');">
                                <img class="modal-foto-miniatura" src="${petInfo.imagem2 || petInfo.imagem}" alt="Ângulo 2" onclick="document.getElementById('modal-pet-img-grande').src='${petInfo.imagem2 || petInfo.imagem}'; document.querySelectorAll('.modal-foto-miniatura').forEach(i=>i.classList.remove('ativa')); this.classList.add('ativa');">
                            </div>
                            <div class="modal-grid-badges">
                                <span class="badge-pet">💉 Vacinado</span>
                                <span class="badge-pet">✂️ Castrado</span>
                                <span class="badge-pet">🏠 Vermifugado</span>
                            </div>
                        </div>
                        <div class="modal-col-direita">
                            <div class="modal-pet-info-topo">
                                <h2 class="pet-nome-titulo">
                                    ${petInfo.nome} 
                                    <span class="gender-icon ${card.querySelector('.gender-badge')?.classList.contains('fêmea') || card.querySelector('.gender-icon')?.classList.contains('fêmea') ? 'fêmea' : ''}">${card.querySelector('.gender-badge')?.textContent || card.querySelector('.gender-icon')?.textContent || '♂'}</span>
                                </h2>
                                <div class="modal-pet-tags">
                                    <span class="pet-tag tag-raca">${petInfo.porte}</span>
                                    <span class="pet-tag tag-idade">${petInfo.idade}</span>
                                </div>
                            </div>
                            <div class="modal-texto-historia">
                                <p>${petInfo.historia}</p>
                            </div>
                            <div class="box-localizacao-unidade">
                                <h4>📍 Onde encontrar o pet:</h4>
                                <p><strong>Unidade:</strong> ${petInfo.localRetirada}</p>
                                <p><strong>Endereço:</strong> ${petInfo.enderecoSimulado}</p>
                                <em>Ponto de referência: ${petInfo.referencia}</em>
                            </div>
                            <button class="btn-avancar-adocao">Iniciar Processo de Adoção ❤️</button>
                        </div>
                    `;

                    modalConteudo.querySelector(".close-modal").addEventListener("click", () => {
                        if (modal) modal.style.display = "none";
                    });

                    modalConteudo.querySelector(".btn-avancar-adocao").addEventListener("click", (evt) => {
                        evt.preventDefault();
                        localStorage.setItem("petSelecionadoNome", petInfo.nome);
                        localStorage.setItem("petSelecionadoImg", petInfo.imagem);
                        window.location.href = "formulario.html";
                    });
                }
                if (modal) modal.style.display = "flex";
            }
        });
    });

    if (btnFechar) {
        btnFechar.addEventListener("click", () => {
            if (modal) modal.style.display = "none";
        });
    }

    window.addEventListener("click", (e) => {
        if (modal && e.target === modal) modal.style.display = "none";
    });

    if (formAdocao) {
        formAdocao.addEventListener("submit", (e) => {
            e.preventDefault();
            alert("Parabéns! Sua intenção de adoção foi registrada com sucesso! 🎉");
            if (modal) modal.style.display = "none";
        });
    }

    const nextBtn = document.querySelector(".next");
    const prevBtn = document.querySelector(".prev");

    if (nextBtn) nextBtn.addEventListener("click", () => { index = (index + 1) % slide.length; mostrarSlide(); });
    if (prevBtn) prevBtn.addEventListener("click", () => { index = (index - 1 + slide.length) % slide.length; mostrarSlide(); });

    if (indicators.length > 0) {
        indicators.forEach((indicator, idx) => {
            indicator.addEventListener("click", () => { index = idx; mostrarSlide(); });
        });
    }

    if (carousel && slide.length > 0) {
        let autoSlide = setInterval(() => {
            index = (index + 1) % slide.length;
            mostrarSlide();
        }, 6000);

        function resetAutoSlide() {
            clearInterval(autoSlide);
            autoSlide = setInterval(() => {
                index = (index + 1) % slide.length;
                mostrarSlide();
            }, 6000);
        }
        
        carousel.addEventListener("mousedown", dragStart);
        carousel.addEventListener("mousemove", dragMove);
        carousel.addEventListener("mouseup", dragEnd);
        carousel.addEventListener("mouseleave", dragEnd);
        carousel.addEventListener("touchstart", dragStart, { passive: true });
        carousel.addEventListener("touchmove", dragMove, { passive: true });
        carousel.addEventListener("touchend", dragEnd);

        function dragStart(e) {
            isDragging = true;
            startX = e.type.includes('touch') ? e.touches[0].clientX : e.pageX;
            resetAutoSlide();
            slides.style.transition = 'none';
        }

        function dragMove(e) {
            if (!isDragging) return;
            const currentX = e.type.includes('touch') ? e.touches[0].clientX : e.pageX;
            const diffX = currentX - startX;
            slides.style.transform = `translateX(${prevTranslate + diffX}px)`;
        }

        function dragEnd(e) {
            if (!isDragging) return;
            isDragging = false;
            const endX = e.type.includes('touch') ? (e.changedTouches ? e.changedTouches[0].clientX : startX) : e.pageX;
            const diffX = endX - startX;

            if (diffX < -80 && index < slide.length - 1) {
                index++;
            } else if (diffX > 80 && index > 0) {
                index--;
            }
            mostrarSlide();
        }
    }

    window.addEventListener('resize', mostrarSlide);
    window.addEventListener('load', mostrarSlide);

    const modalEstado = document.getElementById("modal-estado");
    const modalCidade = document.getElementById("modal-cidade");
    const btnPasso1 = document.getElementById("btn-passo-1");
    const formMulti = document.getElementById("form-multi-passos");

    if (modalEstado && modalCidade) {
        modalEstado.addEventListener("change", function() {
            if (modalEstado.value === "SP") {
                modalCidade.innerHTML = `
                    <option value="">Escolha a cidade</option>
                    <option value="Sao Paulo">São Paulo</option>
                `;
                modalCidade.disabled = false;
            } else if (modalEstado.value === "RJ") {
                modalCidade.innerHTML = `
                    <option value="">Escolha a cidade</option>
                    <option value="Rio de Janeiro">Rio de Janeiro</option>
                `;
                modalCidade.disabled = false;
            } else {
                modalCidade.innerHTML = `<option value="">Escolha a cidade</option>`;
                modalCidade.disabled = true;
                btnPasso1.disabled = true;
            }
        });

        modalCidade.addEventListener("change", function() {
            btnPasso1.disabled = modalCidade.value === "";
        });
    }

    function irParaPasso(numero) {
        document.querySelectorAll(".passo-form").forEach(p => p.classList.remove("ativo"));
        setTimeout(() => {
            const proximo = document.getElementById(`passo-${numero}`);
            if (proximo) proximo.classList.add("ativo");
        }, 10);

        document.getElementById("numero-passo").textContent = numero;
        document.querySelectorAll(".circulo-passo").forEach(c => {
            const passoCirculo = parseInt(c.getAttribute("data-passo"));
            if (passoCirculo <= numero) c.classList.add("ativo");
            else c.classList.remove("ativo");
        });
    }

    document.getElementById("btn-passo-1")?.addEventListener("click", () => irParaPasso(2));
    document.getElementById("btn-passo-2")?.addEventListener("click", () => irParaPasso(3));
    document.getElementById("btn-passo-3")?.addEventListener("click", () => irParaPasso(4));

    formMulti?.addEventListener("submit", function(e) {
        e.preventDefault();
        irParaPasso(5);
    });
});