# Architektura UI dla Fiszek

## 1. Przegląd struktury UI

System UI Fiszki składa się z zestawu widoków dedykowanych różnym funkcjonalnościom, takim jak autoryzacja użytkownika, zarządzanie fiszkami (tworzenie, edycja, usuwanie), generowanie fiszek przez AI, sesje powtórek oraz panel użytkownika. Całość korzysta z gotowych komponentów shadcn/ui, a także React. Interfejs projektowany jest zgodnie z zasadami dostępności (WCAG AA) i wykorzystuje Tailwind CSS do responsywnego layoutu.

## 2. Lista widoków

- **Widok logowania**

  - Ścieżka: `/login`
  - Główny cel: Umożliwienie użytkownikowi logowania do systemu.
  - Kluczowe informacje: Formularz z polami "Email" oraz "Hasło", link do widoku rejestracji.
  - Kluczowe komponenty: Formularz logowania, inline error messages, toast notifications dla błędów API.
  - UX / Dostępność / Bezpieczeństwo: Prosty, czytelny formularz, walidacja danych w czasie rzeczywistym i ochrona przed atakami poprzez mechanizmy API.

- **Widok rejestracji**

  - Ścieżka: `/register`
  - Główny cel: Umożliwienie nowym użytkownikom założenia konta.
  - Kluczowe informacje: Formularz rejestracji (pola: Email, Hasło, potwierdzenie hasła), link do widoku logowania.
  - Kluczowe komponenty: Formularz rejestracji, inline error messages, toast notifications.
  - UX / Dostępność / Bezpieczeństwo: Jasne komunikaty błędów, walidacja formularza, ochrona danych użytkowników.

- **Lista fiszek (widok Moje fiszki)**

  - Ścieżka: `/flashcards`
  - Główny cel: Prezentacja listy fiszek użytkownika z możliwością edycji i usuwania.
  - Kluczowe informacje: Lista fiszek sortowana według daty utworzenia/modyfikacji, przyciski akcji dla edycji i usuwania.
  - Kluczowe komponenty: Lista karteczek, przycisk otwierający modal do generowania fiszek przez AI, przycisk dodania manualnego.
  - UX / Dostępność / Bezpieczeństwo: Responsywny układ, intuicyjne ikony, dostępne komunikaty przy interakcji.

- **Ekran generowania fiszek przez AI**

  - Ścieżka: `/generate`
  - Główny cel: Umożliwienie generowania fiszek przy użyciu AI i ich rewizję (zaakceptuj, edytuj, odrzuć)
  - Kluczowe informacje: Modal z tekstowym polem wejściowym, licznik znaków, komunikat o przekroczeniu limitu, przyciski do akceptacji generowanych fiszek, odrzucenia lub ich edycji.
  - Kluczowe komponenty: Modal z text area, przyciski "Zapisz Wszystkie" i "Zapisz Zaakceptowane", live validation z tooltipem, przyciski "Zaakceptuj", "Odrzuć", "Edytuj" na każdej karcie z fiszką
  - UX / Dostępność / Bezpieczeństwo: Natychmiastowa walidacja, czytelne inline komunikaty błędów.

- **Ekran tworzenia manualnej fiszki**

  - Ścieżka: `/flashcards/new`
  - Główny cel: Pozwolenie użytkownikowi na ręczne dodawanie fiszek.
  - Kluczowe informacje: Formularz z polami "Pytanie" (front) i "Odpowiedź" (back).
  - Kluczowe komponenty: Formularz dodawania fiszki, inline error messages.
  - UX / Dostępność / Bezpieczeństwo: Prosty formularz, natychmiastowa walidacja, ochrona przed nieprawidłowymi danymi - inline komunikaty błędów.

- **Panel użytkownika**

  - Ścieżka: `/user`
  - Główny cel: Prezentacja informacji o użytkowniku.
  - Kluczowe informacje: Avatar, dane profilowe.
  - Kluczowe komponenty: Komponent wyświetlający avatar.
  - UX / Dostępność / Bezpieczeństwo: Łatwy dostęp do ustawień, czytelny design, prawidłowe porządkowanie informacji.

- **Ekran sesji powtórek**
  - Ścieżka: `/session`
  - Główny cel: Umożliwienie użytkownikowi przeprowadzenia sesji nauki z fiszkami.
  - Kluczowe informacje: Prezentacja fiszki do powtórki, przyciski akceptacji/odrzucenia odpowiedzi.
  - Kluczowe komponenty: Widok pojedynczej fiszki, przyciski interakcji, wskaźnik postępu.
  - UX / Dostępność / Bezpieczeństwo: Intuicyjny interfejs, natychmiastowa reakcja na wybory użytkownika.

## 3. Mapa podróży użytkownika

- Użytkownik wchodzi na stronę i zostaje przekierowany do widoku logowania.
- Po udanym logowaniu, jest przekierowywany do widoku generowania fiszek
- Użytkownik wprowadza tekst i inicjuje proces generowania fiszek.
- API zwraca listę propozycji fiszek, które są prezentowane na widoku generowania.
- Użytkownik przegląda propozycje i decyduje czy wiszki zaakceptować, odrzucić czy edytować (otwarcie modala edycji).
- Użytkownik zatwierdza wybrane fiszki i dokonuje zbiorczego zapisu przez interakcję z API.
- Użytkownik może skorzystać z topbara (nawigacji) i przejść do widoku listy fiszek.
- W widoku listy fiszek (Moje fiszki), może przeglądać, edytować lub usuwać fiszki.
- Użytkownik, poprzez nawigację, może przejść do panelu użytkownika, aby sprawdzić swoje informacje.
- Użytkownik, poprzez nawigację, może przejść do widoku manualnego tworzenia fiszki.

## 4. Układ i struktura nawigacji

- Główna nawigacja oparta jest na topbarze, wykorzystującym komponent Navigation Menu z shadcn/ui.
- Topbar zawiera:
  - Linki: Generuj Fiszki, Utwórz Fiszkę, Moje Fiszki, Sesja powtórek, Panel użytkownika.
  - Przyciski: Wyloguj
- Nawigacja jest widoczna na wszystkich stronach po zalogowaniu, zapewniając spójne doświadczenie.
- Dla widoków autoryzacji (logowanie, rejestracja) nawigacja jest uproszczona, skupiając się wyłącznie na funkcjonalnościach logowania.

## 5. Kluczowe komponenty

- **Topbar**: Komponent nawigacyjny umożliwiający szybki dostęp do kluczowych widoków.
- **Formularze autoryzacji**: Komponenty obsługujące logowanie oraz rejestrację z walidacją inline.
- **Lista fiszek**: Komponent prezentujący fiszki użytkownika z opcjami sortowania i akcji (edycja, usuwanie).
- **Modal AI**: Modal z dynamiczną walidacją tekstu i tooltipami, zawierający opcje akcjeptacji fiszek generowanych przez AI, ich edycję lub odrzucenie.
- **Komponent edycji fiszki**: Formularz umożliwiający edycję fiszki.
- **Komponent sesji powtórek**: Interaktywny widok do nauki, prezentujący fiszki z przyciskami akceptacji/odrzucenia odpowiedzi.
