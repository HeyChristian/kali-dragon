# Contributing to Kali Dragon 🐉

Thank you for your interest in contributing to Kali Dragon! This document provides guidelines and instructions for contributors.

## 🤝 How to Contribute

### Reporting Bugs
- Use the [GitHub Issues](https://github.com/HeyChristian/kali-dragon/issues) page
- Search existing issues first
- Use our bug report template
- Include system information and steps to reproduce

### Suggesting Features  
- Open a [GitHub Discussion](https://github.com/HeyChristian/kali-dragon/discussions) first
- Describe the problem and proposed solution
- Consider implementation complexity and user impact

### Submitting Pull Requests

1. **Fork the repository**
2. **Create a feature branch** from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following our code style
4. **Test thoroughly** on multiple platforms
5. **Commit with clear messages**
   ```bash
   git commit -m "Add feature: description of what you added"
   ```
6. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Fill out the PR template completely**

## 📝 Code Style Guidelines

### JavaScript/Node.js
- Use 4 spaces for indentation
- Use semicolons consistently
- Use meaningful variable names
- Add JSDoc comments for functions
- Follow existing patterns

### HTML/CSS
- Use semantic HTML5 elements
- Follow Tailwind CSS utility-first approach
- Test responsive design on mobile
- Maintain dark theme consistency

### Bash Scripts
- Use `#!/bin/bash` shebang
- Add error handling with `set -e`
- Use quotes around variables
- Add comments for complex logic

## 🧪 Testing

### Before Submitting PR
- [ ] Test on macOS, Linux, and Windows
- [ ] Verify all terminal commands work
- [ ] Check responsive design
- [ ] Test with and without dependencies
- [ ] Ensure no broken links in docs

### Testing Environment
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/kali-dragon.git
cd kali-dragon

# Test the main setup
./setup.sh

# Test web interface
open http://localhost:8000
```

## 📋 PR Checklist

- [ ] Code follows project style guidelines
- [ ] Changes are tested on multiple platforms
- [ ] Documentation is updated if needed
- [ ] Commit messages are clear and descriptive
- [ ] No breaking changes (or clearly documented)
- [ ] Screenshots included for UI changes

## 🏷️ Branch Naming

- `feature/feature-description` - New features
- `bugfix/bug-description` - Bug fixes
- `docs/documentation-update` - Documentation changes
- `hotfix/urgent-fix` - Critical fixes

## 💬 Community

- Be respectful and constructive
- Help others in issues and discussions
- Share your use cases and feedback
- Follow our [Code of Conduct](CODE_OF_CONDUCT.md)

## 🎯 Priority Areas

We especially welcome contributions in:
- [ ] Windows compatibility improvements
- [ ] Mobile responsive design
- [ ] Error handling and user feedback
- [ ] Additional Kali Linux distributions
- [ ] Performance optimizations
- [ ] Security enhancements

## 🙋‍♂️ Questions?

- Open a [Discussion](https://github.com/HeyChristian/kali-dragon/discussions)
- Check existing [Issues](https://github.com/HeyChristian/kali-dragon/issues)
- Contact maintainers: @HeyChristian

---

Thank you for making Kali Dragon better! 🐉⚔️