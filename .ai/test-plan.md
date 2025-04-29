# Plan Testów Aplikacji "10xFiszki"

## 1. Wprowadzenie i Cele Testowania

### 1.1 Wprowadzenie

Niniejszy dokument opisuje plan testów dla aplikacji webowej "10xFiszki". Aplikacja umożliwia użytkownikom generowanie fiszek edukacyjnych z podanego tekstu przy użyciu sztucznej inteligencji (AI), zarządzanie nimi (przeglądanie, edycja, akceptacja/odrzucenie) oraz ich zapisywanie. Projekt wykorzystuje technologie takie jak Astro, React, TypeScript, Tailwind CSS, Supabase (dla backendu, bazy danych i autentykacji) oraz OpenRouter (dla usług AI).

Celem planu jest zapewnienie systematycznego podejścia do weryfikacji jakości, funkcjonalności, niezawodności, wydajności i bezpieczeństwa aplikacji przed jej wdrożeniem.

### 1.2 Cele Testowania

Główne cele procesu testowania to:

- Weryfikacja, czy wszystkie funkcjonalności aplikacji działają zgodnie z wymaganiami i specyfikacją wynikającą z kodu.
- Identyfikacja i raportowanie defektów (błędów) w oprogramowaniu.
- Zapewnienie stabilności i niezawodności aplikacji, w tym poprawnej obsługi błędów.
- Ocena użyteczności interfejsu użytkownika (UI) i doświadczenia użytkownika (UX).
- Weryfikacja bezpieczeństwa aplikacji, w szczególności autentykacji, autoryzacji i ochrony danych.
- Ocena wydajności kluczowych operacji (generowanie AI, zapis fiszek).
- Zapewnienie kompatybilności aplikacji z docelowymi przeglądarkami i urządzeniami.
- Potwierdzenie, że aplikacja spełnia kryteria akceptacji przed wdrożeniem.

## 2. Zakres Testów

### 2.1 Funkcjonalności objęte testami:

- **Moduł Autentykacji:**
  - Rejestracja nowego użytkownika (formularz, walidacja, API, proces potwierdzenia email).
  - Logowanie zarejestrowanego użytkownika (formularz, walidacja, API, obsługa błędnych danych).
  - Wylogowanie użytkownika.
  - Ochrona tras wymagających zalogowania (middleware).
- **Moduł Generowania Fiszek:**
  - Wprowadzanie tekstu źródłowego (walidacja długości).
  - Inicjowanie procesu generowania fiszek przez AI (przycisk, stan ładowania).
  - Interakcja z API generowania (`/api/flashcards/generate`).
  - Obsługa odpowiedzi z AI (parsing, wyświetlanie proponowanych fiszek).
  - Obsługa błędów podczas generowania (komunikaty dla użytkownika, logowanie błędów).
  - Wyświetlanie stanu ładowania (`SkeletonLoader`).
- **Moduł Zarządzania Fiszkami:**
  - Wyświetlanie listy wygenerowanych propozycji fiszek.
  - Akceptowanie, odrzucanie pojedynczych fiszek.
  - Edycja treści fiszek (front, back) wraz z walidacją długości.
  - Zapisywanie wszystkich wygenerowanych fiszek.
  - Zapisywanie tylko zaakceptowanych/edytowanych fiszek.
  - Interakcja z API zapisywania (`/api/flashcards/flashcards`).
  - Obsługa błędów podczas zapisywania.
  - Wyświetlanie komunikatów o sukcesie/błędzie zapisu.
  - Blokowanie interfejsu po zapisaniu.
- **Interfejs Użytkownika i Nawigacja:**
  - Poprawność wyświetlania layoutu i komponentów UI na różnych rozdzielczościach.
  - Działanie nawigacji (linki, przyciski).
  - Wyświetlanie informacji o zalogowanym użytkowniku.

### 2.2 Funkcjonalności wyłączone z testów (jeśli dotyczy):

- (Na ten moment zakłada się pełne pokrycie funkcjonalne. Ewentualne wyłączenia zostaną określone w przyszłości).
- Bezpośrednie testowanie infrastruktury Supabase/OpenRouter (traktowane jako zewnętrzne zależności).

## 3. Typy Testów do Przeprowadzenia

- **Testy Jednostkowe (Unit Tests):**
  - **Cel:** Weryfikacja poprawności działania izolowanych fragmentów kodu (funkcje, komponenty React, serwisy).
  - **Zakres:** Logika walidacji (np. `auth.ts`, walidacja w komponentach), funkcje pomocnicze (`utils.ts`), logika serwisów (np. `generation.service` z mockowanymi zależnościami, `flashcards.service`), proste komponenty React.
- **Testy Integracyjne (Integration Tests):**
  - **Cel:** Weryfikacja współpracy pomiędzy różnymi modułami/komponentami systemu.
  - **Zakres:**
    - Testy API: Sprawdzenie endpointów (`/api/auth/*`, `/api/flashcards/*`) pod kątem poprawności żądań, odpowiedzi, walidacji i interakcji z mockowanymi lub testowymi instancjami Supabase/OpenRouter.
    - Testy Komponentów React: Sprawdzenie interakcji pomiędzy komponentami (np. `GenerationsView` z `FlashcardsItemList` i `FlashcardItem`), weryfikacja przepływu danych i stanu.
    - Testy Middleware: Weryfikacja logiki ochrony tras.
    - Testy Serwisów z Bazą Danych: Sprawdzenie interakcji serwisów (`flashcards.service`) z testową instancją bazy danych Supabase.
- **Testy End-to-End (E2E Tests):**
  - **Cel:** Symulacja rzeczywistych scenariuszy użytkownika w przeglądarce, weryfikacja przepływu danych przez całą aplikację.
  - **Zakres:** Kluczowe przepływy użytkownika (rejestracja-logowanie-generowanie-zarządzanie-zapis-wylogowanie), interakcja z UI, weryfikacja renderowania stron Astro (SSR/Client).
- **Testy Funkcjonalne:**
  - **Cel:** Weryfikacja, czy aplikacja działa zgodnie ze specyfikacją funkcjonalną (częściowo pokrywane przez E2E i Integracyjne). Mogą obejmować również testy manualne.
- **Testy Użyteczności (Usability Testing):**
  - **Cel:** Ocena łatwości obsługi interfejsu, intuicyjności nawigacji i ogólnego doświadczenia użytkownika.
  - **Zakres:** Przeprowadzone manualnie, potencjalnie z udziałem użytkowników końcowych (jeśli możliwe).
- **Testy Wydajnościowe (Performance Testing):**
  - **Cel:** Ocena czasu odpowiedzi i zużycia zasobów dla kluczowych operacji.
  - **Zakres:** Testowanie czasu generowania fiszek (API `/api/flashcards/generate`), czasu zapisywania wielu fiszek (API `/api/flashcards/flashcards`), potencjalnie czas ładowania strony `generate.astro`.
- **Testy Bezpieczeństwa (Security Testing):**
  - **Cel:** Identyfikacja potencjalnych luk bezpieczeństwa.
  - **Zakres:** Testowanie ochrony tras, walidacji danych wejściowych (pod kątem np. XSS), potencjalnie weryfikacja uprawnień (jeśli zaimplementowano RLS w Supabase), manualny przegląd kodu pod kątem bezpieczeństwa.
- **Testy Kompatybilności (Compatibility Testing):**
  - **Cel:** Zapewnienie poprawnego działania aplikacji na różnych przeglądarkach i urządzeniach.
  - **Zakres:** Manualne lub automatyczne (E2E) testy na głównych przeglądarkach (Chrome, Firefox, Safari, Edge) i różnych rozmiarach viewportu (desktop, tablet, mobile).
- **Testy Regresji Wizualnej (Visual Regression Testing):**
  - **Cel:** Wykrywanie niezamierzonych zmian w wyglądzie interfejsu użytkownika.
  - **Zakres:** Porównywanie zrzutów ekranu kluczowych widoków/komponentów pomiędzy kolejnymi wersjami aplikacji. (Opcjonalne, zależne od dostępnych narzędzi).
- **Testy Dostępności (Accessibility Testing - a11y):**
  - **Cel:** Sprawdzenie, czy aplikacja jest dostępna dla osób z niepełnosprawnościami.
  - **Zakres:** Użycie narzędzi automatycznych (np. Axe DevTools) oraz manualna weryfikacja (nawigacja klawiaturą, kontrast, semantyka HTML).

## 4. Scenariusze Testowe dla Kluczowych Funkcjonalności

_(Przykładowe scenariusze wysokiego poziomu. Szczegółowe przypadki testowe zostaną opracowane osobno)_

**4.1 Autentykacja:**

- **SCN-AUTH-001:** Pomyślna rejestracja użytkownika z poprawnymi danymi i potwierdzeniem email.
- **SCN-AUTH-002:** Próba rejestracji z niepoprawnymi danymi (nieprawidłowy email, hasło za krótkie, hasła niezgodne).
- **SCN-AUTH-003:** Próba rejestracji z istniejącym adresem email.
- **SCN-AUTH-004:** Pomyślne logowanie użytkownika z poprawnymi danymi.
- **SCN-AUTH-005:** Próba logowania z niepoprawnymi danymi (błędny email, błędne hasło).
- **SCN-AUTH-006:** Pomyślne wylogowanie użytkownika.
- **SCN-AUTH-007:** Próba dostępu do strony chronionej (`/generate`) bez zalogowania (oczekiwane przekierowanie do `/auth/login`).
- **SCN-AUTH-008:** Próba dostępu do strony chronionej po zalogowaniu (oczekiwany sukces).

**4.2 Generowanie Fiszek:**

- **SCN-GEN-001:** Pomyślne wygenerowanie fiszek dla poprawnego tekstu wejściowego (minimalna, maksymalna, średnia długość).
- **SCN-GEN-002:** Próba generowania z tekstem zbyt krótkim (<20 znaków) - przycisk nieaktywny.
- **SCN-GEN-003:** Próba generowania z tekstem zbyt długim (>10000 znaków) - przycisk nieaktywny, walidacja widoczna.
- **SCN-GEN-004:** Wyświetlenie stanu ładowania (`SkeletonLoader`) podczas generowania.
- **SCN-GEN-005:** Poprawne wyświetlenie wygenerowanych propozycji fiszek (front, back, przyciski akcji).
- **SCN-GEN-006:** Obsługa błędu po stronie API AI (np. OpenRouter niedostępny) - wyświetlenie komunikatu błędu.
- **SCN-GEN-007:** Obsługa błędu parsowania odpowiedzi AI - wyświetlenie komunikatu błędu.
- **SCN-GEN-008:** Obsługa pustej odpowiedzi z AI (brak fiszek) - odpowiedni komunikat.

**4.3 Zarządzanie Fiszkami:**

- **SCN-MNG-001:** Akceptacja pojedynczej fiszki - zmiana wyglądu, statusu.
- **SCN-MNG-002:** Odrzucenie pojedynczej fiszki - zmiana wyglądu, statusu.
- **SCN-MNG-003:** Wejście w tryb edycji fiszki.
- **SCN-MNG-004:** Edycja treści fiszki (front/back) i zapisanie zmian - aktualizacja widoku, zmiana statusu na "edited".
- **SCN-MNG-005:** Próba zapisania edytowanej fiszki z niepoprawnymi danymi (puste pole, za długi tekst) - walidacja, blokada zapisu.
- **SCN-MNG-006:** Anulowanie edycji fiszki - powrót do poprzednich wartości.
- **SCN-MNG-007:** Pomyślne zapisanie wszystkich fiszek (przycisk "Save All").
- **SCN-MNG-008:** Pomyślne zapisanie tylko zaakceptowanych/edytowanych fiszek (przycisk "Save Accepted").
- **SCN-MNG-009:** Przycisk "Save Accepted" jest nieaktywny, gdy brak zaakceptowanych/edytowanych fiszek.
- **SCN-MNG-010:** Wyświetlenie komunikatu sukcesu po zapisaniu fiszek.
- **SCN-MNG-011:** Wyświetlenie komunikatu błędu w przypadku niepowodzenia zapisu fiszek.
- **SCN-MNG-012:** Blokada przycisków akcji i edycji po pomyślnym zapisaniu fiszek.

## 5. Środowisko Testowe

- **Środowisko Frontend:** Lokalne środowisko deweloperskie.
- **Środowisko Backend (API):** Lokalne uruchomienie API (Astro dev server).
- **Baza Danych:** Dedykowana instancja Supabase dla środowiska testowego (nie produkcyjna!).
- **Serwis AI:**
  - Dla testów jednostkowych/integracyjnych: Mock API OpenRouter.
  - Dla testów E2E/manualnych na Staging: Możliwe użycie rzeczywistego API OpenRouter (z kluczem testowym/niskim limitem) lub dedykowanego mock serwera.
- **Przeglądarki:** Najnowsze wersje Chrome, Firefox, Safari, Edge.
- **Urządzenia:** Desktop (różne rozdzielczości), symulacja urządzeń mobilnych/tabletów w narzędziach deweloperskich przeglądarki.

## 6. Narzędzia do Testowania

- **Testy Jednostkowe/Integracyjne Komponentów React:** Vitest, React Testing Library (`@testing-library/react`).
- **Testy Integracyjne API:** Vitest z biblioteką do wysyłania żądań HTTP (np. `supertest`, `node-fetch`).
- **Testy E2E:** Playwright (preferowany dla Astro/React).
- **Testy Wydajnościowe:** Narzędzia deweloperskie przeglądarki (zakładka Network, Performance), k6 (dla testów obciążeniowych API).
- **Testy Bezpieczeństwa:** OWASP ZAP (podstawowe skanowanie), narzędzia deweloperskie przeglądarki, manualny przegląd.
- **Testy Dostępności:** Axe DevTools (rozszerzenie przeglądarki lub integracja z E2E), manualna weryfikacja.
- **Testy Regresji Wizualnej (Opcjonalnie):** Chromatic, Percy, Playwright (pixelmatch).
- **Zarządzanie Testami / Raportowanie Błędów:** Jira, Trello, GitHub Issues lub inne dedykowane narzędzie.
- **Mockowanie/Stubowanie:** `msw` (Mock Service Worker), `nock`, `sinon`, wbudowane funkcje mockowania Vitest/Jest.

## 7. Harmonogram Testów

_(Harmonogram zostanie dostosowany do planu rozwoju projektu. Poniżej ogólny zarys)_

- **Faza 1: Planowanie i Przygotowanie:** [Data rozpoczęcia] - [Data zakończenia]
  - Finalizacja planu testów.
  - Przygotowanie środowiska testowego.
  - Przygotowanie danych testowych.
  - Wybór i konfiguracja narzędzi.
- **Faza 2: Wykonywanie Testów (Iteracyjne):** Równolegle z rozwojem kolejnych funkcjonalności.
  - Testy jednostkowe i integracyjne: Wykonywane przez deweloperów podczas implementacji.
  - Testy API: Po wdrożeniu endpointów na środowisko testowe.
  - Testy E2E: Po zintegrowaniu kluczowych przepływów.
  - Testy manualne (funkcjonalne, użyteczności, eksploracyjne): Regularnie, po wdrożeniu nowych wersji na Staging.
- **Faza 3: Testy Regresji:** Przed każdym planowanym wdrożeniem na produkcję.
- **Faza 4: Testy Akceptacyjne Użytkownika (UAT - jeśli dotyczy):** [Data rozpoczęcia] - [Data zakończenia]
- **Faza 5: Finalizacja i Raportowanie:** Po zakończeniu cyklu testowego.

## 8. Kryteria Akceptacji Testów

### 8.1 Kryteria Wejścia (Rozpoczęcia Testów):

- Dostępność stabilnej wersji aplikacji na środowisku testowym/stagingowym.
- Dostępność dokumentacji (jeśli istnieje) lub opis funkcjonalności wynikający z zadań/historyjek.
- Przygotowane środowisko testowe i dane testowe.
- Zakończone testy jednostkowe i podstawowe integracyjne dla testowanej funkcjonalności (checklista dewelopera).

### 8.2 Kryteria Wyjścia (Zakończenia Testów / Gotowości do Wdrożenia):

- Wykonanie wszystkich zaplanowanych scenariuszy testowych (E2E, integracyjne, manualne) dla danego wydania.
- Osiągnięcie wymaganego poziomu pokrycia kodu testami (jeśli zdefiniowano, np. >70% dla kluczowych modułów).
- Brak otwartych błędów krytycznych (blokujących) i wysokiego priorytetu.
- Liczba błędów średniego i niskiego priorytetu mieści się w akceptowalnych granicach (zgodnie z ustaleniami zespołu).
- Wszystkie zgłoszone błędy krytyczne i wysokiego priorytetu zostały naprawione i retestowane pomyślnie.
- Pozytywne przejście testów regresji.
- Zatwierdzenie wyników testów przez interesariuszy (np. Product Ownera, Lidera Technicznego).

## 9. Role i Odpowiedzialności w Procesie Testowania

- **Inżynier QA / Tester:**
  - Tworzenie i aktualizacja planu testów oraz przypadków testowych.
  - Konfiguracja i utrzymanie środowiska testowego (we współpracy z DevOps/Developerami).
  - Przygotowanie danych testowych.
  - Wykonywanie testów manualnych (funkcjonalnych, eksploracyjnych, użyteczności, kompatybilności, a11y).
  - Implementacja i utrzymanie automatycznych testów (API, E2E, wydajnościowych - w zależności od umiejętności i ustaleń).
  - Raportowanie znalezionych błędów.
  - Retestowanie naprawionych błędów.
  - Przygotowywanie raportów z postępów i wyników testów.
- **Deweloperzy:**
  - Implementacja testów jednostkowych i integracyjnych dla tworzonego kodu.
  - Naprawianie błędów zgłoszonych przez QA/Testerów.
  - Wsparcie w konfiguracji środowiska testowego.
  - Przegląd kodu pod kątem jakości i potencjalnych problemów.
- **Product Owner / Manager Projektu:**
  - Definiowanie wymagań i kryteriów akceptacji.
  - Priorytetyzacja błędów.
  - Udział w testach akceptacyjnych (UAT).
  - Podejmowanie decyzji o wdrożeniu na podstawie wyników testów.
- **Lider Techniczny / Architekt:**
  - Definiowanie strategii testowania (we współpracy z QA).
  - Nadzór nad jakością kodu i testów.
  - Pomoc w rozwiązywaniu złożonych problemów technicznych związanych z testowaniem.

## 10. Procedury Raportowania Błędów

1.  **Identyfikacja Błędu:** Podczas wykonywania testów (manualnych lub automatycznych) tester identyfikuje niezgodność działania aplikacji z oczekiwaniami.
2.  **Reprodukcja Błędu:** Tester próbuje odtworzyć błąd, aby upewnić się, że jest on powtarzalny i zrozumieć kroki prowadzące do jego wystąpienia.
3.  **Rejestracja Błędu:** Tester rejestruje błąd w systemie do śledzenia błędów (np. Jira, GitHub Issues), podając następujące informacje:
    - **Tytuł:** Krótki, zwięzły opis problemu.
    - **Opis:** Szczegółowy opis błędu, w tym:
      - Kroki do reprodukcji (numerowane, precyzyjne).
      - Obserwowany rezultat (co się stało).
      - Oczekiwany rezultat (co powinno się stać).
    - **Środowisko:** Wersja aplikacji, przeglądarka, system operacyjny, środowisko testowe (np. Staging, Local).
    - **Priorytet:** Pilność naprawy błędu (np. Krytyczny, Wysoki, Średni, Niski).
    - **Waga/Severity:** Wpływ błędu na działanie aplikacji (np. Blocker, Critical, Major, Minor, Trivial).
    - **Załączniki:** Zrzuty ekranu, nagrania wideo, logi (jeśli relevantne).
    - **Przypisanie:** Początkowo do Lidera Technicznego lub bezpośrednio do dewelopera (zgodnie z ustaleniami zespołu).
4.  **Analiza i Priorytetyzacja:** Lider Techniczny/Product Owner analizuje zgłoszony błąd i potwierdza/koryguje jego priorytet.
5.  **Naprawa Błędu:** Przypisany deweloper naprawia błąd.
6.  **Retestowanie:** Po wdrożeniu poprawki na środowisko testowe, tester wykonuje retest, aby zweryfikować, czy błąd został poprawnie naprawiony i czy poprawka nie wprowadziła nowych problemów (testy regresji wokół poprawki).
7.  **Zamknięcie Błędu:** Jeśli retest zakończył się sukcesem, tester zamyka zgłoszenie błędu. Jeśli błąd nadal występuje, zgłoszenie jest ponownie otwierane z odpowiednim komentarzem.
