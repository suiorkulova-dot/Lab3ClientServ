from pydantic import BaseModel, Field, ValidationError


class RentalProperty(BaseModel):
    city: str
    district: str
    rooms: int = Field(gt=0)
    amenities: list[str]
    price_per_day: float = Field(gt=0)
    rating: float = Field(ge=0, le=5)


# Текст объявления об аренде жилья
announcement = """
Сдаётся квартира в Бишкеке, район Асанбай.
Количество комнат: 2.
Удобства: Wi-Fi, стиральная машина.
Цена: 2500 сом в сутки.
Рейтинг: 4.8 из 5.
"""


# Пока извлекаем данные из текста вручную.
# На следующем этапе подключим ИИ для автоматического извлечения.
rental_data = {
    "city": "Бишкек",
    "district": "Асанбай",
    "rooms": 2,
    "amenities": ["Wi-Fi", "Стиральная машина"],
    "price_per_day": 2500,
    "rating": 4.8
}

print("Текст объявления:")
print(announcement)

try:
    rental = RentalProperty(**rental_data)

    print("\nИзвлечённые и проверенные данные:")
    print(rental.model_dump_json(indent=2, ensure_ascii=False))

except ValidationError as error:
    print("\nОшибка проверки данных:")
    print(error)
import os

print("\nПроверка настройки Gemini API:")

if os.getenv("GEMINI_API_KEY"):
    print("API-ключ найден!")
else:
    print("API-ключ не найден. Проверь настройки запуска.")
from google import genai
import os

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
print("\nПроверка Gemini на объявлении об аренде:")

announcement = """
Сдаётся квартира в Бишкеке, район Асанбай.
Количество комнат: 2.
Удобства: Wi-Fi, стиральная машина.
Цена: 2500 сом в сутки.
Рейтинг: 4.8 из 5.
"""

response = client.models.generate_content(
    model="gemini-3.5-flash-lite",
    contents=f"""
Извлеки из объявления данные об аренде жилья:
город, район, количество комнат, удобства,
цену за сутки и рейтинг.

Верни результат в формате JSON.

Объявление:
{announcement}
"""
)

print(response.text)
import json
from pydantic import ValidationError


print("\nПроверка ответа Gemini с помощью Pydantic:")

try:
    # Убираем форматирование Markdown, если Gemini его добавил
    answer = response.text.strip()

    if answer.startswith("```"):
        answer = answer.split("\n", 1)[1]
        answer = answer.rsplit("```", 1)[0].strip()

    # Преобразуем ответ ИИ в Python-словарь
    data = json.loads(answer)

    # Приводим данные к формату нашей модели
    rental_data = {
        "city": data["город"],
        "district": data["район"],
        "rooms": int(data["количество_комнат"]),
        "amenities": data["удобства"],
        "price_per_day": float(
            data["цена за сутки"].replace("сом", "").strip()
        ),
        "rating": float(
            data["рейтинг"].split()[0]
        )
    }

    # Проверяем данные с помощью Pydantic
    rental = RentalProperty(**rental_data)

    print("Данные успешно проверены!")
    print(rental.model_dump_json(indent=2))

except (json.JSONDecodeError, KeyError, ValueError, ValidationError) as error:
    print("Не удалось проверить данные:")
    print(error)