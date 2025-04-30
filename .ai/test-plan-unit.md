# Analiza testów jednostkowych

## Komponenty i scenariusze testowe

### 1. `src/components/BulkSaveButton.tsx` – **BulkSaveButton**

- should render both "Save All" and "Save Accepted" buttons
- should call `onSaveAll` when "Save All" button is clicked
- should call `onSaveAccepted` when "Save Accepted" button is clicked
- should disable "Save All" button when `isSaving` is true
- should disable "Save All" button when `disabled` prop is true
- should disable "Save Accepted" button when `isSaving` is true
- should disable "Save Accepted" button when `disabled` prop is true
- should disable "Save Accepted" button when `disableSaveAccepted` prop is true
- should show "Saving..." text on both buttons when `isSaving` is true
- should apply opacity class when buttons are disabled
- should have correct `aria-label`s

### 2. `src/components/FlashcardItem.tsx` – **FlashcardItem**

- should render flashcard front and back text in view mode initially
- should display Accept, Reject, Edit buttons in view mode
- should apply correct border style based on flashcard status (`accepted`, `rejected`, `default`)
- should apply opacity and disable interactions when `disabled` prop is true
- should call `onStatusChange` with `"accepted"` when Accept button is clicked
- should call `onStatusChange` with `"rejected"` when Reject button is clicked
- should switch to edit mode when Edit button is clicked
- should render Textarea inputs for front and back in edit mode
- should render Save and Cancel buttons in edit mode
- should update internal state for `editedFront` when front textarea changes
- should update internal state for `editedBack` when back textarea changes
- should display validation errors (empty, overlong) for front and back fields
- should display character count for front and back during edit
- should disable Save button in edit mode if validation errors exist
- should call `onEdit` with updated flashcard data when Save is clicked
- should return to view mode after save or cancel
- should reset edited values if `flashcard` prop changes externally

### 3. `src/components/FlashcardsItemList.tsx` – **FlashcardsItemList**

- should render a list of `FlashcardItem` components based on `flashcards` prop
- should render `BulkSaveButton`
- should pass correct props to `FlashcardItem`
- should calculate `disableSaveAccepted` prop
- should call `fetch` with correct payload on `handleSaveAll` and `handleSaveAccepted`
- should manage `isSaving` state
- should show success or error message depending on fetch result
- should disable elements if `hasSaved` is true
- should handle API errors gracefully

### 4. `src/components/GenerateButton.tsx` – **GenerateButton**

- should render with appropriate text depending on `isGenerating`
- should call `onClick` handler
- should be disabled based on props
- should not call handler when disabled
- should apply visual styles for disabled state

### 5. `src/components/GenerationsView.tsx` – **GenerationsView**

- should render `TextInputArea` and `GenerateButton` initially
- should update state on input change
- should enable/disable button based on input length
- should call fetch with correct payload
- should handle loading state and errors
- should transform and display API response
- should render `FlashcardsItemList` and manage flashcard interactions

### 6. `src/components/Navigation.tsx` – **Navigation**

- should display user info or login button based on session
- should call logout endpoint and handle redirect or errors
- should show toast on logout failure

### 7. `src/components/TextInputArea.tsx` – **TextInputArea**

- should render textarea and label
- should show character count and validation errors
- should apply styles based on validation state
- should be disabled when generating

### 8. `src/components/auth/auth.ts` – **Utility Functions**

#### `validateEmail`

- returns `isValid: true` for valid email
- returns error for invalid or empty input

#### `validatePassword`

- returns `isValid: true` if length ≥ 8
- returns error for invalid or empty input

#### `validateConfirmPassword`

- returns `isValid: true` when passwords match
- returns error for mismatch or empty input

### 9. `src/components/auth/LoginForm.tsx` – **LoginForm**

- should render fields and button
- should validate form using Zod + react-hook-form
- should call login endpoint
- should manage loading and disabled state
- should handle success and error responses

### 10. `src/components/auth/RegisterForm.tsx` – **RegisterForm**

- should render registration form
- should validate input
- should call register endpoint
- should manage loading, errors, redirects

### 11. `src/lib/utils.ts` – **cn function**

- should merge class names correctly
- should handle conditionals and overrides

### 12. `src/lib/services/flashcards.service.ts` – **createFlashcards**

- should call Supabase insert and return result
- should handle and throw on Supabase errors

### 13. `src/lib/services/generation.service.ts` – **generateFlashcards**

- should call OpenRouter API
- should parse and persist response in Supabase
- should handle AI or parsing errors
- should log errors and throw appropriate `GenerationError`

### 14. `src/lib/services/openrouter.service.ts` – **OpenRouterService class**

- should validate constructor config
- should update internal parameters
- should build payload and send chat requests
- should retry on failures
- should throw structured errors

> **Uwaga:** komponenty UI (`src/components/ui/`) mają niższy priorytet testowania jednostkowego, chyba że zawierają logikę. Zazwyczaj testowane są pośrednio poprzez komponenty nadrzędne.

---

## Rekomendacje E2E

Niektóre funkcjonalności lepiej testować end-to-end:

- **Generowanie fiszek** – pełny flow od wpisania tekstu po interakcję z fiszkami
- **Zapisywanie fiszek** – obsługa przycisków "Save All"/"Save Accepted"
- **Uwierzytelnianie** – logowanie, rejestracja, przekierowania
- **Middleware** – ochrona ścieżek dla niezalogowanych użytkowników
- **Integracja z backendem** – poprawność działania API w kontekście frontendu
- **Nawigacja i Layout** – poprawne renderowanie i działanie linków
- **Strony `.astro`** – renderowanie SSR i client-side init komponentów
