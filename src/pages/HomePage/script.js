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
document.querySelectorAll('.visitas-section').forEach(el => observer.observe(el));
document.querySelectorAll('footer').forEach(el => observer.observe(el));