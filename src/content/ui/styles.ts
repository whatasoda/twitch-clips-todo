// Inline styles for content script UI (Shadow DOM)
export const styles = {
  button: {
    base: `
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 4px;
      background: #9147ff;
      color: white;
      cursor: pointer;
      transition: background 0.2s;
      font-size: 16px;
    `,
    hover: `background: #772ce8;`,
    active: `transform: scale(0.95);`,
  },
  memoInput: {
    container: `
      position: fixed;
      bottom: 80px;
      right: 20px;
      z-index: 10000;
      background: #18181b;
      border: 1px solid #3d3d3d;
      border-radius: 8px;
      padding: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `,
    input: `
      width: 200px;
      padding: 8px 12px;
      border: 1px solid #3d3d3d;
      border-radius: 4px;
      background: #0e0e10;
      color: #efeff1;
      font-size: 14px;
      outline: none;
    `,
    buttonRow: `
      display: flex;
      gap: 8px;
      margin-top: 8px;
      justify-content: flex-end;
    `,
    saveButton: `
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      background: #9147ff;
      color: white;
      cursor: pointer;
      font-size: 12px;
    `,
    cancelButton: `
      padding: 6px 12px;
      border: 1px solid #3d3d3d;
      border-radius: 4px;
      background: transparent;
      color: #efeff1;
      cursor: pointer;
      font-size: 12px;
    `,
  },
  toast: {
    base: `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10001;
      padding: 12px 16px;
      border-radius: 4px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      color: white;
      animation: slideIn 0.3s ease;
    `,
    success: `background: #00a67e;`,
    error: `background: #d9534f;`,
    info: `background: #9147ff;`,
  },
  indicator: {
    container: `
      position: fixed;
      bottom: 80px;
      left: 20px;
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: #18181b;
      border: 1px solid #9147ff;
      border-radius: 20px;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      transition: transform 0.2s;
    `,
    badge: `
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      border-radius: 10px;
      background: #9147ff;
      color: white;
      font-size: 12px;
      font-weight: bold;
    `,
    text: `
      color: #efeff1;
      font-size: 12px;
    `,
  },
};
