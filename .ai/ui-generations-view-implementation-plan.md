# Plan implementacji widoku: Ekran generowania fiszek przez AI

## 1. Przegląd

Widok umożliwia generowanie fiszek przy użyciu AI. Użytkownik wprowadza tekst wejściowy, a system generuje propozycje fiszek, które można zaakceptować, edytować lub odrzucić przed ostatecznym zapisem.

## 2. Routing widoku

Widok będzie dostępny pod ścieżką `/generate`.

## 3. Struktura komponentów

- **GenerationsView** Komponent stronowy, kontener widoku
  - **TextInputArea** Komponent tekstowy umożliwiający wprowadzenie tekstu, licznik znaków, live walidacja z tooltipem
  - **GenerateButton** Przycisk inicjujący generowanie fiszek
  - **FlashcardsItemList** Lista wyświetlająca wygenerowane fiszki
    - **FlashcardItem** Pojedyncza fiszka z przyciskami: "Zaakceptuj", "Odrzuć", "Edytuj"
  - **BulkSaveButton** dla globalnych przycisków: "Zapisz Wszystkie" oraz "Zapisz Zaakceptowane"
  - **SkeletonLoader** Komponent wskaźnika ładowania wyświetlany podczas oczekiwania na odpowiedź z API
  - **ErrorNotification** Komponent do wyświetlania komunikatu o błędach

## 4. Szczegóły komponentów

### GenerationsView

- **Opis:** Główny kontener widoku zarządzający stanem wejściowym oraz wynikami generacji.
- **Główne elementy:** Kontener strony, pole tekstowe, sekcja wyników generacji (FlashcardsList), loader i komunikaty o błędach
- **Obsługiwane interakcje:** Przekazywanie tekstu wejściowego, inicjowanie żądania generacji, odbiór wyników, interakcje z kartami fiszek (zatwierdzanie, edycja, odrzucenie) oraz przekazanie danych do zapisu.
- **Walidacja:** Sprawdzenie poprawności tekstu wejściowego (min. 20, max. 10000 znaków) przed wysłaniem żądania.
- **Typy:** RequestFlashcardGenerationCommand, CreateFlashcardProposalResponseDto.
- **Propsy:** Brak (komponent stronowy).

### TextInputArea

- **Opis:** Komponent służący do wprowadzenia tekstu wejściowego do generacji fiszek.
- **Główne elementy:** Textarea z licznikiem znaków, tooltip informujący o błędach walidacji, przycisk "Generuj fiszki".
- **Obsługiwane interakcje:** onChange (aktualizacja tekstu), onSubmit (przekazanie tekstu do rodzica w celu inicjacji generacji).
- **Walidacja:** Minimalna długość 20 znaków, maksymalna 10000 znaków; live walidacja z wyświetlaniem komunikatów przy przekroczeniu limitów.
- **Typy:** Lokalny stan tekstu, typy dla błędów walidacyjnych, RequestFlashcardGenerationCommand do wysyłania żądania
- **Propsy:** Callback do przekazania tekstu wejściowego do komponentu rodzica (GenerationsView).

### GenerateButton

- **Opis:** Przycisk do uruchamiania procesu generowania fiszek
- **Główne elementy:** Przycisk HTML z etykietą "Generuj fiszki"
- **Obsługiwane interakcje:** onClick, który wywołuje żądanie do API
- **Walidacja:** Nie dotyczy
- **Typy:** Funkcja callback na click
- **Propsy:** onClick, disabled (w zależności od stanu walidacji i ładowania)

### FlashcardsItemList

- **Opis:** Lista prezentująca wygenerowane fiszki.
- **Główne elementy:** Renderowanie tablicy komponentów FlashcardItem.
- **Obsługiwane interakcje:** Dynamiczne wyświetlanie fiszek, obsługa globalnych przycisków "Zapisz Wszystkie" i "Zapisz Zaakceptowane".
- **Walidacja:** Sprawdzenie, czy lista fiszek nie jest pusta przed wyświetleniem przycisków zapisu.
- **Typy:** Tablica FlashcardProposalViewModel.

### FlashcardItem

- **Opis:** Pojedyncza karta wyświetlająca szczegóły fiszki.
- **Główne elementy:** Prezentacja treści "front" i "back", przyciski akcji: "Zaakceptuj", "Odrzuć", "Edytuj".
- **Obsługiwane interakcje:** Zmiana statusu fiszki na zaakceptowany, odrzucony lub wejście w tryb edycji; emisja zdarzeń do aktualizacji globalnego stanu.
- **Walidacja:** Sprawdzenie, czy pola "front" (1-200 znaków) i "back" (1-500 znaków) są poprawne przy edycji.
- **Typy:** FlashcardProposalViewModel (rozszerzenie danych otrzymanych z API o pole statusu: "accepted", "rejected", "edited").
- **Propsy:** Dane fiszki, funkcje obsługi zmian statusu i edycji.

### BulkSaveButton

- **Opis:** Komponent zawiera przyciski umożliwiające zbior zy zapis wszystkich wygenerowanych fiszek lub tylko te zaakceptowane przez użytkownika. Wysyłanie danych do backendu.
- **Główne elementy:** Dwa przyciski: "Zapisz wszystkie" oraz "Zapisz zaakceptowane"
- **Obsługiwane interakcje:** onClick dla każdego przycisku, które wywołuję odpowiednią funkcję żądania do API
- **Walidacja:** Przycisk "Zapisz zaakceptowane" jest aktywny jedynie gdy istnieją fiszki do zapisu
- **Typy:** BulkCreateFlashcardsCommand
- **Propsy:** onSaveAll, onSaveAccepted, disabled

### SkeletonLoader

- **Opis:** Komponent wizualizacji ładowania danych (skeleton)
- **Główne elementy:** Skeleton initjujący strukturę kart, które będą wyświetlane
- **Obsługiwane interakcje:** Brak
- **Walidacja:** Nie dotyczy
- **Typy:** Stateless
- **Propsy:** Brak

### ErrorNotification

- **Opis:** Komponent wwyświetlający komunikaty o błędach (np. błędy API)
- **Główne elementy:** Komunikat tekstowy, ikona błędu
- **Obsługiwane interakcje:** Brak
- **Walidacja:** Nie dotyczy
- **Typy:** String
- **Propsy:** message

## 5. Typy

- **GenerationViewModel:**
  - generation_id: number
  - input_text: string
  - proposed_flashcards: FlashcardProposalViewModel[]
- **FlashcardProposalViewModel:**
  - front: string
  - back: string
  - type: "ai_generated" | "ai_generated_modified" | "manual"
  - generation_id?: number
  - status: "accepted" | "rejected" | "edited"
- **DTO z API:**
  - RequestFlashcardGenerationCommand
  - CreateFlashcardProposalResponseDto
  - BulkCreateFlashcardsCommand
  - BulkCreateFlashcardsResponseDto

## 6. Zarządzanie stanem

- Użycie hooków React (useState, useEffect) do zarządzania stanem:
  - Stan tekstu wejściowego w TextInputArea
  - Lista wygenerowanych fiszek (z dodatkowymi polami statusu) w GenerationsView
  - Flagi ładowania (isLoading) przy wywołaniach API

## 7. Integracja API

- **POST /generations:**
  - Żądanie: RequestFlashcardGenerationCommand
  - Odpowiedź: CreateFlashcardProposalResponseDto
- **POST /flashcards:**
  - Żądanie: BulkCreateFlashcardsCommand
  - Odpowiedź: BulkCreateFlashcardsResponseDto
- Walidacja pól zgodnie z typami zdefiniowanymi w `src/types.ts`.

## 8. Interakcje użytkownika

- Użytkownik wprowadza tekst wejściowy do pola tekstowego.
- System wyświetla licznik znaków i na bieżąco waliduje poprawność tekstu.
- Po kliknięciu przycisku "Generuj fiszki" następuje wywołanie API, a użytkownik widzi komunikat ładowania.
- Po otrzymaniu wyników, system wyświetla listę fiszek w komponencie FlashcardsItemList.
- Dla każdej fiszki użytkownik może:
  - Kliknąć "Zaakceptuj" – fiszka zostaje oznaczona jako zaakceptowana.
  - Kliknąć "Odrzuć" – fiszka zostaje oznaczona jako odrzucona.
  - Kliknąć "Edytuj" – fiszka przechodzi w tryb edycji umożliwiający modyfikację treści.
- Globalne przyciski BulkSaveButton umożliwiają zapisanie:
  - Wszystkich fiszek
  - Tylko zaakceptowanych fiszek

## 9. Warunki i walidacja

- Tekst wejściowy musi mieć od 20 do 10000 znaków.
- Pola fiszki: "front" (1-200 znaków) oraz "back" (1-500 znaków) muszą być niepuste i spełniać limity długości.
- Dynamiczna walidacja przy edycji fiszek z wyświetlaniem tooltipów przy błędach.
- Aktywacja globalnych przycisków zapisu zależy od statusu fiszek (np. "Zapisz Zaakceptowane" dostępny tylko, gdy co najmniej jedna fiszka jest zaakceptowana).

## 10. Obsługa błędów

- Wyświetlanie komunikatów błędów w przypadku nieudanych wywołań API (status 400, 401, 500).
- Lokalna walidacja wejścia z natychmiastowym feedbackiem (tooltipy, komunikaty przy polach formularza).
- Obsługa błędów przy zapisie fiszek z informacją "Wystąpił błąd, spróbuj ponownie" oraz logowaniem szczegółów błędów w konsoli.

## 11. Kroki implementacji

1. Utworzyć nową stronę widoku pod ścieżką `/generate` (np. `src/pages/generate.astro`).
2. Zaimplementować komponent `GenerationsView` jako główny kontener widoku.
3. Stworzyć komponent `TextInputArea` z textarea, licznikiem znaków oraz live walidacją.
4. Utworzyć komponenty `FlashcardsItemList` i `FlashcardItem` do prezentacji wyników generacji.
5. Skonfigurować zarządzanie stanem widoku i obsługi logiki wywołań API przy użyciu hooków React.
6. Zaimplementować integrację z API: wywołanie POST /generations przy generowaniu fiszek i POST /flashcards przy zapisie.
7. Dodać obsługę błędów i walidację wejścia oraz pól edycji fiszek.
8. Zastosować stylizację przy użyciu Tailwind CSS i komponentów z Shadcn/ui.
9. Przeprowadzić testy interakcji użytkownika oraz walidacji formularzy.
