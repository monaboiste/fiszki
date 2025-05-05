# API Endpoint Implementation Plan: DELETE /flashcards/{flashcardId}

## 1. Przegląd punktu końcowego

Usuwanie zasobu fiszki o podanym identyfikatorze. Umożliwia autoryzowanemu użytkownikowi skasowanie własnej fiszki, zwracając 204 No Content w przypadku powodzenia.

## 2. Szczegóły żądania

- Metoda HTTP: DELETE
- Struktura URL: `/flashcards/{flashcardId}`
- Parametry:
  - Wymagane:
    - `flashcardId` (integer) – identyfikator fiszki przekazany jako parametr ścieżki
- Body: brak (brak treści żądania)

## 3. Wykorzystywane typy

- Parametr ścieżki: `flashcardId: number`
- (opcjonalnie) `DeleteFlashcardParams` (alias dla `{ flashcardId: number }`)
- Brak dedykowanego DTO do żądania (parametr wystarczający)

## 3. Szczegóły odpowiedzi

- 204 No Content – fiszka została usunięta pomyślnie (brak treści w odpowiedzi)
- 401 Unauthorized – brak uwierzytelnienia użytkownika
- 400 Bad Request – nieprawidłowy format lub wartość parametru `flashcardId`
- 404 Not Found – nie znaleziono fiszki o podanym `flashcardId` lub nie należy do zalogowanego użytkownika
- 500 Internal Server Error – nieoczekiwany błąd po stronie serwera

## 4. Przepływ danych

1. Klient wysyła żądanie DELETE do `/flashcards/{flashcardId}` z tokenem uwierzytelniającym.
2. Handler Astro w pliku `src/pages/api/flashcards/[flashcardId].ts`:
   - Pobiera klienta Supabase i obiekt sesji z `context.locals`
   - Waliduje i parsuje `flashcardId` za pomocą Zod
   - Wywołuje `flashcards.service.deleteFlashcardById({userId, flashcardId})` w warstwie serwisowej
3. Serwis w `src/lib/services/flashcards.service.ts`:
   - Używa SupabaseClient z `context.locals` lub importu `SupabaseClient` typu
   - Wykonuje `supabase.from('flashcards').delete().eq('flashcard_id', flashcardId).eq('user_id', userId)`
   - Analizuje wynik: jeśli `count` lub `data` jest puste, rzuca błędem 404; w przeciwnym razie zwraca sukces
4. Handler zwraca odpowiedź HTTP 204 No Content lub odpowiedni błąd

## 5. Względy bezpieczeństwa

- **Uwierzytelnianie**: weryfikacja sesji użytkownika z `context.locals.user` (obsłużone w middleware)
- **Autoryzacja**: usuwanie tylko zasobów należących do zalogowanego użytkownika (filtr `user_id`)
- **Walidacja**: Zod do bezpiecznego parsowania i walidacji `flashcardId`
- **Ochrona przed wstrzyknięciami**: zapytania Supabase korzystają z parametrów, brak ręcznego składania SQL

## 6. Obsługa błędów

| Scenario                                      | Status | Opis                                     |
| --------------------------------------------- | ------ | ---------------------------------------- |
| Brak sesji / niezalogowany                    | 401    | Zwracamy `Unauthorized`                  |
| Nieprawidłowy `flashcardId`                   | 400    | Zod zwraca błąd walidacji                |
| Fiszka nie istnieje lub nie jest właścicielem | 404    | Brak zasobu do usunięcia                 |
| Błąd wewnętrzny serwera                       | 500    | Logujemy szczegóły, zwracamy ogólny błąd |

## 7. Rozważania dotyczące wydajności

- Operacja kasowania po kluczu głównym jest indeksowana i szybka
- Brak masowych operacji – niska złożoność

## 8. Kroki implementacji

1. Utworzyć plik `src/pages/api/flashcards/[flashcardId].ts` i zadeklarować `export const DELETE: APIRoute`
2. Zaimportować i skonfigurować Zod do walidacji parametru ścieżki
3. Pobierać `supabase` i `user.id` z `context.locals`
4. Wykonać walidację `flashcardId`; w przypadku błędu zwrócić 400
5. Zaimportować lub utworzyć metodę `deleteFlashcardById` w `src/lib/services/flashcards.service.ts`
6. W serwisie wykonać zapytanie do Supabase z filtrem `flashcard_id` i `user_id`; w przypadku braku wiersza rzucić 404
7. Obsłużyć możliwe błędy i zwrócić odpowiednie kody 401, 404, 500
8. Zwizualizować sukces poprzez zwrot 204 No Content
9. Napisać testy jednostkowe w Vitest, mockując Supabase i scenariusze błędów
10. Dodanie dokumentacji w `README.md` i ewentualnie w generowanym Swagger/OAS
