const bancoDeDadosPets = {
    "1": { nome: "Helke", idade: "3 anos", porte: "Border Collie", bairro: "Mooca", localRetirada: "ONG Patas Unidas - Unidade Mooca", enderecoSimulado: "Rua Borges de Figueiredo, 500", referencia: "A 5 minutos da Estação Juventus-Mooca", historia: "Helke é uma fêmea de Border Collie super inteligente. É ativa, carinhosa, se dá muito bem com crianças e adora aprender novos truques.", imagem: "imagens/pet1.jpg" },
    "2": { nome: "Mel", idade: "5 anos", porte: "Basset Hound", bairro: "Ipiranga", localRetirada: "Abrigo Miados de Amor", enderecoSimulado: "Avenida Nazaré, 1200", referencia: "Próximo à entrada do Museu do Ipiranga", historia: "Abherta é um companheiro macho da raça Basset Hound. É muito dócil, calmo, adora tirar sonecas e convive muito bem com outros cães.", imagem: "imagens/pet2.jpg" },
    "3": { nome: "Pipoca", idade: "2 anos", porte: "Vira-lata (SRD)", bairro: "Tatuapé", localRetirada: "Petz Tatuapé (Ponto de Adoção)", enderecoSimulado: "Rua Tuiuti, 1800", referencia: "Em frente ao Parque do Piqueri", historia: "Pipoca é uma fêmea vira-lata cheia de carisma. Super dócil, companheira e brincalhona, procura um lar amoroso para compartilhar alegria.", imagem: "imagens/pet3.jpg" },
    "4": { nome: "Fredd", idade: "6 anos", porte: "Pastor Alemão", bairro: "Mooca", localRetirada: "Clínica Veterinária Comunitária", enderecoSimulado: "Rua dos Trilhos, 900", referencia: "Esquina com a UNIP Campus Mooca", historia: "Fredd é um Pastor Alemão macho imponente e extremamente leal. Muito inteligente, obedient e excelente protetor para a família.", imagem: "imagens/pet4.jpg" },
    "5": { nome: "Bidu", idade: "4 anos", porte: "Shih Tzu", bairro: "Santana", localRetirada: "ONG Amigo dos Bichos", enderecoSimulado: "Avenida Cruzeiro do Sul, 2500", referencia: "Ao lado do Parque da Juventude", historia: "Bidu é um Shih Tzu macho dócil e companheiro. Perfeito para quem mora em apartamento, adora um colinho e passeios tranquilos.", imagem: "imagens/pet5.jpg" }
};

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
                    <option value="Campinas">Campinas</option>
                `;
            } else if (estadoSelecionado === "RJ") {
                selectCidade.innerHTML = `
                    <option value="">Selecione</option>
                    <option value="Angra dos Reis">Angra dos Reis</option>
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
                    <option value="Mooca">Mooca</option>
                    <option value="Bandeirantes">Bandeirantes</option>
                    <option value="Tatuape">Tatuapé</option>
                    <option value="Vila Mariana">Vila Mariana</option>
                `;

            } else if (cidadeSelecionada === "Campinas") {
                selectBairro.innerHTML = `
                    <option value="">Selecione</option>
                    <option value="Cambuí">Cambuí</option>
                `;

             } else if (cidadeSelecionada === "Rio de Janeiro") {
                selectBairro.innerHTML = `
                    <option value="">Selecione</option>
                    <option value="Copacabana">Copacabana</option>
                `;

            } else if (cidadeSelecionada === "Angra dos Reis") {
                selectBairro.innerHTML = `
                    <option value="">Selecione</option>
                    <option value="Enseada">Enseada</option>
                    <option value="Centro">Centro</option>
                `;
            } else {
                selectBairro.innerHTML = `<option value="">Selecione</option>`;
            }
            
            aplicarFiltros();
        });

        selectBairro.addEventListener("change", aplicarFiltros);
    }

    function aplicarFiltros() {
        const estadoSelecionado = selectEstado.value;
        const cidadeSelecionada = selectCidade.value;
        const bairroSelecionado = selectBairro.value;

        todosOsCards.forEach(function (card) {
            const petEstado = card.getAttribute("data-estado");
            const petCidade = card.getAttribute("data-cidade");
            const petBairro = card.getAttribute("data-bairro");

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
document.querySelectorAll(".pet-card").forEach(card => {
    const btn = card.querySelector(".btn-adotar-card");
    if (btn) {
        btn.addEventListener("click", () => {
            const petId = card.getAttribute("data-id");
            const petInfo = bancoDeDadosPets[petId];

            if (petInfo) {
                const imgEl = document.getElementById("modal-pet-img");
                const nomeEl = document.getElementById("modal-pet-nome");
                const idadeEl = document.getElementById("modal-pet-idade");
                const porteEl = document.getElementById("modal-pet-porte");
                const historiaEl = document.getElementById("modal-pet-historia");

                if (imgEl) imgEl.src = petInfo.imagem;
                if (nomeEl) nomeEl.innerText = petInfo.nome;
                if (idadeEl) idadeEl.innerText = petInfo.idade;
                if (porteEl) porteEl.innerText = petInfo.porte;
                if (historiaEl) historiaEl.innerText = petInfo.historia;

                const localDiv = document.getElementById("modal-pet-localizacao");
                if (localDiv) {
                    localDiv.innerHTML = `
                        <div style="background: #f4f6fa; padding: 15px; border-radius: 12px; margin-top: 15px; border-left: 4px solid #ff8a00;">
                            <h4 style="color: #222; margin-bottom: 5px; font-size: 14px;">📍 Onde encontrar o pet:</h4>
                            <p style="font-size: 13px; color: #444; margin-bottom: 2px;"><strong>Local:</strong> ${petInfo.localRetirada}</p>
                            <p style="font-size: 13px; color: #444; margin-bottom: 2px;"><strong>Endereço:</strong> ${petInfo.enderecoSimulado}</p>
                            <p style="font-size: 12px; color: #777; margin-top: 4px;"><em>Ponto de referência: ${petInfo.referencia}</em></p>
                        </div>
                    `;
                }
                if (modal) modal.style.display = "flex";
            }
        });
    }
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
        alert("Parabéns! Sua intenção de adoção foi registrada com sucesso de forma ilustrativa! 🎉");
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
    }, 60000);

    function resetAutoSlide() {
        clearInterval(autoSlide);
        autoSlide = setInterval(() => {
            index = (index + 1) % slide.length;
            mostrarSlide();
        }, 60000);
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

});