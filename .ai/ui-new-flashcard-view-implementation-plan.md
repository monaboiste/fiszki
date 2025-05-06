# Plan implementacji widoku: Ekran tworzenia nowej fiszki manualnej

## 1. Przegląd

Widok umożliwia użytkownikowi ręczne dodawanie pojedynczych fiszek poprzez prosty formularz z polami „Pytanie” (front) i „Odpowiedź” (back). Po zatwierdzeniu fiszka zostaje zapisana na serwerze i użytkownik jest przekierowywany do listy fiszek, gdzie nowo utworzona pozycja pojawia się natychmiast.

## 2. Routing widoku

Ścieżka: `/flashcards/new`

## 3. Struktura komponentów

- `pages/flashcards/new.astro` (Astro): wrapper z Layout i React component
- `NewFlashcardView` (React): kontener strony z nagłówkiem i formularzem
  - `FlashcardForm` (React): formularz ręcznego tworzenia fiszki
    - `TextInput` (Shadcn/ui) – pole front
    - `Textarea` (Shadcn/ui) – pole back
    - `ErrorMessage` – inline message dla front/back
    - `Button`(Shadcn/ui) – zatwierdzenie formularza

## 4. Szczegóły komponentów

### NewFlashcardView

- Opis: Kontener całej strony, odpowiada za osadzenie Layoutu, tytuł i wyrenderowanie `FlashcardForm`.
- Główne elementy: `<Layout title="Create new flashcard">`, `<FlashcardForm />`
- Propsy: brak
- Zdarzenia: brak (czysta warstwa prezentacyjna)

### FlashcardForm

- Opis: Zarządza stanem pól formularza, walidacją i wysłaniem żądania do API.
- Główne elementy:
  - `TextInput` dla front: label "Pytanie"
  - `Textarea` dla back: label "Odpowiedź"
  - `ErrorMessage` pod każdym polem
  - `Button` Submit (disabled podczas wysyłki)
- Obsługiwane zdarzenia:
  - `onChange` dla obu pól → aktualizacja stanu
  - `onBlur` → walidacja pól
  - `onSubmit` → wywołanie `useCreateFlashcards`, przełączenie `isSubmitting`
- Warunki walidacji:
  - front: string, długość 1–200 znaków
  - back: string, długość 1–500 znaków
- Typy:
  - `FlashcardFormData` (front: string; back: string)
  - `CreateFlashcardsRequest` (`BulkCreateFlashcardsCommand`)
- Propsy: brak (samodzielna logika)

## 5. Typy

```ts
// ViewModel formularza
interface FlashcardFormData {
  front: string;
  back: string;
}

// DTO żądania
type CreateFlashcardsRequest = BulkCreateFlashcardsCommand & {
  flashcards: Array<{
    front: string;
    back: string;
    type: "manual";
    generation_id: null;
  }>;
};

// DTO odpowiedzi
type CreateFlashcardsResponse = BulkCreateFlashcardsResponseDto;
```

## 6. Zarządzanie stanem

- Lokalny stan w `FlashcardForm`: `front`, `back`, `errors`, `isSubmitting`, `apiError`.
- Custom hook `useFlashcardForm` może enkapsulować logikę walidacji Zod.
- Custom hook `useCreateFlashcards` zwraca funkcję `mutate` i stan (`isLoading`, `error`).

## 7. Integracja API

- Endpoint: POST `/api/flashcards`
- Żądanie: `CreateFlashcardsRequest` w body
- Odpowiedź: `CreateFlashcardsResponse` (status 201)
- W przypadku błędu 400: parsowanie `error.details` z Zod, mapowanie na `errors` w formularzu
- W przypadku 401: przekierowanie do `/login` lub wyświetlenie komunikatu o konieczności logowania

## 8. Interakcje użytkownika

1. Użytkownik wpisuje „Pytanie” i „Odpowiedź”.
2. Na blur lub przy próbie submit sprawdzane są warunki (min/max długości).
3. Po kliknięciu Submit formularz zostaje zablokowany, obok przycisku może się pojawić spinner.
4. Po powodzeniu: przekierowanie do `/flashcards`, gdzie lista odświeża się automatycznie.
5. Przy błędzie walidacji backendu: inline error pod odpowiednim polem.
6. Przy błędzie sieci/500: wyświetlenie ogólnego komunikatu/toasta.

## 9. Warunki i walidacja

- front: minimalnie 1, maksymalnie 200 znaków → sprawdzanie w Zod po stronie frontu jako guard clause
- back: minimalnie 1, maksymalnie 500 znaków → analogicznie
- type i generation_id: ustawiane statycznie, nie wystawiane w UI

## 10. Obsługa błędów

- Klient: blokada submit + inline errors
- Backend 400: mapowanie `details` → `errors[field]`
- 401: redirect → `/login`
- 500: globalny komunikat błędu (toast albo alert)

## 11. Kroki implementacji

1. Utworzyć plik `src/pages/flashcards/new.astro` z komponentem `NewFlashcardView` (client:load).
2. Zaimportować i załadować `FlashcardForm` w `NewFlashcardView`.
3. Zaimplementować `FlashcardForm`:
   - useState dla pól i stanu formularza
   - Zod-schema local do synchronizacji warunków walidacji
   - fetch POST `/api/flashcards` → użyć `useCreateFlashcards` hook
   - mapowanie błędów i redirect po sukcesie
4. Stylizacja formularza z Tailwind CSS + Shadcn/ui
5. Testy jednostkowe/pograniczne: walidacja pól, poprawne wywołanie API i właściwe zachowanie w odpowiedzi na kody.
6. Dodanie atrybutów dostępności (aria-invalid, aria-describedby)
7. Peer review i ewentualne poprawki.
