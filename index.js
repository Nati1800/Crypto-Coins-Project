const mainContent = document.querySelector("#mainContentDiv");
const homeButton = document.querySelector("#homeButton");
const aboutButton = document.querySelector("#aboutButton");
const coinsURL = "https://api.coingecko.com/api/v3/coins/list";
const moreInfoURL = "https://api.coingecko.com/api/v3/coins/";
const moreInfoCache = {};
const selectedCoins = [];
const modalBody = document.querySelector("#modalBody");
const homePageLoaderDiv = document.querySelector(".home-page-loader-div");
const searchButton = document.querySelector("#searchButton");
let coinsData = null; 

function init() {
    homeButton.addEventListener("click", async () => {
        try {
            drawHomePage();
        } catch (error) {
            alert("ERROR");
            console.log(error);
        }
    });

    aboutButton.addEventListener("click", async () => {
        drawAboutPage();
    });

    searchButton.addEventListener("click", () => {
        if (coinsData) {
            mainContent.innerHTML = "";
            searchCoins(coinsData);
        }
    });
}


async function drawHomePage() {
    mainContent.innerHTML = "";
    homePageLoaderDiv.style.display = "block"; 
    
    try {
        let newData;
        if (!coinsData) {
            newData = await getCoinsApi();
            coinsData = newData; 
        } else {
            await new Promise(resolve => setTimeout(resolve,1 * 250)); 
        }

        mainContent.innerHTML = ""; 
        drawSingleCoin(coinsData);
    } catch (error) {
        alert("something went wrong");
        console.log(error);
    } finally {
        homePageLoaderDiv.style.display = "none"; 
        
    }
}



function searchCoins(coinsArray) {
    const searchInput = document.querySelector("#searchInput");
    const searchValue = searchInput.value;
    const newCoinsArray = coinsArray.filter(coin =>
        coin.name.toLowerCase().includes(searchValue.toLowerCase())
    );
    drawSingleCoin(newCoinsArray);
    searchInput.value = "";
}

async function getCoinsApi() {
    const data = await fetch(coinsURL);
    const result = await data.json();
    return result;
}

function drawSingleCoin(coinsArray) {
    if (!Array.isArray(coinsArray)) return;
    coinsArray.forEach(coin => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.style.width = '18rem';

        const cardBodyDiv = document.createElement('div');
        cardBodyDiv.className = 'card-body';

        const switchLabel = document.createElement('label');
        switchLabel.className = 'switch';

        const inputCheckbox = document.createElement('input');
        inputCheckbox.type = 'checkbox';
        inputCheckbox.checked = selectedCoins.includes(coin.id);
        inputCheckbox.setAttribute('data-coin-id', coin.id);
        inputCheckbox.addEventListener('change', () => handleToggle(coin, inputCheckbox));

        const spanSlider = document.createElement('span');
        spanSlider.className = 'slider round';

        switchLabel.append(inputCheckbox, spanSlider);

        const cardTitle = document.createElement('h5');
        cardTitle.className = 'card-title';
        cardTitle.textContent = "Coin Name: " + coin.name;

        const cardText = document.createElement('p');
        cardText.className = 'card-text';
        cardText.textContent = "Coin ID: " + coin.symbol;

        const moreInfoButton = document.createElement('button');
        moreInfoButton.className = 'btn btn-primary more-info-btn';
        moreInfoButton.type = 'button';
        moreInfoButton.setAttribute('data-coin-id', coin.id);
        moreInfoButton.setAttribute('data-toggle', 'collapse');
        moreInfoButton.setAttribute('data-target', `#collapseExample${coin.id}`);
        moreInfoButton.textContent = 'More Info';

        const loaderDiv = document.createElement('div');
        const loader = document.createElement('span');
        loader.classList.add("loader");
        loaderDiv.append(loader);
        loader.id = `loader${coin.id}`;

        const collapseDiv = document.createElement('div');
        collapseDiv.className = 'collapse';
        collapseDiv.id = `collapseExample${coin.id}`;

        const collapseCardBody = document.createElement('div');
        collapseCardBody.className = 'card card-body';

        collapseDiv.append(collapseCardBody);

        cardBodyDiv.append(switchLabel, cardTitle, cardText, moreInfoButton, loaderDiv, collapseDiv);
        cardDiv.append(cardBodyDiv);
        mainContent.append(cardDiv);

        collapseDiv.addEventListener('shown.bs.collapse', () => {
            cardDiv.style.height = 'auto';
        });

        collapseDiv.addEventListener('hidden.bs.collapse', () => {
            cardDiv.style.height = '18rem';
        });
    });

    document.querySelectorAll(".more-info-btn").forEach(button => {
        button.addEventListener("click", getMoreInfoButtonClick);
    });
}

function handleToggle(coin, checkbox) {
    if (selectedCoins.includes(coin.id)) {
        selectedCoins.splice(selectedCoins.indexOf(coin.id), 1);
    } else {
        if (selectedCoins.length < 5) {
            selectedCoins.push(coin.id);
        } else {
            checkbox.checked = false;
            openModal(coin, checkbox);
            return;
        }
    }
}

function openModal(coinSelected, checkbox) {
    $("#exampleModal").modal('show');
    modalBody.innerHTML = '';
    drawModalCoins(selectedCoins, coinSelected, checkbox);
}

function drawModalCoins(selectedCoinsList, coinSelected, checkbox) {
    selectedCoinsList.forEach((coin) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.style.width = '18rem';

        const cardBodyDiv = document.createElement('div');
        cardBodyDiv.className = 'card-body';

        const switchLabel = document.createElement('label');
        switchLabel.className = 'switch';

        const inputCheckbox = document.createElement('input');
        inputCheckbox.checked = true;
        inputCheckbox.type = 'checkbox';
        inputCheckbox.addEventListener('change', () => modalToggleAction(coin, inputCheckbox, coinSelected, checkbox));

        const spanSlider = document.createElement('span');
        spanSlider.className = 'slider round';

        switchLabel.append(inputCheckbox, spanSlider);

        const cardTitle = document.createElement('h5');
        cardTitle.className = 'card-title';
        cardTitle.textContent = "Coin Name: " + coin;

        cardBodyDiv.append(switchLabel, cardTitle);
        cardDiv.append(cardBodyDiv);
        modalBody.append(cardDiv);
    });
}

function modalToggleAction(coin, inputCheckbox, coinSelected, checkbox) {
    if (!inputCheckbox.checked) {
        selectedCoins.splice(selectedCoins.indexOf(coin), 1);
        selectedCoins.push(coinSelected.id);
        updateCheckboxState(coin, false);
        updateCheckboxState(coinSelected.id, true);
        checkbox.checked = true;
        $("#exampleModal").modal('hide');
        
    }
}

function updateCheckboxState(coinId, state) {
    const checkbox = document.querySelector(`input[type="checkbox"][data-coin-id="${coinId}"]`);
    if (checkbox) {
        checkbox.checked = state;
    }
}

async function getMoreInfoButtonClick(event) {
    const coinId = event.target.getAttribute("data-coin-id");
    const collapseDiv = document.querySelector(`#collapseExample${coinId}`);
    const collapseCardBody = collapseDiv.querySelector('.card-body');
    const loader = document.querySelector(`#loader${coinId}`);

    const now = Date.now();
    const cacheEntry = moreInfoCache[coinId];

    if (cacheEntry && (now - cacheEntry.timestamp < 2 * 60 * 1000)) {
        const moreInfo = cacheEntry.data;
        collapseCardBody.innerHTML = `
            <img class="coin-image" src="${moreInfo.image?.small}">
            <p>Current Price: $${moreInfo.market_data.current_price.usd}</p>
            <p>EURO: €${moreInfo.market_data.current_price?.eur}</p>
            <p>SHEKELS: ₪${moreInfo.market_data.current_price?.ils}</p>
        `;
    } else {
        try {
            loader.style.display = "block";
            const moreInfo = await getMoreInfoApi(coinId);
            moreInfoCache[coinId] = {
                data: moreInfo,
                timestamp: now
            };
            collapseCardBody.innerHTML = `
                <img class="coin-image" src="${moreInfo.image?.small}">
                <p>Current Price: $${moreInfo.market_data.current_price.usd}</p>
                <p>EURO: €${moreInfo.market_data.current_price?.eur}</p>
                <p>SHEKELS: ₪${moreInfo.market_data.current_price?.ils}</p>
            `;
        } catch (error) {
            alert("Error getting more info");
            console.log(error);
        } finally {
            loader.style.display = "none";
        }
    }
}

async function getMoreInfoApi(coinId) {
    const result = await fetch(moreInfoURL + coinId);
    const data = await result.json();
    return data;
    
}

function drawAboutPage() {
    mainContent.innerHTML = `
    <div class="about-page">
            <h1 class="about-header">About Me</h1>
            <div class="personal-details">
                 <div class="personal-photo-div">
                <img src="assets/profile.jpg" alt="Nati Alayu" class="personal-photo">
                </div>
                <div class="details-p">
                <p><strong>Name:</strong> Netanel Alayu</p>
                <p><strong>Email:</strong> natanel1007@gmail.com </p>
                <p><strong>GitHub:</strong> <a href="https://github.com/Nati1800" target="_blank">github.com/Nati1800</a></p>
                </div>
            </div>
            <h2 style = "text-align: center" >Project Description</h2>
            <p>This project is a cryptocurrency dashboard that allows users to monitor the prices of selected cryptocurrencies. Users can select coins to track from the home page and find more detailed information about each coin. The project utilizes the CryptoCompare API to fetch live price data.</p>
        </div>
    `

}


init();
