// ==========================================================================
// 1. CONFIGURAÇÃO E CONEXÃO COM O FIREBASE
// ==========================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAHrvVJPyqPIJHZxFfHZC8ZpfPpyQQYq5U",
    authDomain: "projeto-tcc-adote-amigo-65d99.firebaseapp.com",
    projectId: "projeto-tcc-adote-amigo-65d99",
    storageBucket: "projeto-tcc-adote-amigo-65d99.firebasestorage.app",
    messagingSenderId: "1055512647057",
    appId: "1:1055512647057:web:298f17670dad0643637630"
};

let app = null;
let db = null;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
} catch (error) {
    console.warn("Aviso: Erro ao conectar ao Firebase. O layout continuará funcional.", error);
}

let bancoDeDadosPets = {};

// ==========================================================================
// 2. UTILITÁRIOS
// ==========================================================================
function normalizarTexto(texto) {
    if (!texto) return "";
    return texto
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function fecharModal(modal) {
    if (modal) {
        modal.style.display = "none";
    }
}

// ==========================================================================
// 3. BUSCA E RENDERIZAÇÃO DINÂMICA DE PETS (FIRESTORE)
// ==========================================================================
async function carregarPetsDoFirestore() {
    const petsGrid = document.getElementById("pets-grid");
    if (!petsGrid) return;

    if (!db) {
        petsGrid.innerHTML = "<p>Nenhum pet carregado no momento (modo offline).</p>";
        return;
    }

    try {
        const querySnapshot = await getDocs(collection(db, "pets"));
        petsGrid.innerHTML = ""; 
        bancoDeDadosPets = {};   

        if (querySnapshot.empty) {
            petsGrid.innerHTML = "<p>Nenhum pet cadastrado no momento.</p>";
            return;
        }

        const cardsHTML = [];

        querySnapshot.forEach((docSnapshot) => {
            const pet = docSnapshot.data();
            const petId = docSnapshot.id;

            bancoDeDadosPets[petId] = { id: petId, ...pet };

            const sexoPet = (pet.sexo || "").toLowerCase();
            const isFemea = sexoPet === "femea" || sexoPet === "fêmea";
            const mensagemWhatsapp = encodeURIComponent(
                `Olá! Vi o(a) ${pet.nome} no portal Adote Amigo e gostaria de saber mais sobre a adoção.`
            );
            const linkWhatsapp = pet.ong_whatsapp ? `https://wa.me/${pet.ong_whatsapp}?text=${mensagemWhatsapp}` : "#";

            cardsHTML.push(`
                <div class="pet-card" data-id="${petId}" data-estado="${pet.estado || ''}" data-cidade="${pet.cidade || ''}" data-bairro="${pet.bairro || ''}">
                    <div class="card-image" style="border-radius: 16px 16px 0 0; overflow: hidden;">
                        <img src="${pet.foto_url || pet.imagem || 'imagens/logo.png'}" alt="${pet.nome}" draggable="false" style="border-radius: 16px 16px 0 0; transition: transform 0.5s ease;">
                    </div>
                    <div class="pet-info">
                        <div class="pet-header">
                            <h3>${pet.nome}</h3>
                            <span class="gender-badge ${isFemea ? 'fêmea' : ''}">${isFemea ? '♀' : '♂'}</span>
                        </div>
                        <div class="pet-tags-container">
                            <span class="pet-tag tag-raca">${pet.raca || pet.porte || 'SRD'}</span>
                            <span class="pet-tag tag-idade">${pet.idade || 'Idade N/I'}</span>
                        </div>
                        <p class="pet-details">${pet.bairro || ''}, ${pet.cidade || ''}, ${pet.estado || ''}</p>
                        <p class="pet-ponto-ref">📍 ${pet.ong_nome || pet.localRetirada || 'Unidade de Adoção'}</p>
                        <a href="${linkWhatsapp}" target="_blank" rel="noopener noreferrer" class="btn-adotar-card">
                            Quero Adotar (WhatsApp)
                        </a>
                    </div>
                </div>
            `);
        });

        petsGrid.innerHTML = cardsHTML.join("");

    } catch (error) {
        console.error("Erro ao carregar os pets do Firestore:", error);
        petsGrid.innerHTML = "<p>Erro ao carregar a lista de pets. Tente novamente mais tarde.</p>";
    }
}

// ==========================================================================
// 4. CARROSSEL DE IMAGENS
// ==========================================================================
let carouselIndex = 0;
let isDragging = false;
let startX = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let autoSlideInterval = null;

function mostrarSlide(carousel, slides, slide, indicators) {
    if (!carousel || !slides) return;

    const larguraReal = carousel.clientWidth;
    currentTranslate = -carouselIndex * larguraReal;
    prevTranslate = currentTranslate;
    
    slides.style.transition = 'transform 0.5s ease-in-out';
    slides.style.transform = `translateX(${currentTranslate}px)`;
    
    indicators.forEach((indicator, idx) => {
        indicator.classList.toggle("active", idx === carouselIndex);
    });
}

function inicializarCarrossel() {
    const carousel = document.querySelector(".carousel");
    const slides = document.querySelector(".slides");
    const slide = document.querySelectorAll(".slide");
    const indicators = document.querySelectorAll(".indicator");
    const nextBtn = document.querySelector(".next");
    const prevBtn = document.querySelector(".prev");

    if (!carousel || !slides || slide.length === 0) return;

    const proximoSlide = () => {
        carouselIndex = (carouselIndex + 1) % slide.length;
        mostrarSlide(carousel, slides, slide, indicators);
    };

    const slideAnterior = () => {
        carouselIndex = (carouselIndex - 1 + slide.length) % slide.length;
        mostrarSlide(carousel, slides, slide, indicators);
    };

    const iniciarAutoSlide = () => {
        clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(proximoSlide, 6000);
    };

    nextBtn?.addEventListener("click", () => { proximoSlide(); iniciarAutoSlide(); });
    prevBtn?.addEventListener("click", () => { slideAnterior(); iniciarAutoSlide(); });

    indicators.forEach((indicator, idx) => {
        indicator.addEventListener("click", () => {
            carouselIndex = idx;
            mostrarSlide(carousel, slides, slide, indicators);
            iniciarAutoSlide();
        });
    });

    function dragStart(e) {
        isDragging = true;
        startX = e.type.includes('touch') ? e.touches[0].clientX : e.pageX;
        iniciarAutoSlide();
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

        if (diffX < -80 && carouselIndex < slide.length - 1) {
            carouselIndex++;
        } else if (diffX > 80 && carouselIndex > 0) {
            carouselIndex--;
        }
        mostrarSlide(carousel, slides, slide, indicators);
    }

    carousel.addEventListener("mousedown", dragStart);
    carousel.addEventListener("mousemove", dragMove);
    carousel.addEventListener("mouseup", dragEnd);
    carousel.addEventListener("mouseleave", dragEnd);

    carousel.addEventListener("touchstart", dragStart, { passive: true });
    carousel.addEventListener("touchmove", dragMove, { passive: true });
    carousel.addEventListener("touchend", dragEnd);

    window.addEventListener('resize', () => mostrarSlide(carousel, slides, slide, indicators));
    window.addEventListener('load', () => mostrarSlide(carousel, slides, slide, indicators));

    iniciarAutoSlide();
}

// ==========================================================================
// 5. INICIALIZAÇÃO E EVENTOS DOM
// ==========================================================================
document.addEventListener("DOMContentLoaded", async function () {

    // ----------------------------------------------------------------------
    // A. ANIMAÇÃO DE REVELAÇÃO (.reveal) - IntersectionObserver Otimizado
    // ----------------------------------------------------------------------
    const elements = document.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window)) {
        elements.forEach(function (el) { el.classList.add("is-visible", "active"); });
    } else {
        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible", "active");
                        observer.unobserve(entry.target); // anima apenas uma vez
                    }
                });
            },
            { threshold: 0.14 } // dispara quando ~14% do elemento aparece
        );

        elements.forEach(function (el) { observer.observe(el); });
    }

    // Fallback de segurança para garantir exibição
    setTimeout(() => {
        elements.forEach((el) => el.classList.add("is-visible", "active"));
    }, 600);

    // ----------------------------------------------------------------------
    // B. CARREGAMENTO DOS PETS DO FIRESTORE
    // ----------------------------------------------------------------------
    await carregarPetsDoFirestore();

    // ----------------------------------------------------------------------
    // C. FAQ ACCORDION
    // ----------------------------------------------------------------------
    const perguntas = document.querySelectorAll(".faq-question");
    perguntas.forEach((pergunta) => {
        pergunta.addEventListener("click", function () {
            const itemAtual = this.parentElement;
            document.querySelectorAll(".faq-item").forEach((faq) => {
                if (faq !== itemAtual) faq.classList.remove("active");
            });
            itemAtual.classList.toggle("active");
        });
    });

    // ----------------------------------------------------------------------
    // D. ROLAGEM POR HASH VIA URL
    // ----------------------------------------------------------------------
    const { hash } = window.location;
    if (hash) {
        const alvo = document.querySelector(hash);
        if (alvo) {
            alvo.classList.add("active", "is-visible");
            setTimeout(() => {
                alvo.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 300);
        }
    }

    // ----------------------------------------------------------------------
    // E. LÓGICA DE FILTROS ENCADEADOS
    // ----------------------------------------------------------------------
    const selectEstado = document.getElementById("filtro-estado");
    const selectCidade = document.getElementById("filtro-cidade");
    const selectBairro = document.getElementById("filtro-bairro");
    const btnLimpar = document.querySelector(".btn-limpar-filtros");

    function aplicarFiltros() {
        const todosOsCards = document.querySelectorAll(".pet-card");
        const estadoSelecionado = normalizarTexto(selectEstado?.value);
        const cidadeSelecionada = normalizarTexto(selectCidade?.value);
        const bairroSelecionado = normalizarTexto(selectBairro?.value);

        todosOsCards.forEach((card) => {
            const petEstado = normalizarTexto(card.getAttribute("data-estado"));
            const petCidade = normalizarTexto(card.getAttribute("data-cidade"));
            const petBairro = normalizarTexto(card.getAttribute("data-bairro"));

            const bateEstado = !estadoSelecionado || petEstado === estadoSelecionado;
            const bateCidade = !cidadeSelecionada || petCidade === cidadeSelecionada;
            const bateBairro = !bairroSelecionado || petBairro === bairroSelecionado;

            if (bateEstado && bateCidade && bateBairro) {
                card.style.setProperty('display', 'flex', 'important'); 
            } else {
                card.style.setProperty('display', 'none', 'important'); 
            }
        });
    }

    if (selectEstado && selectCidade && selectBairro) {
        selectEstado.addEventListener("change", function () {
            const estado = selectEstado.value;

            if (estado === "SP") {
                selectCidade.innerHTML = `
                    <option value="">Selecione</option>
                    <option value="Sao Paulo">São Paulo</option>
                `;
            } else if (estado === "RJ") {
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

        selectCidade.addEventListener("change", function () {
            const cidade = selectCidade.value;

            if (cidade === "Sao Paulo") {
                selectBairro.innerHTML = `
                    <option value="">Selecione</option>
                    <option value="Mooca">Unidade Mooca</option>
                    <option value="Bandeirantes">Unidade Bandeirantes</option>
                    <option value="Tatuape">Unidade Tatuapé</option>
                    <option value="Santana">Unidade Santana</option>
                `;
            } else if (cidade === "Rio de Janeiro") {
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

    if (btnLimpar) {
        btnLimpar.addEventListener("click", () => {
            if (selectEstado) selectEstado.value = "";
            if (selectCidade) selectCidade.innerHTML = `<option value="">Selecione</option>`;
            if (selectBairro) selectBairro.innerHTML = `<option value="">Selecione</option>`;
            
            document.querySelectorAll(".pet-card").forEach((card) => {
                card.style.setProperty('display', 'flex', 'important');
            });
        });
    }

    // ----------------------------------------------------------------------
    // F. MODAL E EVENTOS GLOBAIS
    // ----------------------------------------------------------------------
    const modal = document.getElementById("modal-adocao");
    const btnFechar = document.querySelector(".close-modal");
    const formAdocao = document.getElementById("form-adocao");

    btnFechar?.addEventListener("click", () => fecharModal(modal));

    window.addEventListener("click", (e) => {
        if (modal && e.target === modal) fecharModal(modal);
    });

    formAdocao?.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("Parabéns! Sua intenção de adoção foi registrada com sucesso! 🎉");
        fecharModal(modal);
    });

    // ----------------------------------------------------------------------
    // G. INICIALIZAÇÃO DO CARROSSEL
    // ----------------------------------------------------------------------
    inicializarCarrossel();

    // ----------------------------------------------------------------------
    // H. FORMULÁRIO MULTI-PASSOS
    // ----------------------------------------------------------------------
    const modalEstado = document.getElementById("modal-estado");
    const modalCidade = document.getElementById("modal-cidade");
    const btnPasso1 = document.getElementById("btn-passo-1");
    const formMulti = document.getElementById("form-multi-passos");

    if (modalEstado && modalCidade) {
        modalEstado.addEventListener("change", function () {
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
                if (btnPasso1) btnPasso1.disabled = true;
            }
        });

        modalCidade.addEventListener("change", function () {
            if (btnPasso1) btnPasso1.disabled = !modalCidade.value;
        });
    }

    function irParaPasso(numero) {
        document.querySelectorAll(".passo-form").forEach((p) => p.classList.remove("ativo"));
        
        setTimeout(() => {
            const proximo = document.getElementById(`passo-${numero}`);
            proximo?.classList.add("ativo");
        }, 10);

        const numPassoElem = document.getElementById("numero-passo");
        if (numPassoElem) numPassoElem.textContent = numero;

        document.querySelectorAll(".circulo-passo").forEach((c) => {
            const passoCirculo = parseInt(c.getAttribute("data-passo"), 10);
            c.classList.toggle("ativo", passoCirculo <= numero);
        });
    }

    document.getElementById("btn-passo-1")?.addEventListener("click", () => irParaPasso(2));
    document.getElementById("btn-passo-2")?.addEventListener("click", () => irParaPasso(3));
    document.getElementById("btn-passo-3")?.addEventListener("click", () => irParaPasso(4));

    formMulti?.addEventListener("submit", function (e) {
        e.preventDefault();
        irParaPasso(5);
    });

    // ----------------------------------------------------------------------
    // ANIMAÇÃO EM CICLO AO ROLAR A TELA (REPETE AO SUBIR E DESCER)
    // ----------------------------------------------------------------------
    const elementosCiclo = document.querySelectorAll(".animar-ciclo");

    const observerCiclo = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            // Quando aparece na tela
            entry.target.classList.add("visivel");
            
            // Se essa seção contiver contadores, dispara a animação deles!
            if (entry.target.querySelector(".contador-numero") || entry.target.classList.contains("contador-numero")) {
                animarContadores();
            }
        } else {
            // Quando sai da tela, remove para reiniciar o ciclo se quiser
            entry.target.classList.remove("visivel");
        }
    });
}, {
    threshold: 0.15 
});

elementosCiclo.forEach((el) => observerCiclo.observe(el));
});

function animarContadores() {
    const numeros = document.querySelectorAll(".contador-numero"); // coloque essa classe nos números (+5000, etc)
    
    numeros.forEach((num) => {
        const valorFinal = parseInt(num.getAttribute("data-valor"), 10);
        let valorAtual = 0;
        const incremento = valorFinal / 200;

        const atualizar = () => {
            valorAtual += incremento;
            if (valorAtual < valorFinal) {
                num.textContent = Math.floor(valorAtual);
                requestAnimationFrame(atualizar);
            } else {
                num.textContent = valorFinal + "+";
            }
        };
        atualizar();
    });
}