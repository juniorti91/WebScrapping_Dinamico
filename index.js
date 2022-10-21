const pup = require('puppeteer');

const url = "https://www.mercadolivre.com.br/";
const searchFor = "macbook";

let c = 1;
const list = [];

(async () => {
    const browser = await pup.launch({headless: false}); // Inicializar o navegador {headless: true} - o navegador não ira aparecer
    const page = await browser.newPage(); // Criar uma nova página
    console.log('Iniciei!');

    await page.goto(url); // Redirecionando a página passando o URL
    console.log('Fui para a URL!');

    await page.waitForSelector('#cb1-edit'); // Esperar o campo selecionado carregar por completo

    await page.type('#cb1-edit', searchFor); // Ira digitar dentro do campo de pesquisa

    await Promise.all([
        page.waitForNavigation(), // Aguardando nova navegação de página
        page.click('.nav-search-btn') // Evento utilizado para clicar em algum campo como um botão
    ])

    const links = await page.$$eval('.ui-search-result__image > a', el => el.map(link => link.href)); // $$eval = documento.QuerySelectorAll , para pegar o link

    for(const link of links){
        if(c === 10) continue;
        console.log('Página', c); // Mostra a quantidade de páginas que estão sendo chamadas
        await page.goto(link);
        await page.waitForSelector('.ui-pdp-title');

        const title = await page.$eval('.ui-pdp-title', element => element.innerText); // $eval = ira retornar apenas um unico elemento
        const price = await page.$eval('.andes-money-amount__fraction', element => element.innerText);

        const seller = await page.evaluate(()=>{
            const el = document.querySelector('.ui-pdp-seller__link-trigger')
            if(!el) return null // se não for verdadeiro ira retornar NULL
            return el.innerText;
        });

        const obj = {}; // Adicionando so dados em um objeto
        obj.title = title;
        obj.price = price;
        (seller ? obj.seller = seller : ''); // Verfica se ele não é Nulo se ele não for irá pegar os dados e passar para a variavel
        obj.link = link;
        
        list.push(obj); // Passando o objeto com varios itens para uma variavel Array

        c++; // Contador de páginas
    }

    console.log(list);


    await page.waitForTimeout(3000); // Tempo para esperar antes de passar para o proximo ciclo (3000) = 3 segundos
    await browser.close(); // Fechando o browser
})();