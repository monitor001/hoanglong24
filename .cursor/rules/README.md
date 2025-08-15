# Cursor IDE Rules for MiniCDE Project

## Overview
This directory contains configuration files and rules for the Cursor IDE to properly understand and work with the MiniCDE project, specifically configured for Heroku as the test environment.

## Files Structure
```
.cursor/
├── rules/
│   ├── README.md (this file)
│   ├── heroku-environment.md
│   └── development-environment.md
└── .cursorrules (root level)
```

## Purpose
These rules help Cursor IDE understand:
- Heroku is the primary test environment
- Development workflow and best practices
- Performance optimization requirements
- Security guidelines
- Mobile and tablet optimization needs

## Key Configuration Points

### 1. Environment Recognition
- **Test Environment**: Heroku (Production-like testing)
- **Backend App**: `minicde-production`
- **Frontend App**: `minicde-frontend`
- **Main Domain**: `https://qlda.hoanglong24.com`

### 2. Performance Optimization
- React hooks optimization (useCallback, useMemo)
- Request deduplication and caching
- Conditional logging (development only)
- Bundle size optimization
- Database query optimization

### 3. Mobile and Tablet Optimization
- Mobile-first responsive design
- Touch-friendly interfaces
- Tablet landscape optimization
- Performance optimization for mobile devices

### 4. Security Guidelines
- JWT authentication
- Role-based access control
- Input validation
- Environment variable usage
- HTTPS enforcement

## How to Use These Rules

### For Development
1. Follow the guidelines in `development-environment.md`
2. Use local development for feature development
3. Deploy to Heroku for integration testing
4. Follow performance optimization guidelines

### For Testing
1. Use Heroku as the primary test environment
2. Test all features in production-like environment
3. Monitor performance and errors
4. Verify mobile and tablet compatibility

### For Deployment
1. Follow the deployment process outlined in the rules
2. Set proper environment variables
3. Run database migrations
4. Monitor deployment health

## Performance Monitoring

### Frontend Performance
- Monitor React component renders
- Track API call performance
- Monitor bundle size
- Check mobile performance

### Backend Performance
- Monitor API response times
- Track database query performance
- Monitor memory usage
- Check error rates

## Mobile and Tablet Considerations

### Responsive Design
- Mobile-first approach
- Touch-friendly interfaces
- Proper breakpoint management
- Optimized for tablet landscape

### Performance
- Fast loading times
- Efficient memory usage
- Optimized network requests
- Smooth animations

### User Experience
- Intuitive navigation
- Clear error messages
- Proper loading states
- Accessibility compliance

## Security Considerations

### Authentication
- JWT token management
- Secure session handling
- Password hashing
- 2FA implementation

### Authorization
- Role-based access control
- Permission matrices
- Request validation
- CORS policies

### Data Protection
- Input validation
- Data sanitization
- HTTPS enforcement
- Environment variable usage

## Best Practices

### Code Quality
- TypeScript strict mode
- Proper interface definitions
- React best practices
- Error boundary implementation

### Testing
- Unit test coverage
- Integration testing
- Performance testing
- Mobile testing

### Documentation
- Inline code comments
- API documentation
- Setup instructions
- Deployment guides

## Troubleshooting

### Common Issues
1. **Performance Issues**: Check for infinite re-renders, optimize hooks usage
2. **Mobile Issues**: Verify responsive design, test touch interactions
3. **Security Issues**: Validate inputs, check authentication
4. **Deployment Issues**: Verify environment variables, check logs

### Debugging Tools
- Browser developer tools
- React DevTools
- Redux DevTools
- Heroku logs
- Performance monitoring tools

## Updates and Maintenance

### Rule Updates
- Update rules when project requirements change
- Add new guidelines as needed
- Remove outdated information
- Keep documentation current

### Environment Changes
- Update environment variables
- Modify deployment procedures
- Update testing strategies
- Adjust performance requirements

## Support

For questions or issues related to these rules:
1. Check the documentation in each file
2. Review the main `.cursorrules` file
3. Consult the project README
4. Check Heroku documentation for platform-specific issues

## Version History

- **v1.0**: Initial setup with Heroku environment configuration
- **v1.1**: Added mobile and tablet optimization rules
- **v1.2**: Enhanced performance optimization guidelines
- **v1.3**: Added security and testing guidelines
