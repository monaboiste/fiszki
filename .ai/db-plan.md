# Schemat bazy danych PostgreSQL

## 1. Lista tabel

### 1.1. users

- **user_id**: BIGSERIAL, PRIMARY KEY
- **email**: VARCHAR(255) NOT NULL UNIQUE
- **password_hash**: TEXT NOT NULL

### 1.2. flashcards

- **flashcard_id**: BIGSERIAL, PRIMARY KEY
- **user_id**: BIGINT NOT NULL, REFERENCES users(user_id) ON DELETE CASCADE
- **generation_id**: BIGINT, REFERENCES generations(generation_id) ON DELETE SET NULL
- **front**: VARCHAR(200) NOT NULL
- **back**: VARCHAR(500) NOT NULL
- **type**: VARCHAR(30) NOT NULL
  - CHECK (type IN ('manual', 'ai-generated', 'ai-generated-modified'))
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT NOW()
- **updated_at**: TIMESTAMPTZ NOT NULL DEFAULT NOW()

### 1.3. generations

- **generation_id**: BIGSERIAL, PRIMARY KEY
- **user_id**: BIGINT NOT NULL, REFERENCES users(user_id) ON DELETE CASCADE
- **generation_duration_ms**: INTEGER NOT NULL
  - CHECK (generation_duration_ms >= 0)
- **input_text**: VARCHAR(10000) NOT NULL
- **model_used**: VARCHAR(100) NOT NULL
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT NOW()

### 1.4. ai_generation_logs

- **log_id**: BIGSERIAL, PRIMARY KEY
- **generation_id**: BIGINT NOT NULL, REFERENCES generations(generation_id) ON DELETE CASCADE
- **logged_at**: TIMESTAMPTZ NOT NULL DEFAULT NOW()
- **error_code**: VARCHAR(50) NOT NULL
- **error_description**: TEXT NOT NULL

## 2. Relacje między tabelami

- `users` (1) -- (N) `flashcards`

  - Kolumna `user_id` w tabeli flashcards odnosi się do `users.user_id`

- `users` (1) -- (N) `generations`

  - Kolumna `user_id` w tabeli generations odnosi się do `users.user_id`

- `generations` (1) -- (N) `flashcards`

  - Kolumna `generation_id` w tabeli flashcards odnosi się do `generations.generation_id`

- `generations` (1) -- (N) `ai_generation_logs`
  - Kolumna `generation_id` w tabeli ai_generation_logs odnosi się do `generations.generation_id`

## 3. Indeksy

- Indeks na kolumnie `users.email` (unikalny)
- Indeks na kolumnie `flashcards.user_id` dla optymalizacji zapytań filtrowanych po użytkowniku
- Indeks na kolumnie `flashcards.generation_id` dla szybkiego dostępu do fiszek powiązanych z daną generacją
- Indeks na kolumnie `generations.user_id` dla szybkiego dostępu do generacji danego użytkownika

## 4. Zasady PostgreSQL (Row-Level Security - RLS)

- Włączyć RLS dla tabel:

  - `flashcards`
  - `generations`
  - `ai_generation_logs`

- Przykładowa polityka RLS dla tabeli flashcards:

  ```sql
  ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
  CREATE POLICY user_flashcards_policy ON flashcards
    USING (user_id::text = auth.uid()::text);
  ```

- Podobne polityki należy wdrożyć dla tabel powiązanych, zapewniając, że użytkownik ma dostęp tylko do swoich danych.

## 5. Dodatkowe uwagi

- Wszystkie kolumny dat (`created_at`, `updated_at`, `logged_at`) są zapisywane z użyciem TIMESTAMPTZ, aby zachować zgodność z czasem UTC
- Kolumna `updated_at` jest automatycznie aktualizowana przy każdej modyfikacji rekordu za pomocą triggera
- W przyszłości, przy wzroście ilości danych, można rozważyć implementację partycjonowania tabel

## 6. Triggery

### 6.1. set_updated_at

Trigger aktualizujący pole `updated_at` przy każdej modyfikacji rekordu w tabelach:

- `users`
- `flashcards`

Trigger jest wywoływany przed każdą operacją UPDATE i ustawia `updated_at` na aktualny czas.
