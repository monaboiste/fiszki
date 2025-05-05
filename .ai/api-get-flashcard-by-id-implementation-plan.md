# API Endpoint Implementation Plan: GET /flashcards/{flashcardId}

## 1. Przegląd punktu końcowego

- Endpoint służy do pobierania szczegółowych informacji o konkretnej fiszce.
- Wymaga uwierzytelnienia (401 gdy brak autoryzacji).
- Zwraca dane fiszki dla podanego identyfikatora.

## 2. Szczegóły żądania

- **Metoda HTTP**: GET
- **Struktura URL**: /flashcards/{flashcardId}
- **Parametry ścieżki**:
  - `flashcardId` (integer) – identyfikator fiszki (wymagany)
- **Request Body**: Brak

## 3. Wykorzystywane typy

- **FlashcardDto**: reprezentuje dane fiszki, w tym pola:
  - `flashcard_id`, `user_id`, `generation_id`, `front`, `back`, `type`, `created_at`, `updated_at`
- Pozostałe DTO lub command modele nie są potrzebne dla tego endpointu.

## 4. Szczegóły odpowiedzi

- **Kod sukcesu**: 200 (OK)
- **Przykładowa odpowiedź**:

```json
{
  "flashcard_id": 1,
  "user_id": "1",
  "generation_id": null,
  "front": "Pytanie 1",
  "back": "Odpowiedź 1",
  "type": "manual",
  "created_at": "2023-06-01T12:00:00Z",
  "updated_at": "2023-06-01T12:00:00Z"
}
```

- **Kody błędów**:
  - 404 (Not Found) – fiszka nie istnieje
  - 401 (Unauthorized) – brak uwierzytelnienia
  - 500 (Internal Server Error) – błąd serwera

## 5. Przepływ danych

1. Klient wysyła żądanie GET /flashcards/{flashcardId} z parametrem ścieżki.
2. Middleware uwierzytelniający (np. wykorzystujący Supabase) weryfikuje token użytkownika.
3. Warstwa serwisowa pobiera dane fiszki z bazy danych przy użyciu flashcardId.
4. W przypadku nieznalezienia fiszki, generowany jest błąd 404.
5. W przypadku sukcesu, dane są mapowane na strukturę FlashcardDto i zwracane jako odpowiedź JSON.

## 6. Względy bezpieczeństwa

- **Uwierzytelnienie i autoryzacja**: Endpoint musi weryfikować token użytkownika przy pomocy Supabase.
- **Row-Level Security** w Supabase (policy: `user_id = auth.uid()`).
- **Walidacja wejściowa**: Sprawdzenie, czy `flashcardId` jest prawidłowym integerem.

## 7. Obsługa błędów

- **401 Unauthorized**: Brak poprawnych danych uwierzytelniających.
- **404 Not Found**: Fiszka o podanym `flashcardId` nie istnieje.
- **400 Bad Request**: Nieprawidłowy format parametru `flashcardId`.
- **500 Internal Server Error**: Błąd nieoczekiwany; logowanie błędów przy użyciu centralnego loggera.

## 8. Rozważania dotyczące wydajności

- **Indeksowanie**: Kolumna `flashcard_id` powinna być zindeksowana w bazie danych dla szybkiego wyszukiwania.
- **Caching**: Rozważenie cachowania często pobieranych fiszek.

## 9. Etapy wdrożenia

1. **Implementacja warstwy serwisowej**:

   - Stworzenie funkcji do pobierania danych fiszki na podstawie `flashcardId` `getFlashcardById` w `src/lib/services/flashcards.service.ts`
   - Implementacja logiki walidacji wejścia i obsługi błędów.

2. **Implementacja endpointu API**:

   - Utworzenie pliku w `src/pages/api/flashcards/[flashcardId].ts`.
   - Mapowanie parametrów ścieżki i wywołanie odpowiedniej funkcji serwisowej.
   - Formatowanie odpowiedzi według schematu FlashcardDto oraz ustawienie poprawnych kodów statusu.

3. **Testowanie**:

   - Testy jednostkowe funkcji serwisowej oraz integracyjne Endpointu API.
   - Testowanie scenariuszy: poprawne dane, brak autoryzacji, nieistniejący identyfikator, błędny format parametru.

4. **Dokumentacja i wdrożenie**:
   - Aktualizacja dokumentacji API.
