# 🤝 Contributing to Eniolabi Service Hub

Thank you for your interest in contributing to the Eniolabi Service Hub! This document provides guidelines and information for contributors.

---

## 📋 **Table of Contents**

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Development Standards](#development-standards)

---

## 📜 **Code of Conduct**

This project follows a code of conduct that we expect all contributors to follow:

- Be respectful and inclusive
- Use welcoming and inclusive language
- Be constructive in feedback
- Focus on what's best for the community
- Show empathy towards other community members

---

## 🚀 **Getting Started**

### **Prerequisites**

Before contributing, ensure you have:

- Node.js 18+ installed
- PostgreSQL 13+ installed
- Redis 6+ installed
- Git installed
- A GitHub account

### **Fork and Clone**

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/yourusername/eniolabi-service-hub.git
   cd eniolabi-service-hub
   ```

3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/damoojeje/eniolabi-service-hub.git
   ```

---

## 🛠️ **Development Setup**

### **1. Install Dependencies**

```bash
npm install
```

### **2. Set Up Environment**

```bash
cp env.template .env.local
# Edit .env.local with your configuration
```

### **3. Set Up Database**

```bash
# Create PostgreSQL database
createdb eniolabi_service_hub

# Run migrations
npx prisma db push

# Seed database
npx prisma db seed
```

### **4. Start Development Server**

```bash
npm run dev
```

### **5. Run Tests**

```bash
npm test
```

---

## 📝 **Contributing Guidelines**

### **Types of Contributions**

We welcome various types of contributions:

- **Bug Fixes**: Fix existing issues
- **Feature Requests**: Add new functionality
- **Documentation**: Improve documentation
- **Performance**: Optimize existing code
- **Security**: Enhance security features
- **UI/UX**: Improve user interface

### **Before Contributing**

1. **Check Existing Issues**: Look for existing issues or discussions
2. **Create an Issue**: For significant changes, create an issue first
3. **Discuss Changes**: Get feedback before implementing major changes
4. **Follow Standards**: Adhere to coding standards and conventions

---

## 🔄 **Pull Request Process**

### **1. Create a Branch**

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### **2. Make Changes**

- Write clean, readable code
- Add tests for new functionality
- Update documentation as needed
- Follow the existing code style

### **3. Commit Changes**

```bash
git add .
git commit -m "feat: add new feature description"
```

**Commit Message Format:**
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

### **4. Push and Create PR**

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

### **5. PR Requirements**

- Clear description of changes
- Reference related issues
- Include screenshots for UI changes
- Ensure all tests pass
- Update documentation if needed

---

## 🐛 **Issue Reporting**

### **Bug Reports**

When reporting bugs, include:

- **Description**: Clear description of the issue
- **Steps to Reproduce**: Detailed steps to reproduce
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: OS, Node.js version, browser
- **Screenshots**: If applicable

### **Feature Requests**

When requesting features, include:

- **Description**: Clear description of the feature
- **Use Case**: Why this feature is needed
- **Proposed Solution**: How you think it should work
- **Alternatives**: Other solutions you've considered

---

## 📏 **Development Standards**

### **Code Style**

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful variable names
- Add JSDoc comments for functions

### **File Organization**

```
src/
├── app/                 # Next.js pages
├── components/          # Reusable components
├── contexts/           # React contexts
├── features/           # Feature modules
├── hooks/             # Custom hooks
├── lib/               # Utilities
├── server/            # Backend code
└── shared/            # Shared types/utils
```

### **Component Guidelines**

- Use functional components with hooks
- Implement proper TypeScript types
- Add error boundaries where needed
- Make components reusable and testable
- Follow accessibility guidelines

### **API Guidelines**

- Use tRPC for all API endpoints
- Implement proper error handling
- Add input validation
- Document all procedures
- Follow RESTful principles where applicable

---

## 🧪 **Testing**

### **Test Types**

- **Unit Tests**: Test individual functions
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user flows
- **API Tests**: Test API endpoints

### **Running Tests**

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

## 📚 **Documentation**

### **Documentation Standards**

- Keep documentation up to date
- Use clear, concise language
- Include code examples
- Add screenshots for UI changes
- Follow the existing documentation style

### **Documentation Types**

- **README**: Project overview and setup
- **API Docs**: API reference
- **Component Docs**: Component documentation
- **Deployment Docs**: Deployment instructions

---

## 🔒 **Security**

### **Security Guidelines**

- Never commit secrets or credentials
- Use environment variables for configuration
- Implement proper input validation
- Follow security best practices
- Report security issues privately

### **Reporting Security Issues**

For security issues, please:

1. **Do not** create a public issue
2. Email security concerns to: security@eniolabi.com
3. Include detailed information
4. Allow time for response

---

## 🎯 **Project Roadmap**

### **Current Priorities**

1. **Admin Panel UIs**: Complete remaining admin interfaces
2. **Analytics Dashboard**: Implement data visualization
3. **Health Monitoring**: Add comprehensive monitoring UI
4. **Performance**: Optimize application performance
5. **Testing**: Increase test coverage

### **Future Features**

- Mobile app support
- Advanced analytics
- Multi-tenant support
- API rate limiting
- Advanced security features

---

## 📞 **Getting Help**

### **Community Support**

- **GitHub Issues**: For bug reports and feature requests
- **Discussions**: For questions and general discussion
- **Documentation**: Check existing documentation first

### **Contact**

- **Maintainer**: Damilare Eniolabi
- **GitHub**: [@damoojeje](https://github.com/damoojeje)
- **Website**: [eniolabi.com](https://eniolabi.com)

---

## 🙏 **Recognition**

Contributors will be recognized in:

- CONTRIBUTORS.md file
- Release notes
- Project documentation
- GitHub contributors list

---

**Thank you for contributing to the Eniolabi Service Hub! 🎉**

---

**Last Updated**: October 1, 2025  
**Version**: 3.0.0
