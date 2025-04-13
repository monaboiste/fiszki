# API Endpoint Implementation Plan: POST /flashcards

## 1. Przegląd punktu końcowego

Endpoint służy do tworzenia wielu fiszek jednocześnie. Umożliwia klientowi przesłanie tablicy obiektów z danymi fiszek, które są następnie zapisywane w bazie danych. Operacja wymaga uwierzytelnienia i zwraca utworzone zasoby z przypisanymi identyfikatorami fiszek.

## 2. Szczegóły żądania

- **Metoda HTTP**: POST
- **Struktura URL**: /api/flashcards
- **Parametry**:
  - **Wymagane**: Brak parametrów w URL
- **Request Body**:
  ```json
  {
    "flashcards": [
      {
        "front": "Pytanie 1",
        "back": "Odpowiedź 1",
        "type": "manual"
      },
      {
        "front": "Pytanie 2",
        "back": "Odpowiedź 2",
        "type": "manual"
      }
    ]
  }
  ```

## 3. Wykorzystywane typy

- **CreateFlashcardCommand**: DTO dla pojedynczej fiszki, który zawiera pola `front`, `back` oraz `type`.
- **BulkCreateFlashcardsCommand**: DTO dla tworzenia wielu fiszek jednocześnie, definiowane jako `{ flashcards: CreateFlashcardCommand[] }`.
- **BulkCreateFlashcardsResponseDto**: DTO reprezentujące odpowiedź z wstawionymi fiszkami, zawierające m.in. `flashcard_id` oraz pola `front`, `back`, `type`.

## 4. Szczegóły odpowiedzi

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
  - 400 (Bad Request) – nieprawidłowe dane wejściowe
  - 401 (Unauthorized) – brak lub nieprawidłowe uwierzytelnienie
  - 500 (Internal Server Error) – problemy serwerowe lub bazy danych

## 5. Przepływ danych

1. Klient wysyła żądanie POST do `/api/flashcards` z poprawnym tokenem uwierzytelniającym oraz danymi fiszek w ciele żądania.
2. Endpoint odbiera dane i wykonuje walidację przy użyciu np. Zod, zgodnie z definicjami DTO.
3. Po pomyślnej walidacji dane są przekazywane do warstwy serwisowej (`flashcards.service`), która odpowiada za wsadowe wstawianie fiszek do bazy danych Supabase.
4. Usługa zwraca wynik operacji (wstawione rekordy) zawierający m.in. przypisane `flashcard_id`.
5. Endpoint zwraca odpowiedź w formacie JSON z kodem 201.

## 6. Względy bezpieczeństwa

- **Autentykacja**: Weryfikacja tokenu Bearer w nagłówku `Authorization` przed przetwarzaniem żądania.
- **Walidacja danych**: Użycie Zod (lub innego narzędzia walidacyjnego) do sprawdzenia, czy dane wejściowe odpowiadają wymaganej strukturze.
- **Dozwolone wartości**: Pole `type` musi przyjmować wyłącznie dozwolone wartości (`manual`, `ai_generated`, `ai_generated_modified`).

## 7. Obsługa błędów

- **400 Bad Request**: Gdy dane wejściowe są niezgodne ze schematem (np. brak wymaganej właściwości lub błędny format danych).
- **401 Unauthorized**: Gdy żądanie nie zawiera poprawnego tokenu uwierzytelniającego.
- **500 Internal Server Error**: W przypadku awarii po stronie serwera, np. problemów z bazą danych. Wszelkie błędy serwerowe powinny być logowane z odpowiednim komunikatem i śledzeniem.

## 8. Rozważania dotyczące wydajności

- **Operacja wsadowa**: Użycie jednej operacji INSERT dla wielu rekordów, aby zminimalizować liczbę zapytań do bazy danych.
- **Indeksowanie**: Upewnienie się, że tabela `flashcards` ma odpowiednie indeksy dla pól często używanych w zapytaniach.
- **Limit wielkości wsadu**: Rozważenie limitu wielkości danych, które mogą być jednorazowo przesłane, aby zapobiec przeciążeniu systemu.

## 9. Etapy wdrożenia

1. **Implementacja endpointu**: Dodanie lub rozszerzenie pliku API w `/src/pages/api/flashcards.index.ts` do obsługi metody POST.
2. **Walidacja**: Zaimplementowanie walidacji danych wejściowych przy użyciu Zod, zgodnie z definicjami DTO.
3. **Warstwa serwisowa**: Wyodrębnienie logiki biznesowej do dedykowanej usługi (`flashcards.service`), która realizuje operację wsadowego wstawiania fiszek do bazy danych Supabase.
4. **Integracja z bazą danych**: Użycie Supabase do wykonania operacji INSERT z opcją zwracania wstawionych rekordów.
5. **Obsługa błędów**: Implementacja odpowiednich mechanizmów obsługi i logowania błędów, przy jednoczesnym zwracaniu właściwych kodów statusu (400, 401, 500).
6. **Testy**: Stworzenie testów jednostkowych oraz integracyjnych dla endpointu, obejmujących zarówno ścieżkę sukcesu, jak i różne scenariusze błędów.
