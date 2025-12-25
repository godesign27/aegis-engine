# 🎨 Admin Dashboard Guide

The Aegis Engine includes a built-in admin dashboard for monitoring and testing validations.

## Accessing the Dashboard

Start the server and navigate to:

```
http://localhost:3000/admin
```

## Dashboard Features

### 📊 System Stats Card

Real-time metrics including:
- **Version**: Current Aegis Engine version
- **Uptime**: How long the service has been running
- **Validations Run**: Total number of validations performed
- **Last Validation**: Timestamp of the most recent validation

### 📦 Cached Policy Packs Card

Shows all policy packs currently in memory cache:
- Policy pack ID and version
- Git repository URL and ref
- Auto-updates when new policy packs are fetched

### 🧪 Test Validation Section

Interactive testing tool:

1. **Policy Pack Git URL**: Enter the URL of your policy pack repository
2. **Git Ref**: Specify the branch, tag, or commit (default: main)
3. **TSX Code**: Paste your code to validate
4. **Run Validation**: Click to execute validation and see results

Results are displayed as formatted JSON showing:
- Validation status (PASS/FAIL/WARN)
- Detailed violations with line numbers
- Policy pack information
- Summary statistics

### 📝 Recent Validations Table

View the last 10 validations with:
- **Time**: When the validation was run
- **Status**: PASS (green), FAIL (red), or WARN (yellow) badges
- **Policy Pack**: Which policy pack was used
- **Path**: File path of the validated artifact
- **Violations**: Error count / Warning count

## Auto-Refresh

The dashboard automatically refreshes every 5 seconds to show the latest:
- Service health status
- Validation counters
- Recent validations

## Example Usage

1. **Monitor Service Health**
   - The status indicator at the top shows a green dot when the service is online
   - Red dot indicates connection issues

2. **Test a Validation**
   ```
   URL: https://github.com/your-org/design-system-policies
   Ref: main
   Code: const App = () => <Button>Click Me</Button>;
   ```
   
3. **Review Results**
   - Check the formatted JSON output
   - Look for violations in the results
   - Verify against the Recent Validations table

## Tips

- **Quick Testing**: Use the test section to quickly validate code snippets
- **Monitoring**: Leave the dashboard open to monitor validation activity
- **Debugging**: Check recent validations to see patterns in failures
- **Policy Pack Health**: Verify policy packs are cached correctly

## No Authentication Required

The admin dashboard has no authentication in the MVP. It's intended for:
- Local development
- Internal network deployment
- Trusted environments

For production deployment, consider adding authentication middleware.

## Screenshots

The dashboard features:
- 🎨 Modern gradient design with purple theme
- 📱 Responsive layout that works on mobile and desktop
- ⚡ Real-time status updates
- 🎯 Clean, readable typography
- ✨ Smooth animations and transitions

## Technical Details

- **Technology**: Pure HTML, CSS, and vanilla JavaScript
- **No Build Step**: Single HTML file served by Express
- **Size**: ~15KB uncompressed
- **Load Time**: Instant (inline styles and scripts)
- **Browser Support**: All modern browsers

## API Integration

The dashboard uses these endpoints:
- `GET /health` - Every 5 seconds for status
- `GET /status` - Every 5 seconds for metrics
- `POST /validate` - On-demand when testing

## Troubleshooting

**Dashboard not loading?**
- Check server is running: `npm run dev`
- Verify port is correct (default: 3000)
- Check browser console for errors

**Status shows "Connection Error"?**
- Ensure server is running
- Check firewall settings
- Verify PORT in .env matches URL

**Validation test not working?**
- Verify policy pack URL is accessible
- Check the policy pack has required files
- Ensure code syntax is valid TSX

---

Enjoy monitoring your Aegis Engine with the admin dashboard! 🚀

