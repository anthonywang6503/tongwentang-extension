# New TongWenTang Preferences

There are many settings for customization in preferences page.

## General

Auto Convert

- Disabled
  - Do nothing on page loaded.
- Simplified to Traditional:
  - Convert to Traditional Chinese on page loaded.
- Traditional to Simplified:
  - Convert to Simplified Chinese on page loaded.
- Detective Simplified to Traditional:
  - Convert to Traditional Chinese on page loaded if the web page content regconize as Simplified Chinese.
- Detective Traditional to Simplified:
  - Convert to Simplified Chinese on page loaded if the web page content regconize as Traditional Chinese.

Icon Action

- Auto:
  - Switch page content between Traditional Chinese and Simplified Chinese.
  - If the web page content can not regconize by browser API, then extension will convert to default on first time click.
- Traditional Chinese
  - Convert to Traditional Chinese each time icon clicked.
- Simplified Chinese
  - Convert to Simplified Chinese each time icon clicked.

Default Convert

- If icon action set to "Auto" and web page content can not regconize then fallback to this value.

Dynamic Convert

- Responsively convert web page content on changed, many website partially update content without refresh whole web page.

Debug Mode

- If enabled, some critical information will log into extension console.
- How to open extension console
  - Firefox:
    - Goto `about:debugging`, switch to `This Firefox` tab, find `New TongWenTang` and click `Inspect`, switch to `console` tab.
  - Chrome:
    - Goto `chrome://extensions`, find `New TongWenTang` and click `Detail`, click `background page` link under `Inspect Views`.

## Context Menu

Enabled Context Menu

- Completely disabled or enabled showing commands on web page context menu.

Others

- Disabled or enabled for each commands showing on web page context menu.

## Domain Rule

Enabled Domain Rule

- Completely enabled or disabled this feature.

Add

- Trigger Domain Rule editor.

Save

- In order to persist all changes made, manually click "Save" button is required.

Domain Rule

- Domain Rule can be plain text or regular expression.
- Plain text mean any url that contain this text will trigger convert action.
- Regular expression mean `regexp.test` function call with URL must return `true` in order to trigger convert action.

## Word

Default

- The built-in simplified-to-traditional and traditional-to-simplified character and phrase lists can be enabled independently.
- Enable `zhconvert Network Conversion` for either direction to send default phrases to the configured zhconvert API.
- Network conversion runs first. On timeout or API failure, the extension retries according to the configured attempt count and immediately falls back to the local phrase converter.

zhconvert Network Conversion Settings

![zhconvert settings in the default word preferences](../images/zhconvert-settings.png)

![zhconvert converters and failover settings](../images/zhconvert-settings-detail.png)

- API URL
  - Defaults to `https://api.zhconvert.org/convert` and accepts a compatible `/convert` endpoint.
- API Key
  - Stored in the browser's local extension preferences and sent with the request.
- Simplified-to-Traditional / Traditional-to-Simplified API Converter
  - Select the zhconvert converter for each direction, such as `Traditional` or `Simplified`.
- Try count
  - Maximum attempts per request, including the first request; the default is `2`.
- Timeout
  - Maximum duration for one request; the default is `3000 ms`.
- Cooldown
  - Blocks new network requests after consecutive failures; the default is `30000 ms`.

Failure handling

1. Try the zhconvert network converter first.
2. Retry immediately when a request times out or the API reports an error.
3. Fall back to the local phrase converter and show one low-noise notification after all attempts fail.
4. Do not start new network requests during the cooldown; retry network conversion after the cooldown expires.

This program uses the [zhconvert API](https://docs.zhconvert.org/api/0-getting-started/). Commercial use requires payment; see [zhconvert.org](https://zhconvert.org).

Custom Simplified to Traditional / Custom Traditional to Simplified

- Add, edit, or remove user custom mapping list.
