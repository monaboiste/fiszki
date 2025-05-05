# Plan wdrożenia punktu końcowego API: PUT /flashcards/{flashcardId}

## 1. Przegląd punktu końcowego

Punkt końcowy służy do aktualizacji istniejącej fiszki. Przyjmuje identyfikator zasobu w ścieżce URL oraz nowe wartości dla pól `front` i `back`.

## 2. Szczegóły żądania

- Metoda HTTP: PUT
- Struktura URL: `/api/flashcards/:flashcardId`
- Parametry ścieżki:
  - `flashcardId` (integer, wymagany) – identyfikator fiszki do aktualizacji
- Ciało żądania (JSON):
  ```json
  {
    "front": "Zaktualizowane pytanie",
    "back": "Zaktualizowana odpowiedź"
  }
  ```
- Walidacja:
  - `flashcardId`: całkowita liczba > 0
  - `front` - String, minimum 1 znak, maksymalnie 200 znaków, wymagany
  - `back` - String, minimum 1 znak, maksymalnie 500 znaków, wymagany

## 3. Wykorzystywane typy

- `UpdateFlashcardCommand` – DTO z polami `front` i `back` (string).
- `UpdateFlashcardResponseDto` – zwracany DTO zgodny z `FlashcardDto`:
  ```ts
  interface FlashcardDto {
    flashcard_id: number;
    front: string;
    back: string;
    type: string;
  }
  ```

## 4. Szczegóły odpowiedzi

- 200 OK
  ```json
  {
    "flashcard_id": 1,
    "front": "Zaktualizowane pytanie",
    "back": "Zaktualizowana odpowiedź",
    "type": "manual"
  }
  ```
- 400 Bad Request – nieprawidłowe dane wejściowe (błąd walidacji Zod)
- 401 Unauthorized – brak lub nieprawidłowy token uwierzytelnienia
- 404 Not Found – fiszka o podanym `flashcardId` nie istnieje lub użytkownik nie ma do niej dostępu
- 500 Internal Server Error – niespodziewany błąd po stronie serwera

## 5. Przepływ danych

1. Klient wysyła żądanie `PUT /api/flashcards/:flashcardId` z JSON-em `UpdateFlashcardCommand`.
2. Middleware Astro (`src/middleware/index.ts`) ekstraktuje i weryfikuje sesję użytkownika za pomocą `context.locals.supabase`.
3. Handler API (`src/pages/api/flashcards/[flashcardId].ts`):
   - Parsuje i waliduje `flashcardId` (parametr ścieżki).
   - Schemat Zod waliduje ciało żądania.
   - Weryfikuje, czy fiszka należy do aktualnie zalogowanego użytkownika.
   - Wywołuje serwis: `flashcards.service.updateFlashcard({userId, flashcardId, front, back}: UpdateFlashcardByIdParams)`.
   - Serwis aktualizuje fiszkę poprzez klienta Supabase.
   - Zaktualizowany rekord mapowany jest na `UpdateFlashcardResponseDto`.
4. Serwer zwraca odpowiedź HTTP 200 z zaktualizowanym obiektem JSON.

## 6. Względy bezpieczeństwa

- Uwierzytelnianie: wymaga ważnej sesji Supabase (już obsłużone w middleware).
- Autoryzacja: aktualizacja możliwa tylko przez właściciela fiszki (RLS z Supabase).
- Zapobieganie SQL injection przez korzystanie z query buildera Supabase.
- Walidacja wejścia przez Zod chroni przed wstrzyknięciem złośliwych danych.

## 7. Obsługa błędów

- ZodError → 400 (z detalami błędów walidacji).
- Brak sesji lub nieprawidłowy token → 401 Unauthorized.
- Brak rekordu lub nieautoryzowany dostęp → 404 Not Found.
- Błędy Supabase (np. 5xx) → 500 Internal Server Error

## 8. Rozważania dotyczące wydajności

- Pojedyncze zapytanie do bazy z indeksem na kolumnie `flashcard_id`.
- Minimalna ilość zwracanych danych.
- Ewentualne cache'owanie rekordów do odczytu (nie dotyczy operacji aktualizacji).

## 9. Kroki implementacji

1. **Utworzyć schemat Zod** w `src/lib/schemas/flashcards.ts`:
   ```ts
   export const updateFlashcardByIdSchema = z.object({
     front: z.string().min(1, "Front must be at least 1 character").max(200, "Front must be at most 200 characters"),
     back: z.string().min(1, "Back must be at least 1 character").max(500, "Back must be at most 500 characters"),
   });
   ```
2. **Serwis** `updateFlashcard` w `src/lib/services/flashcards.service.ts`:
   - Przyjmuje `UpdateFlashcardByIdParams`.
   - Wykonuje aktualizację w Supabase i zwraca `FlashcardDto` lub rzuca `FlashcardNotFoundError`.
3. **Middleware uwierzytelniania** – sprawdzenie, czy `context.locals.user` istnieje.
4. **Handler API** w `src/pages/api/flashcards/[flashcardId].ts`:
   - Obsłużyć metodę PUT.
   - Pobranie i walidacja `flashcardId` z `Astro.request.params`.
   - Walidacja ciała żądania (Zod).
   - Wywołanie serwisu i mapowanie rezultatu na DTO.
   - Zwrócenie odpowiedniej odpowiedzi lub błędu.
5. **Testy jednostkowe**:
   - Vitest dla serwisu i schematu Zod.
   - MSW do mockowania Supabase w testach integracyjnych.
6. **Dokumentacja**:
   - Aktualizacja specyfikacji API (OpenAPI/RFC).
   - Dodanie przykładów w `README.md` w katalogu `api`.
