# AI Testing Guide - Finance Analyser

## Current Status
- AI functionality is fully implemented
- Routes are configured correctly
- Frontend AIAssistant component is ready
- **Missing**: Valid OpenRouter API key and PHP environment

## Step 1: Get OpenRouter API Key

1. Go to https://openrouter.ai/keys
2. Sign up or log in to your OpenRouter account
3. Click "Create new key"
4. Copy the key (it starts with `sk-or-v1-`)
5. Update your `.env` file:

```env
OPENROUTER_API_KEY=sk-or-v1-your-actual-copied-key-here
```

## Step 2: Install PHP (if not installed)

### Option A: Use XAMPP (Recommended for Windows)
1. Download XAMPP from https://www.apachefriends.org/
2. Install XAMPP
3. Start Apache and MySQL services from XAMPP Control Panel
4. PHP will be available at: `C:\xampp\php\php.exe`

### Option B: Install PHP separately
1. Download PHP from https://www.php.net/downloads.php
2. Extract to a folder (e.g., `C:\php`)
3. Add to PATH: `C:\php`

## Step 3: Test AI Functionality

### Method 1: Using PHP Command Line
```bash
# If using XAMPP
C:\xampp\php\php.exe test_ai.php

# If PHP is in PATH
php test_ai.php
```

### Method 2: Using Laravel Artisan
```bash
# If using XAMPP
C:\xampp\php\php.exe artisan serve

# Then test via browser or curl
curl -X GET "http://localhost:8000/api/v1/ai/capabilities"
```

### Method 3: Direct Browser Testing
1. Start your Laravel application
2. Navigate to your Finance Analyser frontend
3. Click the AI Assistant button (bottom-right corner)
4. Try asking: "What is 2+2?"

## Step 4: Manual Testing Without PHP

If you can't run PHP immediately, you can test the API endpoints directly:

### Test Capabilities Endpoint
```bash
curl -X GET "http://localhost:8000/api/v1/ai/capabilities" \
  -H "Accept: application/json"
```

### Test Chat Endpoint (with valid API key)
```bash
curl -X POST "http://localhost:8000/api/v1/ai/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"message": "Hello, AI!"}'
```

## Step 5: Frontend Testing

Once your application is running:

1. **Login to Finance Analyser**
2. **Find the AI Assistant**: Look for the chat bubble in the bottom-right corner
3. **Start chatting**: Click the bubble to open the AI assistant
4. **Try these questions**:
   - "What is 2+2?"
   - "How much did I spend last month?"
   - "What are my top expense categories?"
   - "Give me some savings advice"

## Expected Results

### Success Indicators
- [ ] API endpoints return 200 status
- [ ] AI responses are generated
- [ ] Frontend chat interface loads
- [ ] Messages are sent and received
- [ ] No error messages in browser console

### Common Issues & Solutions

#### "AI service temporarily unavailable"
- **Cause**: Invalid or missing OpenRouter API key
- **Solution**: Update OPENROUTER_API_KEY in `.env`

#### "Permission denied"
- **Cause**: User lacks `use_ai_features` permission
- **Solution**: Run `php artisan db:seed --class=RolePermissionSeeder`

#### "Network error"
- **Cause**: OpenRouter API connectivity issues
- **Solution**: Check internet connection and API key validity

#### Rate limiting
- **Cause**: Too many requests to OpenRouter
- **Solution**: Wait 1 minute or upgrade OpenRouter plan

## Quick Setup Commands

### Using XAMPP
```bash
# Navigate to project directory
cd D:\PROJECTS\Finance Analyser

# Test AI configuration
C:\xampp\php\php.exe test_ai.php

# Start Laravel server
C:\xampp\php\php.exe artisan serve

# Clear configuration cache
C:\xampp\php\php.exe artisan config:cache
```

### Database Setup (if needed)
```bash
# Run migrations
C:\xampp\php\php.exe artisan migrate

# Seed permissions
C:\xampp\php\php.exe artisan db:seed --class=RolePermissionSeeder

# Create test user
C:\xampp\php\php.exe artisan tinker
# Then run: User::create(['name' => 'Test User', 'email' => 'test@example.com', 'password' => Hash::make('password')])
```

## Testing Checklist

- [ ] OpenRouter API key is set in `.env`
- [ ] PHP is installed and accessible
- [ ] Laravel application starts successfully
- [ ] Database is configured and migrated
- [ ] User account exists with AI permissions
- [ ] AI endpoints respond correctly
- [ ] Frontend chat interface works
- [ ] AI responses are generated

## Next Steps After Testing

1. **Monitor API Usage**: Check OpenRouter dashboard for usage
2. **Fine-tune Prompts**: Adjust system prompts in AIService.php
3. **Add Rate Limiting**: Monitor and adjust rate limits if needed
4. **User Training**: Document AI features for end users
5. **Performance Monitoring**: Track response times and errors

## Support Resources

- **OpenRouter API Docs**: https://openrouter.ai/docs
- **Laravel Docs**: https://laravel.com/docs
- **Application Logs**: `storage/logs/laravel.log`
- **Browser Console**: F12 for debugging frontend issues

---

**Ready to test?** Start with getting your OpenRouter API key and installing PHP, then run the test script!
