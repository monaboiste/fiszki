# REST API Plan

## 1. Zasoby

- **Użytkownicy (Users)** - Tabela `users` w bazie danych

  - Przechowuje informacje o użytkownikach systemu
  - Zawiera identyfikator, email i hash hasła

- **Fiszki (Flashcards)** - Tabela `flashcards` w bazie danych

  - Przechowuje treść fiszek (front i back)
  - Każda fiszka ma typ (manual, ai_generated, ai_generated_modified)
  - Powiązana z użytkownikiem (właścicielem) i opcjonalnie z generacją

- **Generacje (Generations)** - Tabela `generations` w bazie danych
  - Przechowuje informacje o procesach generowania fiszek przez AI
  - Zawiera dane wejściowe, czas generacji, użyty model AI i status akceptacji

## 2. Punkty końcowe

### Fiszki (Flashcards)

#### GET /flashcards

- **Opis**: Pobieranie listy fiszek z paginacją, filtrowaniem i sortowaniem
- **Parametry zapytania**:
  - `page` (integer, domyślnie: 1) - Numer strony
  - `limit` (integer, domyślnie: 10) - Liczba elementów na stronie
  - `sort` (string, domyślnie: "created_at") - Pole, po którym sortowane są wyniki
  - `filter` (string) - Kryteria filtrowania (np. type:manual)
- **Struktura odpowiedzi**:
  ```json
  {
    "flashcards": [
      {
        "flashcard_id": 1,
        "user_id": 1,
        "generation_id": null,
        "front": "Pytanie 1",
        "back": "Odpowiedź 1",
        "type": "manual",
        "created_at": "2023-06-01T12:00:00Z",
        "updated_at": "2023-06-01T12:00:00Z"
      }
    ],
    "page": 1,
    "limit": 10,
    "total": 100
  }
  ```
- **Kod sukcesu**: 200 (OK)
- **Kody błędów**:
  - 401 (Unauthorized) - Brak uwierzytelnienia

#### POST /flashcards

- **Opis**: Tworzenie wielu fiszek jednocześnie
- **Struktura żądania**:
  ```json
  {
    "flashcards": [
      {
        "front": "Pytanie 1",
        "back": "Odpowiedź 1",
        "type": "manual",
        "generation_id": 1
      },
      {
        "front": "Pytanie 2",
        "back": "Odpowiedź 2",
        "type": "manual",
        "generation_id": 1
      }
    ]
  }
  ```
- **Struktura odpowiedzi**:
  ```json
  {
    "flashcards": [
      {
        "flashcard_id": 1,
        "front": "Pytanie 1",
        "back": "Odpowiedź 1",
        "type": "manual"
      },
      {
        "flashcard_id": 2,
        "front": "Pytanie 2",
        "back": "Odpowiedź 2",
        "type": "manual"
      }
    ]
  }
  ```
- **Kod sukcesu**: 201 (Created)
- **Kody błędów**:
  - 400 (Bad Request) - Nieprawidłowe dane wejściowe
  - 401 (Unauthorized) - Brak uwierzytelnienia

#### GET /flashcards/{flashcardId}

- **Opis**: Pobieranie szczegółów konkretnej fiszki
- **Parametry ścieżki**:
  - `flashcardId` (integer) - Identyfikator fiszki
- **Struktura odpowiedzi**:
  ```json
  {
    "flashcard_id": 1,
    "user_id": 1,
    "generation_id": null,
    "front": "Pytanie 1",
    "back": "Odpowiedź 1",
    "type": "manual",
    "created_at": "2023-06-01T12:00:00Z",
    "updated_at": "2023-06-01T12:00:00Z"
  }
  ```
- **Kod sukcesu**: 200 (OK)
- **Kody błędów**:
  - 404 (Not Found) - Fiszka nie istnieje
  - 401 (Unauthorized) - Brak uwierzytelnienia

#### PUT /flashcards/{flashcardId}

- **Opis**: Aktualizacja istniejącej fiszki
- **Parametry ścieżki**:
  - `flashcardId` (integer) - Identyfikator fiszki
- **Struktura żądania**:
  ```json
  {
    "front": "Zaktualizowane pytanie",
    "back": "Zaktualizowana odpowiedź"
  }
  ```
- **Struktura odpowiedzi**:
  ```json
  {
    "flashcard_id": 1,
    "front": "Zaktualizowane pytanie",
    "back": "Zaktualizowana odpowiedź",
    "type": "manual"
  }
  ```
- **Kod sukcesu**: 200 (OK)
- **Kody błędów**:
  - 400 (Bad Request) - Nieprawidłowe dane wejściowe
  - 404 (Not Found) - Fiszka nie istnieje
  - 401 (Unauthorized) - Brak uwierzytelnienia

#### DELETE /flashcards/{flashcardId}

- **Opis**: Usuwanie istniejącej fiszki
- **Parametry ścieżki**:
  - `flashcardId` (integer) - Identyfikator fiszki
- **Kod sukcesu**: 204 (No Content)
- **Kody błędów**:
  - 404 (Not Found) - Fiszka nie istnieje
  - 401 (Unauthorized) - Brak uwierzytelnienia

### Generacje (Generations)

#### POST /generations

- **Opis**: Zlecenie generacji fiszek przez AI na podstawie tekstu wejściowego
- **Struktura żądania**:
  ```json
  {
    "input_text": "Wyjaśnij teorię względności."
  }
  ```
- **Struktura odpowiedzi**:
  ```json
  {
    "proposed_flashcards": [
      {
        "front": "Co to jest teoria względności?",
        "back": "Teoria względności to...",
        "type": "ai_generated"
      }
    ],
    "generation_id": 1
  }
  ```
- **Kod sukcesu**: 201 (Created)
- **Kody błędów**:
  - 400 (Bad Request) - Nieprawidłowe dane wejściowe
  - 401 (Unauthorized) - Brak uwierzytelnienia

#### GET /generations/{generationId}

- **Opis**: Pobieranie szczegółów konkretnej generacji, w tym wygenerowanych fiszek
- **Parametry ścieżki**:
  - `generationId` (integer) - Identyfikator generacji
- **Struktura odpowiedzi**:
  ```json
  {
    "generation_id": 1,
    "generation_duration_ms": 2500,
    "input_text": "Wyjaśnij teorię względności.",
    "model": "gpt-4",
    "created_at": "2023-06-01T12:00:00Z",
    "proposed_flashcards": [
      {
        "front": "Co to jest teoria względności?",
        "back": "Teoria względności to...",
        "type": "ai_generated"
      }
    ]
  }
  ```
- **Kod sukcesu**: 200 (OK)
- **Kody błędów**:
  - 404 (Not Found) - Generacja nie istnieje
  - 401 (Unauthorized) - Brak uwierzytelnienia

## 3. Uwierzytelnianie i autoryzacja

- **Mechanizm uwierzytelniania**: JWT (JSON Web Token)
  - Każdy użytkownik otrzymuje token JWT po zalogowaniu
  - Token JWT jest przekazywany w nagłówku Authorization jako Bearer token
  - Token zawiera identyfikator użytkownika i czas wygaśnięcia
  - Wszystkie chronione endpointy wymagają prawidłowego tokenu JWT
  - System implementuje Row-Level Security (RLS) na poziomie bazy danych, aby zapewnić, że użytkownicy mają dostęp tylko do swoich danych

## 4. Walidacja i logika biznesowa

### Walidacja danych

- **Fiszki (Flashcards)**:

  - `front` - String, minimum 1 znak, maksymalnie 200 znaków, wymagany
  - `back` - String, minimum 1 znak, maksymalnie 500 znaków, wymagany
  - `type` - Enum ["manual", "ai_generated", "ai_generated_modified"], wymagany

- **Generacje (Generations)**:
  - `input_text` - String, minimum 20 znaków, maksymalnie 10000 znaków, wymagany
  - `generation_duration_ms` - Integer

### Logika biznesowa

- **Tworzenie fiszek**:

  - Fiszki mogą być tworzone ręcznie przez użytkownika (type = "manual")
  - Fiszki mogą być generowane przez AI (type = "ai_generated")
  - Fiszki wygenerowane przez AI mogą być modyfikowane przez użytkownika (type = "ai_generated_modified")

- **Generacja fiszek przez AI**:

  - Użytkownik podaje tekst wejściowy, na podstawie którego AI generuje propozycje fiszek
  - System rejestruje metadane generacji (czas generacji, użyty model AI)
  - Użytkownik może zaakceptować lub odrzucić wygenerowane fiszki

- **Zarządzanie fiszkami**:
  - Użytkownik może przeglądać, filtrować i sortować swoje fiszki
  - Użytkownik może edytować i usuwać swoje fiszki
  - Użytkownik może tworzyć wiele fiszek jednocześnie (bulk create)
