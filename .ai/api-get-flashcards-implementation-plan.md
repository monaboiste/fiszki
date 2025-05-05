# API Endpoint Implementation Plan: GET /flashcards

## 1. Przegląd punktu końcowego

Endpoint `GET /flashcards` umożliwia pobranie listy fiszek należących do uwierzytelnionego użytkownika z możliwością paginacji, filtrowania oraz sortowania.

## 2. Szczegóły żądania

- Metoda HTTP: GET
- Ścieżka URL: `/api/flashcards`
- Nagłówki:
  - `Authorization: Bearer <token>` (wymagany)
- Parametry zapytania:
  - `page` (integer, opcjonalny, domyślnie 1) – numer strony (>= 1)
  - `limit` (integer, opcjonalny, domyślnie 10, maks. 100) – liczba elementów na stronie
  - `sort` (string, opcjonalny, domyślnie `created_at`) – pole sortowania, dozwolone wartości: `created_at`, `updated_at`, `front`, `back`, `type`
  - `sort_direction` (string, opcjonalny, domyślnie `desc`) – kierunek sortowania, dozwolone wartości: `asc`, `desc`
  - `filter` (string[] | string, opcjonalny) – lista kryteriów filtrowania w formacie `field:value`, np. `type:manual` lub `'type:manual,field2:value2'`. Obecnie wspierane pole: `type`, w przyszłości możliwe rozszerzenie na kolejne pola.
- Body: brak (GET)

## 3. Wykorzystywane typy

- `FlashcardDto` (z `src/types.ts`) – pełna reprezentacja fiszki zwracana przez API
- `FlashcardsListResponseDto` (z `src/types.ts`) – struktura odpowiedzi: `{ flashcards: FlashcardDto[]; page: number; limit: number; total: number }`
- Zdefiniować wewnętrzny typ lub Zod schema dla zapytania:
  ```ts
  const FlashcardsListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sort: z.enum(["created_at", "updated_at", "front", "back", "type"]).default("created_at"),
    sort_direction: z.enum(["asc", "desc"]).default("desc"),
    filter: z.preprocess((val) => {
      if (typeof val === "string") return val.split(",");
      if (Array.isArray(val)) return val;
      return [];
    }, z.array(z.string()).optional()),
  });
  ```

## 4. Szczegóły odpowiedzi

- 200 OK:
  ```json
  {
    "flashcards": [FlashcardDto, ...],
    "page": 1,
    "limit": 10,
    "total": 42
  }
  ```
- 400 Bad Request – niepoprawne parametry zapytania (np. `page` nie jest liczbą)
- 401 Unauthorized – brak lub nieprawidłowy token
- 500 Internal Server Error – błąd po stronie serwera lub bazy danych

## 5. Przepływ danych

1. Middleware uwierzytelniające JWT (`src/middleware/index.ts`) ustawia `context.locals.user.id`.
2. Handler w `src/pages/api/flashcards.ts`:
   - Pobiera i waliduje query params za pomocą Zod.
   - Wywołuje `flashcardsService.getFlashcards({ userId, page, limit, sort, filter })`.
3. Serwis w `src/lib/services/flashcards.service.ts`:
   - Buduje zapytanie do Supabase:
     - `.eq('user_id', userId)`
       - podziel `criterion` na `[field, value] = criterion.split(':')`
         i wywołaj `.eq(field, value)`
     - `.order(sort, { ascending: sort_direction === 'asc' })`
     - `.range((page-1)*limit, page*limit - 1)`
     - `.select('*', { count: 'exact' })`
   - Zwraca obiekt `{ rows, count }`.
4. Handler mapuje wiersze na `FlashcardDto[]` i zwraca `FlashcardsListResponseDto`.

## 6. Względy bezpieczeństwa

- Weryfikacja i autoryzacja JWT w middleware.
- Row-Level Security w Supabase (policy: `user_id = auth.uid()`).
- Walidacja i sanityzacja parametrów (`filter` kontrolowany dozwolonymi polami i wartościami).
- Walidacja i sanityzacja parametrów:
  - `filter` rozbijany na tablicę kryteriów i weryfikacja whitelisty obsługiwanych pól (aktualnie `type`, łatwa rozszerzalność).
- Ochrona przed nadmiernymi żądaniami (rate limiting na poziomie API lub reverse proxy).

## 7. Obsługa błędów

| Scenariusz                  | Kod | Działanie                         |
| --------------------------- | --- | --------------------------------- |
| Brak/nieprawidłowy token    | 401 | Zwróć `{ error: 'Unauthorized' }` |
| Niepoprawne parametry (Zod) | 400 | Zwróć szczegóły błędów walidacji  |

## 8. Rozważania dotyczące wydajności

- Indeksy w bazie na `user_id`, `created_at`, `type`.
- Ograniczenie `limit` do rozsądnego maksimum (np. 100).
- Paginacja offsetowa; rozważyć cursors-based gdy większa skala.
- Batch-owe zapytanie SELECT z `count: 'exact'` minimalizuje round-tripy.

## 9. Kroki implementacji

1. Zdefiniować Zod schema zapytania.
2. Utworzyć lub zaktualizować serwis `src/lib/services/flashcards.service.ts` z funkcją `getFlashcards`.
3. Stworzyć plik (jeśli nie istnieje) `src/pages/api/flashcards.ts` z handlerem GET:
   - Walidacja query, pobranie `userId` i wywołanie serwisu.
4. Mapowanie wyników na `FlashcardsListResponseDto`.
5. Dodać obsługę błędów walidacji i DB w try/catch.
6. Napisać testy jednostkowe dla serwisu i handlera (Vitest + MSW).
7. Zaktualizować dokumentację API w `README.md` i `.ai/api-plan.md`.
