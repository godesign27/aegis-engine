/**
 * Admin dashboard UI handler
 */
import { Request, Response } from 'express';

/**
 * GET /admin handler - Serves admin dashboard HTML
 */
export function handleAdminUI(req: Request, res: Response): void {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aegis Engine - Admin Dashboard</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f5f5f5;
      color: #333;
      line-height: 1.6;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }
    
    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      border-radius: 8px;
      margin-bottom: 30px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    
    .subtitle {
      font-size: 16px;
      opacity: 0.9;
    }
    
    .status-indicator {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      margin-top: 12px;
    }
    
    .status-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #4ade80;
      animation: pulse 2s ease-in-out infinite;
    }
    
    .status-dot.down {
      background: #ef4444;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .card {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .card h2 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #667eea;
    }
    
    .stat {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .stat:last-child {
      border-bottom: none;
    }
    
    .stat-label {
      color: #666;
      font-size: 14px;
    }
    
    .stat-value {
      font-weight: 600;
      font-size: 16px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    
    th {
      text-align: left;
      padding: 12px;
      background: #f8f9fa;
      font-weight: 600;
      color: #666;
      border-bottom: 2px solid #e0e0e0;
    }
    
    td {
      padding: 12px;
      border-bottom: 1px solid #f0f0f0;
    }
    
    tr:hover {
      background: #f8f9fa;
    }
    
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .badge-pass {
      background: #d1fae5;
      color: #065f46;
    }
    
    .badge-fail {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .badge-warn {
      background: #fef3c7;
      color: #92400e;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    label {
      display: block;
      font-weight: 600;
      margin-bottom: 8px;
      color: #555;
      font-size: 14px;
    }
    
    input, textarea {
      width: 100%;
      padding: 10px 12px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 14px;
      font-family: inherit;
      transition: border-color 0.2s;
    }
    
    input:focus, textarea:focus {
      outline: none;
      border-color: #667eea;
    }
    
    textarea {
      font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
      min-height: 200px;
      resize: vertical;
    }
    
    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    
    button:active {
      transform: translateY(0);
    }
    
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    
    pre {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 20px;
      border-radius: 6px;
      overflow-x: auto;
      font-size: 13px;
      line-height: 1.5;
      margin-top: 16px;
    }
    
    .empty-state {
      text-align: center;
      padding: 40px;
      color: #999;
    }
    
    .loading {
      text-align: center;
      padding: 20px;
      color: #667eea;
    }
    
    .timestamp {
      font-size: 12px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>⚡ Aegis Engine</h1>
      <div class="subtitle">AI Design Governance - Admin Dashboard</div>
      <div class="status-indicator">
        <div class="status-dot" id="statusDot"></div>
        <span id="statusText">Loading...</span>
      </div>
    </header>

    <div class="grid">
      <div class="card">
        <h2>📊 System Stats</h2>
        <div class="stat">
          <span class="stat-label">Version</span>
          <span class="stat-value" id="version">-</span>
        </div>
        <div class="stat">
          <span class="stat-label">Uptime</span>
          <span class="stat-value" id="uptime">-</span>
        </div>
        <div class="stat">
          <span class="stat-label">Validations Run</span>
          <span class="stat-value" id="validationCount">-</span>
        </div>
        <div class="stat">
          <span class="stat-label">Last Validation</span>
          <span class="stat-value" id="lastValidation">-</span>
        </div>
      </div>
      
      <div class="card">
        <h2>📦 Cached Policy Packs</h2>
        <div class="stat">
          <span class="stat-label">Total Cached</span>
          <span class="stat-value" id="cachedCount">-</span>
        </div>
        <div id="policyPacksList" style="margin-top: 12px;"></div>
      </div>
    </div>

    <div class="card">
      <h2>🧪 Test Validation</h2>
      <div class="form-group">
        <label for="policyUrl">Policy Pack Git URL</label>
        <input type="text" id="policyUrl" placeholder="https://github.com/your-org/design-system-policies">
      </div>
      <div class="form-group">
        <label for="policyRef">Git Ref (branch/tag/commit)</label>
        <input type="text" id="policyRef" placeholder="main" value="main">
      </div>
      <div class="form-group">
        <label for="codeInput">TSX Code to Validate</label>
        <textarea id="codeInput" placeholder="Paste your TSX code here...">const App = () => <Button>Click Me</Button>;</textarea>
      </div>
      <button id="validateBtn" onclick="runValidation()">🚀 Run Validation</button>
      <div id="validationResult"></div>
    </div>

    <div class="card">
      <h2>📝 Recent Validations</h2>
      <div id="recentValidations" class="loading">Loading...</div>
    </div>
  </div>

  <script>
    let statusData = null;

    // Fetch and display health status
    async function fetchHealth() {
      try {
        const response = await fetch('/health');
        const data = await response.json();
        
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        
        if (data.status === 'ok') {
          statusDot.className = 'status-dot';
          statusText.textContent = 'Service Online';
        } else {
          statusDot.className = 'status-dot down';
          statusText.textContent = 'Service Down';
        }
        
        document.getElementById('version').textContent = data.version;
        document.getElementById('uptime').textContent = formatUptime(data.uptime_seconds);
      } catch (error) {
        document.getElementById('statusDot').className = 'status-dot down';
        document.getElementById('statusText').textContent = 'Connection Error';
      }
    }

    // Fetch and display status
    async function fetchStatus() {
      try {
        const response = await fetch('/status');
        statusData = await response.json();
        
        // Update counters
        document.getElementById('validationCount').textContent = statusData.counters.validations_run;
        document.getElementById('lastValidation').textContent = 
          statusData.counters.last_validation_at 
            ? new Date(statusData.counters.last_validation_at).toLocaleString()
            : 'Never';
        
        // Update policy packs
        document.getElementById('cachedCount').textContent = statusData.cached_policy_packs.length;
        
        if (statusData.cached_policy_packs.length > 0) {
          const packsList = statusData.cached_policy_packs
            .map(pack => \`<div style="font-size: 13px; padding: 6px 0; border-bottom: 1px solid #f0f0f0;">
              <strong>\${pack.id}</strong> v\${pack.version}<br>
              <span style="color: #999; font-size: 12px;">\${pack.url} @ \${pack.ref}</span>
            </div>\`)
            .join('');
          document.getElementById('policyPacksList').innerHTML = packsList;
        } else {
          document.getElementById('policyPacksList').innerHTML = '<div class="empty-state" style="padding: 20px;">No policy packs cached yet</div>';
        }
        
        // Update recent validations
        displayRecentValidations(statusData.recent_validations);
      } catch (error) {
        console.error('Failed to fetch status:', error);
      }
    }

    // Display recent validations
    function displayRecentValidations(validations) {
      const container = document.getElementById('recentValidations');
      
      if (!validations || validations.length === 0) {
        container.innerHTML = '<div class="empty-state">No recent validations</div>';
        return;
      }
      
      const html = \`
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Status</th>
              <th>Policy Pack</th>
              <th>Path</th>
              <th>Violations</th>
            </tr>
          </thead>
          <tbody>
            \${validations.map(v => \`
              <tr>
                <td class="timestamp">\${new Date(v.timestamp).toLocaleString()}</td>
                <td><span class="badge badge-\${v.status.toLowerCase()}">\${v.status}</span></td>
                <td>\${v.policy_pack.id}</td>
                <td>\${v.artifact_path || '-'}</td>
                <td>\${v.violation_count} / \${v.warning_count}</td>
              </tr>
            \`).join('')}
          </tbody>
        </table>
      \`;
      
      container.innerHTML = html;
    }

    // Run validation
    async function runValidation() {
      const btn = document.getElementById('validateBtn');
      const resultDiv = document.getElementById('validationResult');
      
      const policyUrl = document.getElementById('policyUrl').value.trim();
      const policyRef = document.getElementById('policyRef').value.trim();
      const code = document.getElementById('codeInput').value.trim();
      
      if (!policyUrl || !policyRef || !code) {
        alert('Please fill in all fields');
        return;
      }
      
      btn.disabled = true;
      btn.textContent = '⏳ Validating...';
      resultDiv.innerHTML = '<div class="loading">Running validation...</div>';
      
      try {
        const response = await fetch('/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            policy_pack: {
              source: 'git',
              url: policyUrl,
              ref: policyRef
            },
            artifact: {
              type: 'code',
              language: 'tsx',
              content: code,
              path: 'test.tsx'
            }
          })
        });
        
        const result = await response.json();
        resultDiv.innerHTML = '<pre>' + JSON.stringify(result, null, 2) + '</pre>';
        
        // Refresh status after validation
        setTimeout(fetchStatus, 500);
      } catch (error) {
        resultDiv.innerHTML = '<pre style="background: #fee; color: #900;">Error: ' + error.message + '</pre>';
      } finally {
        btn.disabled = false;
        btn.textContent = '🚀 Run Validation';
      }
    }

    // Format uptime
    function formatUptime(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      if (hours > 0) {
        return \`\${hours}h \${minutes}m \${secs}s\`;
      } else if (minutes > 0) {
        return \`\${minutes}m \${secs}s\`;
      } else {
        return \`\${secs}s\`;
      }
    }

    // Initialize
    fetchHealth();
    fetchStatus();
    
    // Auto-refresh every 5 seconds
    setInterval(() => {
      fetchHealth();
      fetchStatus();
    }, 5000);
  </script>
</body>
</html>
  `;
  
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
}

