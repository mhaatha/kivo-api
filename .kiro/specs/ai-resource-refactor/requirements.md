# Requirements Document

## Introduction

Refactoring resource AI pada backend Kivo API untuk meningkatkan maintainability, readability, dan struktur kode. Saat ini, kode AI tersebar dengan beberapa masalah:
- Controller terlalu besar dengan tool definitions yang seharusnya terpisah
- Service file berisi kode yang tidak relevan (legacy OpenAI client, unused exports)
- Tidak ada pemisahan yang jelas antara AI tools, prompts, dan business logic
- Duplikasi konfigurasi provider antara controller dan service

Refactoring ini akan menyusun ulang kode sesuai dengan struktur folder yang sudah ada (controllers, services, validations, utils) dengan penambahan folder khusus untuk AI-related concerns.

## Glossary

- **AI_Resource**: Kumpulan komponen backend yang menangani fitur AI chat dan BMC generation
- **BMC**: Business Model Canvas - framework untuk mendokumentasikan model bisnis
- **Tool**: Fungsi yang dapat dipanggil oleh AI model untuk melakukan aksi tertentu (web search, save BMC, dll)
- **Provider**: Konfigurasi koneksi ke AI service (OpenRouter, Kolosal)
- **System_Prompt**: Instruksi yang diberikan ke AI model untuk menentukan perilaku dan persona
- **Chat_Service**: Service yang menangani operasi CRUD untuk chat dan messages

## Requirements

### Requirement 1

**User Story:** As a developer, I want AI provider configuration to be centralized in a dedicated config file, so that I can easily switch providers or update API keys without modifying multiple files.

#### Acceptance Criteria

1. WHEN the AI_Resource initializes THEN the system SHALL load provider configuration from a single dedicated config file
2. WHEN provider credentials are updated THEN the system SHALL require changes only in the config file
3. WHEN a new provider is added THEN the system SHALL support configuration without modifying controller or service files

### Requirement 2

**User Story:** As a developer, I want AI tools to be defined in a separate module, so that I can easily add, modify, or remove tools without touching the controller.

#### Acceptance Criteria

1. WHEN the AI_Resource needs tool definitions THEN the system SHALL import tools from a dedicated tools module
2. WHEN a new tool is added THEN the system SHALL require changes only in the tools module
3. WHEN tool parameters are modified THEN the system SHALL validate parameters using Zod schemas defined in the tools module
4. WHEN a tool is executed THEN the system SHALL log the tool name, parameters, and result for debugging

### Requirement 3

**User Story:** As a developer, I want system prompts to be stored in a dedicated prompts file, so that I can easily update AI behavior without modifying service logic.

#### Acceptance Criteria

1. WHEN the AI_Resource builds a chat request THEN the system SHALL load system prompts from a dedicated prompts module
2. WHEN prompts are updated THEN the system SHALL require changes only in the prompts module
3. WHEN dynamic context is needed THEN the system SHALL support prompt template functions that accept parameters

### Requirement 4

**User Story:** As a developer, I want the AI controller to only handle HTTP request/response logic, so that the code is easier to read and test.

#### Acceptance Criteria

1. WHEN a chat request is received THEN the AI_Controller SHALL delegate business logic to the AI_Service
2. WHEN the AI_Controller processes a request THEN the AI_Controller SHALL contain only request validation, authentication check, and response formatting
3. WHEN an error occurs THEN the AI_Controller SHALL return appropriate HTTP status codes with consistent error format

### Requirement 5

**User Story:** As a developer, I want unused code and legacy configurations to be removed, so that the codebase is clean and maintainable.

#### Acceptance Criteria

1. WHEN the refactoring is complete THEN the system SHALL not contain unused imports or exports
2. WHEN the refactoring is complete THEN the system SHALL not contain commented-out code blocks
3. WHEN the refactoring is complete THEN the system SHALL not contain duplicate provider configurations

### Requirement 6

**User Story:** As a developer, I want BMC-related operations to be handled by a dedicated BMC service, so that AI service only handles AI-specific logic.

#### Acceptance Criteria

1. WHEN a BMC is created or updated THEN the system SHALL delegate the operation to the BMC_Service
2. WHEN BMC data is validated THEN the system SHALL use validation functions from the BMC_Service
3. WHEN BMC tags are normalized THEN the system SHALL use helper functions from the BMC_Service

### Requirement 7

**User Story:** As a developer, I want consistent file naming conventions, so that the codebase is predictable and easy to navigate.

#### Acceptance Criteria

1. WHEN a new file is created THEN the file name SHALL follow the pattern `{resource}.{type}.js` (e.g., `ai.controller.js`, `ai.service.js`)
2. WHEN routes are defined THEN the route file SHALL be named `{resource}.route.js`
3. WHEN the refactoring is complete THEN the system SHALL not have duplicate route files for the same resource
