# Specyfikacja modułu Autoryzacji - Rejestracja, Logowanie

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### Nowe Strony i Layouty

- Utworzenie dedykowanych stron Astro:
  - Rejestracja: `src/pages/auth/register.astro`
  - Logowanie: `src/pages/auth/login.astro`
- Rozdzielenie layoutów:
  - Layout dla stron auth (bez elementów dostępnych tylko dla zalogowanych użytkowników)
  - Layout dla stron non-auth (głównie publiczne strony oraz po zalogowaniu – dashboard i inne chronione strony)

### Komponenty i Formularze (Client-side React)

- Utworzenie komponentów React w katalogu `src/components/auth`:
  - `RegisterForm.tsx`:
    - Pola: email, hasło, potwierdzenie hasła
    - Walidacja: sprawdzenie formatu email, minimalnej długości hasła (np. min. 8 znaków) oraz zgodności dwóch pól hasła
    - Obsługa komunikatów błędów (np. pole wymagane, niezgodne hasła, email już zarejestrowany)
  - `LoginForm.tsx`:
    - Pola: email, hasło
    - Walidacja: sprawdzenie poprawności formatu email oraz obecności hasła
    - Komunikaty o błędach, np. niepoprawny email lub hasło

### Integracja z Backendem i Nawigacją

- Formularze realizują zapytania do endpointów API (np. przy użyciu fetch lub Axios) zlokalizowanych w `src/pages/api/auth`:
  - POST `/api/auth/register`
  - POST `/api/auth/login`
- Po udanym logowaniu następuje przekierowanie do strefy chronionej.
- Wszystkie błędy zarówno po stronie klienta, jak i serwera są przekazywane w formie przyjaznych komunikatów, wyświetlanych w interfejsie użytkownika.

## 2. LOGIKA BACKENDOWA

### Struktura Endpointów API

- Endpointy w katalogu `src/pages/api/auth`:

  - `register.ts` (POST):

    - Walidacja danych wejściowych (sprawdzenie formatu email, siły hasła, zgodności hasła).
    - Wykorzystanie Supabase Auth do utworzenia nowego użytkownika.
    - Zwrot informacji: sukces lub odpowiedni komunikat błędu (np. email już istnieje).

  - `login.ts` (POST):

    - Weryfikacja danych logowania.
    - Integracja z Supabase Auth w celu uwierzytelnienia użytkownika.
    - Zwrot tokenu sesji lub komunikatu o błędzie (np. niepoprawne dane uwierzytelniające).

  - (Opcjonalnie) `logout.ts` (POST):
    - Obsługa wylogowania użytkownika, usuwanie sesji.

### Modele Danych i Walidacja

- Definicja modelu `User` w `src/types.ts`:
  - Pola: id, email, data rejestracji oraz inne opcjonalne dane użytkownika
- Mechanizm walidacji danych:
  - Użycie bibliotek walidacyjnych (np. Zod), aby zapewnić poprawność danych wejściowych.
- Obsługa wyjątków:
  - Każdy endpoint opiera się na blokach try/catch, co umożliwia rejestrowanie błędów oraz zwracanie przyjaznych komunikatów errorowych do klienta.

### Rendering Server-Side

- Strony są renderowane po stronie serwera (SSR) zgodnie z konfiguracją w `astro.config.mjs` (adapter Node – tryb standalone).
- Logika autoryzacji i wyświetlania błędów jest zintegrowana z middleware, aby zachować spójność działania aplikacji.

## 3. SYSTEM AUTENTYKACJI

### Wykorzystanie Supabase Auth

- Centralny system autoryzacji oparty o Supabase Auth:
  - Rejestracja: Wywołanie `signUp` Supabase w celu utworzenia konta użytkownika.
  - Logowanie: Metoda `signInWithPassword` Supabase do weryfikacji danych logowania i inicjacji sesji.
- Klient Supabase umieszczony w `src/db/supabaseClient.ts`:
  - Umożliwia jednolitą obsługę żądań związanych z autentykacją z backendu.

### Middleware i Ochrona Stron

- Implementacja middleware (np. w `src/middleware/index.ts`):
  - Sprawdzenie, czy użytkownik posiada aktywną sesję.
  - Ochrona stron wymagających autoryzacji poprzez przekierowanie niezalogowanych użytkowników do strony logowania.

### Integracja z Interfejsem Użytkownika

- Komponenty React odpowiedzialne za rejestrację i logowanie komunikują się bezpośrednio z endpointami API.
- Po pomyślnej autentykacji stan użytkownika jest przechowywany (poprzez ciasteczka, kontekst React lub inne mechanizmy stanu), umożliwiając dostęp do chronionych części aplikacji.
- Synchronizacja stanu sesji między backendem a frontendem zapewnia spójność danych i bezproblemową nawigację.
- Zalogowany użytkownik jest przekazywany jako props z pliku `index.astro` do komponentu React, co umożliwia inicjalizację auth store.

---

Kluczowe wnioski:

- Funkcjonalności rejestracji i logowania są integralną częścią systemu i muszą być ściśle zintegrowane z istniejącą architekturą Astro + React.
- Oddzielenie logiki prezentacji (UI) od logiki biznesowej (API) zapewnia elastyczność i ułatwia rozwój oraz utrzymanie systemu.
- Supabase Auth stanowi solidną podstawę dla jednolitego zarządzania użytkownikami, sesjami oraz operacjami autoryzacyjnymi.
- System musi uwzględniać zarówno walidację danych po stronie klienta, jak i serwera, a także responsywną obsługę błędów, co jest kluczowe dla bezpieczeństwa i stabilności aplikacji.
