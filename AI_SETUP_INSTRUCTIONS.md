# AI Functionality Setup Instructions

## Overview
The AI functionality for Finance Analyser is now fully implemented and ready to use. Here's what has been configured:

## What's Been Set Up

### 1. AI Service Implementation
- **AIService.php**: Complete AI service with OpenRouter integration
- **AIController.php**: RESTful API endpoints for AI features
- **Request Validation**: AIChatRequest and AIAnalysisRequest classes
- **Permissions**: `use_ai_features` permission configured for all user roles

### 2. Available AI Features
- **Chat**: Natural language financial queries (`/api/v1/ai/chat`)
- **Spending Analysis**: Deep spending pattern analysis (`/api/v1/ai/analyze-spending`)
- **Predictions**: Future spending predictions (`/api/v1/ai/predict-spending`)
- **Budget Recommendations**: Intelligent budget advice (`/api/v1/ai/budget-recommendations`)
- **Risk Analysis**: Financial risk assessment (`/api/v1/ai/risk-analysis`)
- **Capabilities**: API feature information (`/api/v1/ai/capabilities`)

### 3. Frontend Integration
- **AIAssistant.tsx**: Complete chat interface with:
  - Real-time messaging
  - Quick actions
  - Suggested questions
  - Error handling
  - Typing indicators
  - Responsive design

## Setup Steps

### 1. Configure OpenRouter API Key
Edit your `.env` file and replace placeholder API key:

```env
OPENROUTER_API_KEY=sk-or-v1-your-actual-openrouter-api-key-here
```

Get your API key from: https://openrouter.ai/keys

### 2. Clear Configuration Cache
```bash
php artisan config:cache
```

### 3. Run Database Seeder (if needed)
```bash
php artisan db:seed --class=RolePermissionSeeder
```

### 4. Start Your Application
```bash
php artisan serve
```

### 5. Test the AI Functionality

#### Method 1: Using the Test Script
Run the provided test script:
```bash
php test_ai.php
```

#### Method 2: Manual API Testing
```bash
# Test AI capabilities
curl -X GET "http://localhost:8000/api/v1/ai/capabilities" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test AI chat
curl -X POST "http://localhost:8000/api/v1/ai/chat" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is 2+2?"}'
```

#### Method 3: Frontend Testing
1. Log into your Finance Analyser application
2. Click the AI Assistant chat button (bottom-right corner)
3. Try asking questions like:
   - "How much did I spend last month?"
   - "What are my top expense categories?"
   - "Give me some savings advice"

## API Endpoints

### Chat Endpoint
```
POST /api/v1/ai/chat
{
  "message": "Your financial question here..."
}
```

### Analysis Endpoint
```
POST /api/v1/ai/analyze-spending
{
  "period": 30  // optional, defaults to 30 days
}
```

### Prediction Endpoint
```
POST /api/v1/ai/predict-spending
```

### Budget Recommendations Endpoint
```
POST /api/v1/ai/budget-recommendations
```

### Risk Analysis Endpoint
```
POST /api/v1/ai/risk-analysis
```

### Capabilities Endpoint
```
GET /api/v1/ai/capabilities
```

## Features Included

### AI Chat Features
- Contextual responses based on user's financial data
- Natural language processing
- Financial insights and recommendations
- Error handling and fallback responses
- Rate limiting (10 requests per minute)

### AI Analysis Features
- Spending pattern analysis
- Category breakdowns
- Trend identification
- Optimization suggestions

### AI Prediction Features
- Next month spending forecast
- Seasonal pattern detection
- Confidence scoring
- Historical trend analysis

### AI Budget Features
- Budget health assessment
- Overspending alerts
- Optimization recommendations
- Category-specific advice

### AI Risk Features
- Financial risk scoring
- Risk factor identification
- Mitigation strategies
- Financial health assessment

## Security & Permissions

### Permission System
- All AI endpoints require `use_ai_features` permission
- Permission is granted to all user roles by default
- Can be restricted by modifying the RolePermissionSeeder

### Rate Limiting
- AI endpoints are rate-limited to 10 requests per minute
- Configurable via `RATE_LIMIT_AI` environment variable

### Data Privacy
- User data is only shared with OpenRouter API
- No sensitive financial data is stored externally
- All requests are logged for audit purposes

## Troubleshooting

### Common Issues

#### 1. "AI service temporarily unavailable"
- Check your OpenRouter API key in `.env`
- Verify your OpenRouter account has sufficient credits
- Check your internet connection

#### 2. Permission denied errors
- Ensure user has `use_ai_features` permission
- Run the RolePermissionSeeder if needed
- Check user role assignments

#### 3. Rate limit errors
- Wait for rate limit to reset (1 minute)
- Consider upgrading your OpenRouter plan for higher limits

### Testing Checklist
- [ ] OpenRouter API key is set correctly
- [ ] Application is running
- [ ] User is logged in with appropriate permissions
- [ ] Frontend chat interface loads
- [ ] API endpoints respond correctly
- [ ] AI responses are generated successfully

## Next Steps

1. **Monitor Usage**: Keep track of AI usage and costs
2. **Fine-tune Prompts**: Adjust system prompts for better responses
3. **Add Features**: Implement additional AI capabilities as needed
4. **User Training**: Provide documentation for end users
5. **Performance Optimization**: Cache common responses if needed

## Support

For issues with:
- **OpenRouter API**: Check OpenRouter status page
- **Application**: Review Laravel logs
- **Permissions**: Verify database seeding
- **Frontend**: Check browser console for errors

The AI functionality is now ready for production use!
