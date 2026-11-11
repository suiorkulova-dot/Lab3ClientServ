const API_URL = "http://127.0.0.1:5000/api/v1/properties";

const propertiesList = document.getElementById("propertiesList");
const propertyForm = document.getElementById("propertyForm");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const message = document.getElementById("message");

let properties = [];

// Получение объявлений с сервера
async function loadProperties() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Ошибка загрузки объявлений");
        }

        const result = await response.json();

        properties = result.data || [];
        displayProperties(properties);

    } catch (error) {
        message.textContent = "Не удалось подключиться к серверу.";
        console.error(error);
    }
}

// Отображение объявлений на странице
function displayProperties(items) {
    propertiesList.innerHTML = "";

    if (items.length === 0) {
        propertiesList.innerHTML = "<p>Объявления не найдены.</p>";
        return;
    }

    items.forEach(property => {
        const card = document.createElement("div");
        card.className = "property-card";

        const title = document.createElement("h3");
        title.textContent = property.title;

        const city = document.createElement("p");
        city.textContent = "Город: " + property.city;

        const rooms = document.createElement("p");
        rooms.textContent = "Комнат: " + property.rooms;

        const area = document.createElement("p");
        area.textContent = "Площадь: " + property.area + " м²";

        const wifi = document.createElement("p");
        wifi.textContent = "Wi-Fi: " + (property.has_wifi ? "Есть" : "Нет");

        const parking = document.createElement("p");
        parking.textContent = "Парковка: " + (property.has_parking ? "Есть" : "Нет");

        const price = document.createElement("div");
        price.className = "property-price";
        price.textContent = property.price_per_day + " сом / сутки";

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Удалить";
        deleteButton.addEventListener("click", () => {
            deleteProperty(property.id);
        });

        card.append(title, city, rooms, area, wifi, parking, price, deleteButton);
        propertiesList.appendChild(card);
    });
}

// Добавление нового объявления
propertyForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const newProperty = {
        title: document.getElementById("title").value,
        city: document.getElementById("city").value,
        rooms: Number(document.getElementById("rooms").value),
        area: Number(document.getElementById("area").value),
        price_per_day: Number(document.getElementById("price").value),
        has_wifi: document.getElementById("wifi").checked,
        has_parking: document.getElementById("parking").checked
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newProperty)
        });

        if (!response.ok) {
            throw new Error("Не удалось добавить объявление");
        }

        message.textContent = "Объявление успешно добавлено!";
        propertyForm.reset();

        await loadProperties();

    } catch (error) {
        message.textContent = "Ошибка при добавлении объявления.";
        console.error(error);
    }
});

// Удаление объявления
async function deleteProperty(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Не удалось удалить объявление");
        }

        message.textContent = "Объявление удалено!";
        await loadProperties();

    } catch (error) {
        message.textContent = "Ошибка при удалении объявления.";
        console.error(error);
    }
}

// Поиск объявлений по названию
searchButton.addEventListener("click", function() {
    const searchText = searchInput.value.toLowerCase().trim();

    const filteredProperties = properties.filter(property =>
        property.title.toLowerCase().includes(searchText)
    );

    displayProperties(filteredProperties);
});

// Загрузка объявлений при открытии страницы
loadProperties();