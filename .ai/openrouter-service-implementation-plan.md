# Przewodnik implementacji serwisu OpenRouter

## 1. Opis usługi

Serwis OpenRouter to warstwa integracji, która umożliwia aplikacji komunikację z API OpenRouter w celu uzupełnienia czatów opartych na LLM. Usługa ta odpowiada za:

- Konfigurację zapytań do API, uwzględniając komunikaty systemowe oraz komunikaty użytkownika.
- Przetwarzanie odpowiedzi otrzymanych z API zgodnie z predefiniowanym schematem response_format.
- Zarządzanie nazwą modelu i jego parametrami dla pełnej kontroli nad logiką generowania odpowiedzi.

## 2. Opis konstruktora

Konstruktor serwisu inicjalizuje niezbędne parametry, takie jak:

- Klucz API i endpoint, które umożliwiają autoryzację i komunikację z OpenRouter API.
- Domyślne ustawienia modelu (nazwa modelu, parametry takie jak `temperature`, `max_tokens` itd.).
- Komunikat systemowy, który pełni rolę instrukcji dla modelu.
- `response_format` – schemat walidacji odpowiedzi (np. JSON Schema) zgodnie z wzorem (przykład):
  ```
  { type: 'json_schema', json_schema: { name: 'chat_response_schema', strict: true, schema: { message: 'string', additional_info: 'string' } } }
  ```

Przykład konstruktora:

```typescript
constructor(config: OpenRouterConfig) {
  // Inicjalizacja klucza API, endpointa, domyślnych parametrów modelu oraz formatu odpowiedzi
}
```

## 3. Publiczne metody i pola

**Publiczne metody:**

1. `sendChatRequest(userMessage: string): Promise<OpenRouterApiResponse>`
   - Wysyła zapytanie do API OpenRouter, łącząc komunikaty systemowe i użytkownika.
2. `setSystemMessage(message: string): void`
   - Ustawia lub aktualizuje komunikat systemowy, który będzie dołączany do zapytań.
3. `setResponseFormat(format: ResponseFormat): void`
   - Konfiguruje schemat odpowiedzi, który będzie używany do walidacji danych z API.
4. `setModelParameters(modelName: string, parameters: ModelParameters): void`
   - Ustawia nazwę modelu oraz jego parametry, np. ustawienia temperatury czy limit tokenów.

**Publiczne pola:**

- `apiKey: string` – Klucz autoryzacyjny do API OpenRouter.
- `endpoint: string` – URL endpointa API.
- `systemMessage: string` – Domyślny komunikat systemowy.
- `model: string` – Domyślna nazwa modelu, np. `gpt-4`.
- `modelParams: ModelParameters` – Domyślne parametry modelu, takie jak `temperature`, `max_tokens`.
- `responseFormat: ResponseFormat` – Schemat walidacji odpowiedzi.

## 4. Prywatne metody i pola

**Prywatne metody:**

1. `buildPayload(messages: ChatMessage[]): ChatPayload`
   - Buduje ładunek (payload) zapytania, łącząc przekazane komunikaty z domyślnymi ustawieniami serwisu.
2. `sendRequest(payload: ChatPayload): Promise<OpenRouterApiResponse>`
   - Wysyła zapytanie HTTP do API OpenRouter z zastosowaniem strategii retry i timeout.

**Prywatne pola:**

- `httpClient` – Klient HTTP z konfiguracją timeoutów oraz retry logic.

## 5. Obsługa błędów

Potencjalne scenariusze błędów i proponowane rozwiązania:

1. **Błąd autoryzacji:**

   - Problem: Nieprawidłowy lub wygasły klucz API.
   - Rozwiązanie: Walidacja klucza przed wysłaniem zapytania oraz implementacja mechanizmu odświeżania tokenu.

2. **Błąd sieci:**

   - Problem: Timeout lub brak połączenia.
   - Rozwiązanie: Implementacja mechanizmu retry z backoffem oraz logowanie błędów sieciowych.

3. **Niezgodność schematu odpowiedzi:**

   - Problem: Odpowiedź nie spełnia założonego `responseFormat`.
   - Rozwiązanie: Walidacja odpowiedzi przy użyciu JSON Schema oraz zgłaszanie błędów walidacji.

4. **Błąd serwera API:**

   - Problem: Błędy 5xx lub inne błędy wewnętrzne serwera.
   - Rozwiązanie: Detekcja kodów błędów HTTP, odpowiednia obsługa błędu oraz informowanie użytkownika.

5. **Przekroczenie limitów (Rate Limit):**
   - Problem: Zbyt wiele zapytań wysyłanych w krótkim czasie.
   - Rozwiązanie: Implementacja buforowania zapytań oraz systemu kolejkowania żądań.

## 6. Kwestie bezpieczeństwa

- Przechowywanie klucza API w bezpieczny sposób (np. poprzez zmienne środowiskowe) i unikanie jego ekspozycji w kodzie źródłowym.

## 7. Plan wdrożenia krok po kroku

1. **Implementacja serwisu:**

   - Stworzyć klasę `OpenRouterService` w `/src/lib/openrouter.service`.
   - Zaimplementować konstruktor oraz kluczowe metody (publiczne i prywatne) zgodnie z powyższym opisem.

2. **Budowa zapytania:**

   - Zaimplementować metodę `buildPayload`, która integruje:
     - Komunikat systemowy (np. "System: Inicjuję zapytanie do OpenRouter"),
     - Komunikat użytkownika (dynamicznie przekazywany do metody `sendChatRequest`).

3. **Konfiguracja response_format:**

   - Ustalić schemat odpowiedzi zgodnie z wzorem:
     ```
     { type: 'json_schema', json_schema: { name: 'chat_response_schema', strict: true, schema: { message: 'string', additional_info: 'string' } } }
     ```

4. **Ustawienie modelu i parametrów:**

   - Skonfigurować nazwę modelu (np. `gpt-4`) oraz parametry (np. `{ temperature: 0.7, max_tokens: 150 }`).

5. **Obsługa błędów i logowanie:**
   - Zaimplementować kompleksową obsługę błędów, w tym mechanizmy retry oraz logowanie krytycznych błędów.
