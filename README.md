# NestJS Backend Template SDK

Core business logic, Database models, and Utilities shared across services. This package is hosted on **GitHub Packages**.

## 🚀 Quick Start

### 1. Authentication
To install this package, you must have a `.npmrc` file in your project root with a GitHub Personal Access Token (PAT).

**File: `.npmrc`**
```text
@pandi2352:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

### 2. Installation
```bash
npm install @pandi2352/nestjs-backend-template-sdk
```

## 🛠 Features
- **Database Context**: Centralized Mongoose connection management.
- **Shared Modules**:
  - `products-srv`: Product management logic.
  - `tenants-srv`: Multi-tenancy and authentication configurations.
- **Utilities**: 
  - `CodeUtils`: Common error entities and logging helpers.
  - `ObjectUtil`: Deep merging and schema management tools.

## 📦 Development

### Setup
```bash
npm install
```

### Build
```bash
npm run build
```

### Publish New Version
1. Build the project: `npm run build`
2. Update version in `package.json`.
3. Publish: `npm publish`

## 📄 License
Internal template. All rights reserved.
