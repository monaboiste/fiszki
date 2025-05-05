# Plan implementacji widoku Moje fiszki

## 1. Przegląd

Widok "Moje fiszki" (`/flashcards`) jest głównym interfejsem dla zalogowanego użytkownika do zarządzania swoimi fiszkami. Umożliwia przeglądanie listy istniejących fiszek, wyszukiwanie ich po tytule (fragmencie `front`), edycję treści oraz usuwanie niepotrzebnych fiszek.

## 2. Routing widoku

Widok powinien być dostępny pod ścieżką `/flashcards`. Dostęp do tego widoku wymaga uwierzytelnienia użytkownika.

## 3. Struktura komponentów

Struktura opiera się na stronie Astro renderującej główny komponent React, który zarządza logiką i stanem widoku.

```
src/pages/flashcards.astro        # Strona Astro
└── src/components/FlashcardsView.tsx (client:load) # Główny komponent React
    ├── Nagłówek strony (np. <h1>Moje fiszki</h1>)
    ├── src/components/FlashcardsSearchFilter.tsx # Komponent wyszukiwania
    │   └── Input (np. Shadcn Input)
    ├── src/components/FlashcardsList.tsx       # Komponent listy fiszek
    │   ├── Tabela (np. Shadcn Table) lub Lista Kart (np. Shadcn Card)
    │   │   └── FlashcardItem (komponent Card)
    │   │       ├── Wyświetlenie danych fiszki (front, back?, data)
    │   │       ├── Przycisk "Edytuj" (np. Shadcn Button)
    │   │       └── Przycisk "Usuń" (np. Shadcn Button)
    │   └── Kontrolki Paginacji (np. Shadcn Pagination)
    ├── src/components/EditFlashcardDialog.tsx  # Komponent modalu edycji
    │   └── Formularz edycji (z polami front, back i walidacją)
    └── src/components/DeleteConfirmationDialog.tsx # Komponent modalu potwierdzenia usunięcia
        └── Przyciski "Potwierdź" / "Anuluj"
```

## 4. Szczegóły komponentów

### `FlashcardsPage` (`src/pages/flashcards.astro`)

- **Opis komponentu**: Główna strona Astro dla ścieżki `/flashcards`. Odpowiada za ustawienie layoutu strony, tytułu i renderowanie komponentu `FlashcardsView.tsx` na kliencie.
- **Główne elementy**: `<Layout>`, `<FlashcardsView client:load />`.
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Brak.
- **Propsy**: Brak.

### `FlashcardsView` (`src/components/FlashcardsView.tsx`)

- **Opis komponentu**: Główny kontener React zarządzający stanem widoku listy fiszek. Odpowiada za pobieranie danych z API, filtrowanie (po stronie klienta), paginację, obsługę akcji użytkownika inicjowanych z listy (edycja, usuwanie) oraz renderowanie komponentów podrzędnych (lista, wyszukiwarka, modale).
- **Główne elementy**: `FlashcardsSearchFilter`, `FlashcardsList`, `EditFlashcardDialog`, `DeleteConfirmationDialog`. Logika pobierania danych (np. `useEffect`), zarządzanie stanem (np. `useState`, potencjalnie `useReducer` lub custom hook `useFlashcards`).
- **Obsługiwane interakcje**: Zmiana tekstu w wyszukiwarce, zmiana strony paginacji, inicjowanie edycji fiszki (z listy/grid), inicjowanie usuwania fiszki (z listy/grid).
- **Obsługiwana walidacja**: Sprawdzanie poprawności parametrów paginacji przed wysłaniem żądania API.
- **Typy**: `FlashcardsListResponseDto`, `FlashcardDto`, `FilterState` (custom), `ErrorState` (custom), `ViewState` (custom).
- **Propsy**: Brak.

### `FlashcardsSearchFilter` (`src/components/FlashcardsSearchFilter.tsx`)

- **Opis komponentu**: Prosty komponent zawierający pole tekstowe (np. Shadcn `Input`) do wprowadzania frazy wyszukiwania.
- **Główne elementy**: `label`, Shadcn `Input`.
- **Obsługiwane interakcje**: Zmiana wartości w polu tekstowym (`onChange`). Wartość przekazywana do `FlashcardsView` (np. przez callback prop). Zalecane użycie debouncingu.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Props: `searchTerm: string`, `onSearchChange: (term: string) => void`.
- **Propsy**: `searchTerm`, `onSearchChange`.

### `FlashcardsList` (`src/components/FlashcardsList.tsx`)

- **Opis komponentu**: Komponent odpowiedzialny za wyświetlanie listy fiszek (np. w formie tabeli Shadcn `Table` lub siatki kart Shadcn `Card`) oraz kontrolek paginacji (Shadcn `Pagination`). Renderuje poszczególne elementy listy/wiersze.
- **Główne elementy**: Shadcn `Table` (z `TableHeader`, `TableBody`, `TableRow`, `TableCell`) lub kontener dla `Card`, komponenty `FlashcardItem`, Shadcn `Pagination`.
- **Obsługiwane interakcje**: Kliknięcie przycisków "Edytuj" lub "Usuń" na poszczególnych elementach (propagacja zdarzenia w górę), kliknięcie kontrolek paginacji (propagacja zdarzenia w górę).
- **Obsługiwana walidacja**: Brak.
- **Typy**: Props: `flashcards: FlashcardDto[]`, `isLoading: boolean`, `pagination: { page: number, limit: number, total: number }`, `onEdit: (id: number) => void`, `onDelete: (id: number) => void`, `onPageChange: (page: number) => void`.
- **Propsy**: `flashcards`, `isLoading`, `pagination`, `onEdit`, `onDelete`, `onPageChange`.

### `FlashcardItem` (jako część `FlashcardsList`)

- **Opis komponentu**: Reprezentuje pojedynczą fiszkę (dedykowany komponent `Card`). Wyświetla jej dane (`front`, opcjonalnie `back`, datę modyfikacji) oraz przyciski akcji "Edytuj" i "Usuń".
- **Główne elementy**: Elementy HTML do wyświetlania danych (struktura `Card`), przyciski Shadcn `Button` ("Edytuj", "Usuń").
- **Obsługiwane interakcje**: Kliknięcie przycisku "Edytuj" (wywołuje `onEdit(flashcard.flashcard_id)`), kliknięcie przycisku "Usuń" (wywołuje `onDelete(flashcard.flashcard_id)`).
- **Obsługiwana walidacja**: Brak.
- **Typy**: Props: `flashcard: FlashcardDto`, `onEdit: (id: number) => void`, `onDelete: (id: number) => void`.
- **Propsy**: `flashcard`, `onEdit`, `onDelete`.

### `EditFlashcardDialog` (`src/components/EditFlashcardDialog.tsx`)

- **Opis komponentu**: Modal (Shadcn `Dialog`) zawierający formularz do edycji wybranej fiszki. Umożliwia zmianę pól `front` i `back`.
- **Główne elementy**: Shadcn `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`, `form`, Shadcn `Input`/`Textarea` dla `front` i `back`, Shadcn `Button` ("Zapisz", "Anuluj"). Logika walidacji (np. z `react-hook-form` + `zod`).
- **Obsługiwane interakcje**: Zmiana wartości w polach formularza, wysłanie formularza (submit), zamknięcie modalu.
- **Obsługiwana walidacja**: Walidacja pól formularza zgodnie z wymaganiami API:
  - `front`: wymagane, min 1 znak, max 200 znaków.
  - `back`: wymagane, min 1 znak, max 500 znaków.
    Wyświetlanie komunikatów o błędach walidacji. Dezaktywacja przycisku "Zapisz" w przypadku błędów lub podczas wysyłania.
- **Typy**: Props: `flashcard: FlashcardDto | null`, `isOpen: boolean`, `onClose: () => void`, `onSave: (id: number, data: UpdateFlashcardCommand) => Promise<void>`. Typy wewnętrzne dla stanu formularza i walidacji. `UpdateFlashcardCommand`.
- **Propsy**: `flashcard`, `isOpen`, `onClose`, `onSave`.

### `DeleteConfirmationDialog` (`src/components/DeleteConfirmationDialog.tsx`)

- **Opis komponentu**: Prosty modal (Shadcn `AlertDialog`) z zapytaniem o potwierdzenie usunięcia fiszki.
- **Główne elementy**: Shadcn `AlertDialog`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, Shadcn `AlertDialogCancel`, Shadcn `AlertDialogAction`.
- **Obsługiwane interakcje**: Kliknięcie przycisku "Potwierdź" (wywołuje `onConfirm`), kliknięcie przycisku "Anuluj" lub zamknięcie modalu (wywołuje `onClose`).
- **Obsługiwana walidacja**: Brak.
- **Typy**: Props: `flashcardId: number | null`, `isOpen: boolean`, `onClose: () => void`, `onConfirm: (id: number) => Promise<void>`.
- **Propsy**: `flashcardId`, `isOpen`, `onClose`, `onConfirm`.

## 5. Typy

Oprócz typów zdefiniowanych w `src/types.ts` (szczególnie `FlashcardDto`, `FlashcardsListResponseDto`, `UpdateFlashcardCommand`), będziemy potrzebować kilku niestandardowych typów/interfejsów po stronie frontendu:

- **`FilterState`**: Obiekt przechowujący aktualny stan filtrów, sortowania i paginacji.
  ```typescript
  interface FilterState {
    searchTerm: string; // Wyszukiwana fraza (dla filtrowania po 'front' po stronie klienta)
    page: number; // Aktualny numer strony
    limit: number; // Liczba elementów na stronie
    sort: "created_at" | "updated_at"; // Pole sortowania (wymagane 'updated_at')
    sort_direction: "asc" | "desc"; // Kierunek sortowania (wymagane 'desc')
  }
  ```
- **`ViewState`**: Typ literalny określający stan ładowania/interfejsu.
  ```typescript
  type ViewState = "idle" | "loading" | "error" | "submitting";
  ```
- **`ErrorState`**: Obiekt przechowujący informacje o błędzie.
  ```typescript
  interface ErrorState {
    message: string | null;
    details?: any; // Opcjonalne dodatkowe informacje o błędzie
  }
  ```

## 6. Zarządzanie stanem

Stan będzie zarządzany głównie w komponencie `FlashcardsView.tsx` przy użyciu hooków React (`useState`, `useCallback`). Kluczowe elementy stanu:

- `flashcardsData: FlashcardsListResponseDto | null`: Dane pobrane z API.
- `viewState: ViewState`: Aktualny stan ładowania/widoku.
- `error: ErrorState | null`: Informacje o błędzie.
- `filterState: FilterState`: Stan filtrów, sortowania i paginacji.
- `editingFlashcard: FlashcardDto | null`: Fiszka aktualnie edytowana.
- `deletingFlashcardId: number | null`: ID fiszki oczekującej na potwierdzenie usunięcia.
- `isEditDialogOpen: boolean`: Widoczność modalu edycji.
- `isDeleteDialogOpen: boolean`: Widoczność modalu potwierdzenia usunięcia.

Dla uproszczenia logiki pobierania danych i zarządzania stanem, można rozważyć stworzenie dedykowanego hooka `useFlashcards`, który enkapsulowałby logikę `fetch`, zarządzanie stanami `flashcardsData`, `viewState`, `error`, `filterState` oraz funkcje modyfikujące (`updateFlashcard`, `deleteFlashcard`, `refreshFlashcards`, `updateFilterState`).

## 7. Integracja API

Integracja będzie realizowana poprzez wywołania `fetch` do endpointów API zdefiniowanych w `src/pages/api/flashcards.ts` i `src/pages/api/flashcards/[flashcardId].ts`.

- **`GET /api/flashcards`**:
  - **Cel**: Pobranie listy fiszek.
  - **Wywołanie**: Przy ładowaniu komponentu, zmianie strony, (potencjalnie) zmianie sortowania, po udanej edycji/usunięciu.
  - **Parametry zapytania**: `page`, `limit`, `sort`, `sort_direction` (zgodnie ze stanem `filterState`). `filter` nie będzie używany do wyszukiwania po tytule (implementacja client-side).
  - **Typ odpowiedzi**: `FlashcardsListResponseDto`.
- **`PUT /api/flashcards/{flashcardId}`**:
  - **Cel**: Aktualizacja fiszki.
  - **Wywołanie**: Po zatwierdzeniu formularza w `EditFlashcardDialog`.
  - **Parametry ścieżki**: `flashcardId`.
  - **Typ Ciała Żądania**: `UpdateFlashcardCommand` (`{ front: string, back: string }`).
  - **Typ odpowiedzi**: `UpdateFlashcardResponseDto` (zawiera zaktualizowaną fiszkę `FlashcardDto`).
- **`DELETE /api/flashcards/{flashcardId}`**:
  - **Cel**: Usunięcie fiszki.
  - **Wywołanie**: Po potwierdzeniu w `DeleteConfirmationDialog`.
  - **Parametry ścieżki**: `flashcardId`.
  - **Typ odpowiedzi**: Brak (Status 204 No Content).

Wszystkie żądania muszą zawierać odpowiednie nagłówki (np. `Content-Type: application/json` dla PUT) i obsługiwać uwierzytelnianie (przekazywane przez Astro/Supabase).

## 8. Interakcje użytkownika

- **Ładowanie widoku**: Wyświetlany jest stan ładowania (`loading`), następnie pobierana jest pierwsza strona fiszek (`GET /api/flashcards?page=1&limit=10&sort=updated_at&sort_direction=desc`). Po otrzymaniu danych, wyświetlana jest lista lub komunikat o braku fiszek. W razie błędu, wyświetlany jest komunikat błędu.
- **Wpisywanie w polu wyszukiwania**: Wartość pola jest aktualizowana w stanie (`filterState.searchTerm`). Lista fiszek jest filtrowana po stronie klienta (porównanie `searchTerm` z `flashcard.front`, ignorując wielkość liter) i renderowana na nowo (z debouncingiem).
- **Kliknięcie "Edytuj"**: Stan `editingFlashcard` jest ustawiany na wybraną fiszkę, `isEditDialogOpen` na `true`. Otwiera się modal `EditFlashcardDialog` wypełniony danymi fiszki.
- **Zapisanie edycji (poprawna walidacja)**: Wywoływane jest `PUT /api/flashcards/{id}` z danymi z formularza. W trakcie zapisu wyświetlany jest stan `submitting` (np. deaktywacja przycisku "Zapisz"). Po sukcesie: modal jest zamykany, lista odświeżana (`GET /api/flashcards`), wyświetlany jest komunikat sukcesu (np. Toast). Po błędzie: wyświetlany jest komunikat błędu w modalu.
- **Anulowanie edycji**: Modal `EditFlashcardDialog` jest zamykany (`isEditDialogOpen = false`, `editingFlashcard = null`).
- **Kliknięcie "Usuń"**: Stan `deletingFlashcardId` jest ustawiany na ID wybranej fiszki, `isDeleteDialogOpen` na `true`. Otwiera się modal `DeleteConfirmationDialog`.
- **Potwierdzenie usunięcia**: Wywoływane jest `DELETE /api/flashcards/{id}`. W trakcie usuwania wyświetlany jest stan `submitting`. Po sukcesie: modal jest zamykany, lista odświeżana, wyświetlany jest komunikat sukcesu. Po błędzie: modal jest zamykany, wyświetlany jest komunikat błędu.
- **Anulowanie usunięcia**: Modal `DeleteConfirmationDialog` jest zamykany (`isDeleteDialogOpen = false`, `deletingFlashcardId = null`).
- **Zmiana strony (paginacja)**: Stan `filterState.page` jest aktualizowany. Wywoływane jest `GET /api/flashcards` z nowym numerem strony. Lista jest aktualizowana.

## 9. Warunki i walidacja

- **Dostęp do widoku**: Wymaga zalogowanego użytkownika (obsługiwane przez middleware Astro i `locals.user`).
- **Walidacja edycji fiszki (`EditFlashcardDialog`)**:
  - Pole `front` nie może być puste, maksymalnie 200 znaków.
  - Pole `back` nie może być puste, maksymalnie 500 znaków.
  - Walidacja odbywa się po stronie klienta przed wysłaniem żądania PUT. Komunikaty o błędach są wyświetlane przy odpowiednich polach. Przycisk "Zapisz" jest nieaktywny, jeśli formularz jest niepoprawny lub trwa wysyłanie.
- **Filtracja listy**: Odbywa się po stronie klienta na podstawie `filterState.searchTerm`, porównując z polem `front` fiszek (case-insensitive).
- **Sortowanie listy**: Zdefiniowane na stałe (`updated_at`, `desc`) i przekazywane do API w parametrach `sort` i `sort_direction`.
- **Paginacja**: Parametry `page` i `limit` są zarządzane w stanie `filterState` i przekazywane do API. Logika kontrolek paginacji musi poprawnie obliczać liczbę stron (`total` / `limit`) i dezaktywować przyciski "poprzednia"/"następna" na krańcach.

## 10. Obsługa błędów

- **Błędy sieciowe / API niedostępne**: Wykrywane w bloku `catch` przy wywołaniach `fetch`. Ustawiany jest stan `viewState` na `'error'` i wyświetlany ogólny komunikat błędu z możliwością ponowienia próby (np. przycisk "Spróbuj ponownie").
- **Błąd autoryzacji (401)**: Globalna obsługa (np. przekierowanie na stronę logowania) lub lokalne wyświetlenie komunikatu "Sesja wygasła, zaloguj się ponownie".
- **Fiszka nie znaleziona (404 na PUT/DELETE)**: Wyświetlenie komunikatu (np. Toast) "Nie znaleziono fiszki. Mogła zostać usunięta." Lista powinna zostać odświeżona.
- **Niepoprawne dane (400 na PUT)**: Błąd nie powinien wystąpić przy poprawnej walidacji po stronie klienta. Jeśli jednak się zdarzy, błędy z odpowiedzi API (`details`) powinny zostać wyświetlone w modalu edycji, lub wyświetlony ogólny komunikat "Niepoprawne dane".
- **Błąd serwera (500)**: Ustawienie stanu `viewState` na `'error'` i wyświetlenie ogólnego komunikatu "Wystąpił nieoczekiwany błąd serwera. Spróbuj ponownie później."
- **Błędy walidacji formularza edycji**: Wyświetlane bezpośrednio przy polach formularza w `EditFlashcardDialog`.

Należy używać komponentów typu Toast (wbudowanych w Shadcn sonner) do informowania użytkownika o sukcesie lub błędach operacji (edycja, usuwanie).

## 11. Kroki implementacji

1.  **Utworzenie strony Astro**: Stwórz plik `src/pages/flashcards.astro`. Skonfiguruj podstawowy layout i tytuł strony. Dodaj pusty komponent `FlashcardsView` i upewnij się, że jest renderowany po stronie klienta (`client:load`).
2.  **Implementacja `FlashcardsView` (struktura i stan)**: Stwórz plik `src/components/FlashcardsView.tsx`. Zdefiniuj podstawową strukturę komponentu (nagłówek, wyszukiwarka, lista). Zaimplementuj podstawowe zarządzanie stanem (`useState` dla `flashcardsData`, `viewState`, `error`, `filterState`, stanów dialogów).
3.  **Pobieranie danych**: Zaimplementuj logikę pobierania danych z `GET /api/flashcards` w `useEffect` w `FlashcardsView` (lub w hooku `useFlashcards`). Użyj stałych wartości dla sortowania (`updated_at`, `desc`). Obsłuż stany ładowania i błędów.
4.  **Implementacja `FlashcardsList` i `FlashcardItem`**: Stwórz komponent `src/components/FlashcardsList.tsx`. Użyj Shadcn grid do wyświetlenia danych przekazanych przez props `flashcards`. Zaimplementuj `FlashcardItem` jako komponent `Card`, wyświetlający dane fiszki i przyciski "Edytuj", "Usuń". Dodaj obsługę stanu `isLoading`.
5.  **Implementacja Paginacji**: Dodaj komponent Shadcn `Pagination` do `FlashcardsList`. Przekaż odpowiednie propsy (`page`, `limit`, `total`) i podłącz callback `onPageChange` do aktualizacji `filterState.page` w `FlashcardsView` i ponownego pobrania danych.
6.  **Implementacja Filtrowania (Client-side)**:
    - Stwórz komponent `src/components/FlashcardsSearchFilter.tsx` z Shadcn `Input`.
    - Podłącz `onChange` do aktualizacji `filterState.searchTerm` w `FlashcardsView` (z debouncingiem).
    - W `FlashcardsView`, przed przekazaniem `flashcardsData.flashcards` do `FlashcardsList`, przefiltruj je na podstawie `filterState.searchTerm`.
7.  **Implementacja Modalu Edycji (`EditFlashcardDialog`)**:
    - Stwórz komponent `src/components/EditFlashcardDialog.tsx` używając Shadcn `Dialog`.
    - Zbuduj formularz z polami `front` i `back` (Shadcn `Input`/`Textarea`).
    - Dodaj logikę walidacji (np. `react-hook-form` + `zod`).
    - Zaimplementuj logikę zapisu (`onSave` prop), która wywołuje `PUT /api/flashcards/{id}`. Obsłuż stany ładowania i błędy wewnątrz modalu.
    - Podłącz otwieranie/zamykanie modalu w `FlashcardsView` po kliknięciu przycisku "Edytuj" na elemencie listy (`FlashcardItem`).
8.  **Implementacja Modalu Potwierdzenia Usunięcia (`DeleteConfirmationDialog`)**:
    - Stwórz komponent `src/components/DeleteConfirmationDialog.tsx` używając Shadcn `AlertDialog`.
    - Zaimplementuj logikę potwierdzenia (`onConfirm` prop), która wywołuje `DELETE /api/flashcards/{id}`.
    - Podłącz otwieranie/zamykanie modalu w `FlashcardsView` po kliknięciu przycisku "Usuń" na elemencie (`FlashcardItem`).
9.  **Styling i Responsywność**: Dopracuj wygląd widoku używając Tailwind. Upewnij się, że lista i modale są responsywne i dobrze wyglądają na różnych rozmiarach ekranu (rozważ użycie `Card`).
10. **Obsługa Błędów i Powiadomienia**: Zaimplementuj wyświetlanie komunikatów o błędach (globalnych i w modalach) oraz powiadomień Toast o sukcesie operacji.
11. **Testowanie**: Dodaj podstawowe testy jednostkowe dla komponentów React (szczególnie formularza edycji i logiki filtrowania) oraz testy E2E (np. Playwright) sprawdzające przepływ przeglądania, edycji i usuwania.
