# Google Analytics Setup Instructions

## Overview
This website is integrated with Google Analytics 4 (GA4) to track user interactions, page views, and custom events.

## Setup Steps

### 1. Create a Google Analytics Account
1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account
3. Click "Start measuring" or "Admin" (gear icon)
4. Create a new property for your website

### 2. Get Your Measurement ID
1. In Google Analytics, go to **Admin** → **Data Streams**
2. Click on your web data stream
3. Copy your **Measurement ID** (format: `G-XXXXXXXXXX`)

### 3. Update the Code
1. Open `src/analytics.js`
2. Replace `'G-XXXXXXXXXX'` with your actual Measurement ID:
   ```javascript
   export const GA_MEASUREMENT_ID = 'G-YOUR-ACTUAL-ID';
   ```

### 4. Deploy Your Website
Once you've updated the Measurement ID and deployed your website, Google Analytics will start tracking:

## What's Being Tracked

### Automatic Tracking
- **Page Views**: Every time a user visits the site
- **User Sessions**: Duration and engagement metrics
- **Device Information**: Desktop, mobile, tablet
- **Geographic Data**: Country, city, language
- **Traffic Sources**: How users found your site

### Custom Events Tracked
1. **Menu Interactions**
   - Event: `menu_toggle`
   - Tracks hamburger menu clicks

2. **Game Plays**
   - Event: `game_play`
   - Games: "Tummy Runner", "Habit Wheel"

3. **Game Over**
   - Event: `game_over`
   - Includes game name and final score

4. **Quiz Completion**
   - Event: `quiz_complete`
   - Includes quiz name and score (0-50)

5. **Authentication**
   - Event: `auth_action`
   - Actions: login, signup, logout

## Viewing Your Analytics

### Real-Time Reports
1. Go to **Reports** → **Realtime**
2. See live user activity on your site

### Engagement Reports
1. Go to **Reports** → **Engagement** → **Events**
2. View all custom events and their frequency

### User Reports
1. Go to **Reports** → **User** → **Demographics**
2. See user age, gender, interests, location

### Acquisition Reports
1. Go to **Reports** → **Acquisition** → **Traffic acquisition**
2. See where your users are coming from

## Custom Dashboards

You can create custom dashboards to track:
- Total quiz completions
- Average quiz scores
- Most played games
- User retention rates
- Conversion funnels (signup → quiz → game)

## Privacy Considerations

- Google Analytics is GDPR compliant when configured properly
- Consider adding a cookie consent banner for EU users
- You can anonymize IP addresses in GA4 settings
- Update your privacy policy to mention analytics tracking

## Testing

To test if analytics is working:
1. Open your website
2. Open browser DevTools (F12)
3. Go to Network tab
4. Filter by "google-analytics" or "gtag"
5. Perform actions (play games, take quiz)
6. Check if events are being sent

Alternatively, use the **Google Analytics Debugger** Chrome extension.

## Troubleshooting

### Events not showing up?
- Check if Measurement ID is correct
- Wait 24-48 hours for data to appear in reports
- Use Real-time reports for immediate feedback
- Check browser console for errors

### Ad blockers
- Some users may have ad blockers that prevent GA tracking
- This is normal and expected (typically 10-30% of users)

## Resources

- [GA4 Documentation](https://support.google.com/analytics/answer/10089681)
- [Event Tracking Guide](https://support.google.com/analytics/answer/9322688)
- [GA4 Setup Assistant](https://support.google.com/analytics/answer/9744165)
