# Backend-Frontend Integration & MVP Flow Analysis Prompt

## Primary Objectives

You are tasked with performing a comprehensive analysis of a web application to:

1. **Verify Backend-Frontend Integration**: Check if the backend and frontend are properly connected and communicating
2. **Compare Webapp vs MVP Flow**: Analyze the current webapp flow against the provided MVP specifications
3. **Identify Gaps & Create Tasks**: List missing features, implementation gaps, and create actionable tasks

## Analysis Framework

### Phase 1: Integration Health Check

**Backend Analysis:**
- [ ] Examine all API endpoints and their functionality
- [ ] Check database connections and data models
- [ ] Verify authentication/authorization systems
- [ ] Test middleware and error handling
- [ ] Review environment variables and configuration
- [ ] Check CORS settings and security headers

**Frontend Analysis:**
- [ ] Examine API service layers and HTTP clients
- [ ] Check state management (Redux/Context/Zustand etc.)
- [ ] Verify routing and navigation flow
- [ ] Test form handling and validation
- [ ] Review component structure and data flow
- [ ] Check authentication state management

**Integration Points:**
- [ ] API calls from frontend to backend
- [ ] Data serialization/deserialization
- [ ] Error handling across the stack
- [ ] Authentication token flow
- [ ] Real-time features (WebSocket/SSE if applicable)
- [ ] File upload/download functionality

### Phase 2: MVP Flow Comparison

**Current Webapp Flow Analysis:**
1. Map out the complete user journey in the current webapp
2. Document each step with:
   - User action
   - Frontend component involved
   - Backend endpoint called
   - Data flow
   - Expected outcome vs actual outcome

**MVP Flow Comparison:**
1. Compare each step in the MVP specification against the current implementation
2. Identify:
   - ✅ Fully implemented features
   - ⚠️ Partially implemented features
   - ❌ Missing features
   - 🔄 Features that need modification

### Phase 3: Gap Analysis & Task Creation

**For Each Identified Gap:**
- **Feature/Function**: What's missing or needs change
- **Impact Level**: Critical/High/Medium/Low
- **Complexity**: High/Medium/Low
- **Dependencies**: What other components are affected
- **Estimated Effort**: Hours/Days
- **Priority**: Must-have/Should-have/Nice-to-have

## Detailed Analysis Instructions

### 1. Code Structure Review
```
Examine:
- Project structure and organization
- Backend routes and controllers
- Frontend components and pages
- Shared utilities and constants
- Database models and relationships
- API documentation (if exists)
```

### 2. Functional Testing
```
Test the following flows:
- User registration/login
- Main application workflows
- Data CRUD operations
- Navigation between pages
- Form submissions
- Error scenarios
- Loading states
```

### 3. Technical Integration Points
```
Verify:
- HTTP methods and status codes
- Request/response data formats
- Authentication headers
- API versioning
- Rate limiting
- Input validation
- SQL injection protection
- XSS protection
```

### 4. Performance & Optimization
```
Check:
- API response times
- Database query efficiency
- Frontend bundle size
- Image/asset optimization
- Caching strategies
- Memory leaks
```

## Output Format

### Integration Status Report
```markdown
## Backend-Frontend Integration Status

### ✅ Working Properly
- List functioning integrations

### ⚠️ Issues Found
- List problems with details and impact

### ❌ Broken/Missing
- List non-functional integrations
```

### MVP Comparison Matrix
```markdown
## MVP vs Current Implementation

| MVP Feature | Current Status | Gap Description | Action Required |
|-------------|----------------|-----------------|-----------------|
| Feature 1   | ✅ Complete    | None           | None            |
| Feature 2   | ⚠️ Partial     | Missing X      | Implement X     |
| Feature 3   | ❌ Missing     | Not started    | Full implementation |
```

### Task List with Priorities
```markdown
## Action Items

### Critical (Fix Immediately) 🔥
1. **[BACKEND]** Fix authentication endpoint
   - Description: Login API returning 500 error
   - Files affected: auth.js, middleware/auth.js
   - Estimated effort: 2 hours

### High Priority (This Sprint) ⚡
2. **[FRONTEND]** Implement user dashboard
   - Description: MVP requires dashboard, currently missing
   - Files affected: Dashboard.jsx, routes.js
   - Estimated effort: 1 day

### Medium Priority (Next Sprint) 📋
3. **[INTEGRATION]** Add real-time notifications
   - Description: MVP specifies live updates
   - Files affected: WebSocket setup, notification components
   - Estimated effort: 3 days

### Low Priority (Future) 📝
4. **[OPTIMIZATION]** Improve loading performance
   - Description: Page load times could be better
   - Files affected: Bundle optimization, lazy loading
   - Estimated effort: 2 days
```

## Usage Instructions

1. **Prepare your codebase**: Ensure both frontend and backend code are accessible
2. **Provide MVP documentation**: Share your MVP flow/specifications
3. **Run the analysis**: Execute tests and examine code systematically
4. **Generate report**: Follow the output format above
5. **Prioritize tasks**: Focus on critical integration issues first

## Additional Considerations

- **Security**: Check for security vulnerabilities
- **Scalability**: Assess current architecture's ability to scale
- **Maintainability**: Evaluate code quality and documentation
- **User Experience**: Ensure the flow matches expected UX
- **Mobile Responsiveness**: Test on different screen sizes
- **Browser Compatibility**: Check cross-browser functionality

---

**Note**: Please provide your MVP flow documentation and any specific areas of concern for a more targeted analysis.