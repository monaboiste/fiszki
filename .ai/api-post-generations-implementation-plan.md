# API Endpoint Implementation Plan: POST /generations

## 1. Przegląd punktu końcowego

- Endpoint umożliwia zlecenie generacji fiszek przez AI na podstawie podanego tekstu wejściowego.
- Użytkownik przesyła żądanie zawierające `input_text`, które jest przetwarzane przez usługę generacji.
- Odpowiedź zawiera propozycje fiszek i identyfikator rekordu generacji.

## 2. Szczegóły żądania

- **Metoda HTTP**: POST
- **Struktura URL**: /api/generations
- **Parametry**:
  - **Wymagane w Request Body**:
    - `input_text` (string, maksymalnie 10000 znaków)
- **Przykładowe żądanie**:

```json
{
  "input_text": "Wyjaśnij teorię względności."
}
```

## 3. Wykorzystywane typy

- DTO/Command Model:
  - `RequestFlashcardGenerationCommand` (obsługuje pole: `input_text`)
  - `CreateFlashcardProposalResponseDto` (zawiera pola: `proposed_flashcards` oraz `generation_id`)

## 4. Szczegóły odpowiedzi

- **Kod sukcesu**: 201 (Created)
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

- **Kody błędów**:
  - 400 (Bad Request) - Nieprawidłowe dane wejściowe
  - 401 (Unauthorized) - Brak uwierzytelnienia
  - 500 (Internal Server Error) - Błąd po stronie serwera

## 5. Przepływ danych

1. Klient wysyła żądanie POST zawierające `input_text`.
2. Kontroler API weryfikuje token JWT (401 przy braku autoryzacji) oraz waliduje dane wejściowe przy użyciu np. zod.
3. Serwis (np. `generation.service`) odpala logikę:
   - Wywołanie zewnętrznego serwisu AI do generowania propozycji fiszek.
   - Utworzenie rekordu w tabeli `generations` z polami: `user_id` (pobrane z kontekstu autoryzacji), `input_text`, `generation_duration_ms`, `accepted` (domyślnie false), `model_used`.
4. W zależności od wyniku:
   - W przypadku sukcesu, zwrócenie danych (propozycje fiszek oraz `generation_id`) z kodem 201.
   - W przypadku błędów integracji, logowanie błędów do tabeli `ai_generation_logs` i zwrócenie odpowiedniego błędu.

## 6. Względy bezpieczeństwa

- **Uwierzytelnianie**: Weryfikacja tokenu JWT, odpowiedź 401 w przypadku braku lub niewłaściwego tokenu.
- **Walidacja**: Stosowanie walidacji danych wejściowych (np. przy użyciu zod) by uniemożliwić ataki typu injection i zapewnić zgodność z oczekiwanym schematem.
- **Bezpieczna komunikacja z bazą danych**: Używanie bezpiecznych zapytań parametryzowanych, integracja z Supabase, stosowanie reguł autoryzacji.

## 7. Obsługa błędów

- **400 (Bad Request)**: Gdy `input_text` nie spełnia wymagań walidacji (np. pusta wartość, przekroczenie limitu długości 10 000 znaków).
- **401 (Unauthorized)**: Gdy token uwierzytelniający jest nieobecny lub nieważny.
- **500 (Internal Server Error)**: W przypadku nieoczekiwanych błędów serwerowych lub problemów z integracją z serwisem AI.
- **Logowanie błędów**: Wszelkie błędy podczas generacji mają być logowane w tabeli `ai_generation_logs` z odpowiednimi polami np. `error_code` i `error_description`.

## 8. Rozważania dotyczące wydajności

- **Optymalizacja przetwarzania**: Monitorowanie czasu generacji fiszek i skalowanie usługi AI, jeśli to konieczne.
- **Cache'owanie**: Rozważenie cache'owania wyników, jeżeli logika generacji pozwala na ponowne użycie wyników.
- **Asynchroniczność**: Jeśli operacje są czasochłonne, rozważenie użycia kolejek asynchronicznych by nie blokować głównego wątku serwera.

## 9. Etapy wdrożenia

1. **Walidacja wejścia**: Implementacja walidacji danych wejściowych przy użyciu zod w warstwie kontrolera.
2. **Autoryzacja**: Sprawdzenie poprawności tokenu JWT i autoryzacji użytkownika.
3. **Implementacja serwisu**:
   - Utworzenie lub rozbudowa serwisu (np. `generation.service`) odpowiedzialnego za logikę generacji fiszek.
   - Integracja z zewnętrznym serwisem AI. Na etapie developmentu użyjemy mocka.
   - Operacje na bazie danych (wstawienie rekordu do tabeli `generations`, potencjalne logowanie błędów do tabeli `ai_generation_logs`).
4. **Endpoint API**: Utworzenie endpointu w odpowiednim pliku (np. w folderze /src/pages/api) z ustawieniem `export const prerender = false`.
5. **Testy**: Implementacja testów jednostkowych i integracyjnych sprawdzających pełny przepływ:
   - Walidacja wejścia
   - Autoryzacja
   - Logika generacji fiszek
   - Obsługa błędów
