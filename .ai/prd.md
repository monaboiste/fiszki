# Dokument wymagań produktu (PRD) - Fiszki

## 1. Przegląd produktu
Opis produktu: Aplikacja webowa umożliwiająca generowanie fiszek edukacyjnych przy wykorzystaniu
sztucznej inteligencji (AI) oraz manualne tworzenie, edycję i usuwanie fiszek.
Produkt ma na celu uproszczenie procesu tworzenia materiałów edukacyjnych i zwiększenie efektywności
nauki poprzez zastosowanie metody spaced repetition.

## 2. Problem użytkownika
- Ręczne tworzenie wysokiej jakości fiszek wymaga dużo czasu i wysiłku.
- Użytkownicy zniechęceni są długotrwałym procesem przygotowywania materiałów do spaced repetition.
- Brak zautomatyzowanego narzędzia do szybkiego generowania fiszek ogranicza efektywność nauki.

## 3. Wymagania funkcjonalne
- Generowanie fiszek przez AI na podstawie dowolnego tekstu wprowadzonego przez użytkownika.
 Model LLM proponuje zestaw fiszek (przód i tył).
- Manualne tworzenie fiszek z możliwością definiowania treści.
- Przeglądanie fiszek zapisanych przez użytkownika.
- Edycja i usuwanie już utworzonych fiszek.
- System kont użytkowników umożliwiający przechowywanie i zarządzanie fiszkami.
- Integracja fiszek z gotowym algorytmem powtórek, który umożliwia efektywną naukę metodą spaced repetition.

## 4. Granice produktu
- Brak implementacji własnego, zaawansowanego algorytmu powtórek (podobnego do SuperMemo lub Anki).
- Nie przewiduje się importu fiszek z różnych formatów plików (np. PDF, DOCX).
- Nie przewidziano funkcjonalności współdzielenia zestawów fiszek między użytkownikami.
- Brak integracji z innymi platformami edukacyjnymi.
- Produkt będzie dostępny wyłącznie jako aplikacja webowa, bez natywnych aplikacji mobilnych.

## 5. Historyjki użytkowników

US-001: Rejestracja użytkownika
- Tytuł: Rejestracja użytkownika
- Opis: Jako nowy użytkownik chcę móc zarejestrować się w systemie, aby mieć możliwość przechowywania
 i zarządzania moimi fiszkami w bezpieczny sposób.
- Kryteria akceptacji:
  - Użytkownik może utworzyć konto przy użyciu adresu email i hasła.

US-002: Logowanie użytkownika
- Tytuł: Logowanie użytkownika
- Opis: Jako zarejestrowany użytkownik chcę móc zalogować się do systemu, aby uzyskać dostęp do moich fiszek.
- Kryteria akceptacji:
  - System umożliwia logowanie przy użyciu poprawnych danych uwierzytelniających.

US-003: Generowanie fiszek przez AI
- Tytuł: Automatyczne generowanie fiszek
- Opis: Jako użytkownik chcę wprowadzić dowolny tekst, aby AI automatycznie wygenerowało zestaw fiszek.
- Kryteria akceptacji:
  - Po wprowadzeniu tekstu, system wyświetla opcję generowania fiszek przez AI.
  - AI generuje fiszki zawierające przód i tył bazujące na wprowadzonym tekście.
  - Użytkownik ma możliwość edycji wygenerowanych fiszek przed ich zatwierdzeniem.

US-004: Manualne tworzenie fiszek
- Tytuł: Ręczne dodawanie fiszek
- Opis: Jako użytkownik chcę mieć możliwość samodzielnego tworzenia fiszek, aby móc dodawać
 treści według własnego uznania.
- Kryteria akceptacji:
  - Istnieje formularz umożliwiający ręczne wprowadzenie tytułu, przodu i tyłu.
  - Nowo utworzone fiszki są natychmiast dodawane do listy fiszek.
  - System umożliwia późniejszą edycję i usunięcie fiszek.

US-005: Przeglądanie fiszek
- Tytuł: Wyświetlanie listy fiszek
- Opis: Jako użytkownik chcę przeglądać wszystkie moje fiszki w przejrzystej liście, aby łatwo
 odnaleźć potrzebne informacje.
- Kryteria akceptacji:
  - System wyświetla listę wszystkich fiszek przypisanych do danego konta.
  - Fiszki są sortowane według daty modyfikacji.
  - Użytkownik może wyszukiwać fiszki według tytułu.

US-006: Edycja i usuwanie fiszek
- Tytuł: Zarządzanie istniejącymi fiszkami
- Opis: Jako użytkownik chcę móc edytować i usuwać moje fiszki, aby utrzymać ich aktualność i porządek.
- Kryteria akceptacji:
  - Użytkownik może wybrać fiszkę do edycji i wprowadzić zmiany.
  - System umożliwia usunięcie fiszki po potwierdzeniu operacji.
  - Wszystkie zmiany są natychmiast zapisywane i widoczne.

US-007: Integracja z algorytmem powtórek
- Tytuł: Personalizowane powtórki
- Opis: Jako użytkownik chcę, aby moje fiszki były automatycznie integrowane z istniejącym algorytmem powtórek,
 aby móc planować efektywne sesje nauki przy wykorzystaniu metody spaced repetition.
- Kryteria akceptacji:
  - System synchronizuje fiszki z algorytmem powtórek.
  - Interfejs umożliwia monitorowanie postępów w nauce i dostosowywanie harmonogramu powtórek.

US-008: Sesja nauki
- Tytuł: Udział w sesji nauki
- Opis: Jako użytkownik chcę uczestniczyć w zaplanowanej sesji nauki, gdzie mogę przeglądać fiszki zaplanowane
 do powtórek, zaznaczać poprawność moich odpowiedzi oraz monitorować moje postępy, aby skutecznie korzystać z metody spaced repetition.
- Kryteria akceptacji:
  - Interfejs sesji nauki wyświetla listę fiszek zaplanowanych do powtórek.
  - Na start wyświetlany jest przód fiszki, poprzez interakcję użytkownik wyświetla jej tył.
  - Użytkownik może zaznaczyć, czy odpowiedź jest poprawna czy niepoprawna.
  - Następnie algorytm pokazuje kolejną fiszkę w ramach sesji nauki.
  - Po zakończeniu sesji wyniki są zapisywane, a harmonogram powtórek jest aktualizowany na podstawie wyników.
  - Interfejs umożliwia monitorowanie postępów, takich jak liczba poprawnych odpowiedzi oraz czas trwania sesji.

## 6. Metryki sukcesu
- 75% fiszek wygenerowanych przez AI jest akceptowane przez użytkowników, po ewentualnych edycjach.
- Użytkownicy wykorzystują funkcję generowania fiszek przez AI do tworzenia co najmniej 75% wszystkich fiszek.
