# Permessions Required for New TongWenTang Extension

The Extension require several permissions inorder to work well.

### Required Permissions

- `contextMenus`
  - Browser action context menu.
  - Web page context menu.
- `downloads`
  - Export preferences by download.
- `notifications`
  - Notify for error.
  - Notify for information like convert done.
- `storage`
  - For saving preferences including custom domain rules and mapping words.
- `unlimitedStorage`
  - Custom domain rules and mapping words could be many.

### Host Permission

- `<all_urls>`
  - Allows the user to configure a zhconvert API URL in the options page.
  - Network phrase requests are made only when the corresponding zhconvert option is enabled.

### Optional Permissions

- `clipboardWrite`
  - Write converted content back to clipboard.
- `clipboardRead`
  - Read to convert content from clipboard.
