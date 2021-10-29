<h1 align="center">InAppBrowser for NativeScript</h1>
<h3 align="center">Provides access to the system's web browser and supports handling redirects</h3>
<h4 align="center"><a href="https://developer.chrome.com/multidevice/android/customtabs#whatarethey">Chrome Custom Tabs</a> for Android & <a href="https://developer.apple.com/documentation/safariservices">SafariServices</a>/<a href="https://developer.apple.com/documentation/authenticationservices">AuthenticationServices</a> for iOS.</h4>

<p align="center">
  <img width="400px" src="https://github.com/proyecto26/nativescript-inappbrowser/blob/develop/img/inappbrowser.png?raw=true">
</p>

## Getting started

```javascript
tns plugin add @akylas/nativescript-inappbrowser
```



## Usage

Methods       | Action
------------- | ------
`open`        | Opens the url with Safari in a modal on iOS using **SFSafariViewController**, and Chrome in a new custom tab on Android. On iOS, the modal Safari will not share cookies with the system Safari.
`close`       | Dismisses the system's presented web browser.
`openAuth`    | Opens the url with Safari in a modal on iOS using **SFAuthenticationSession/ASWebAuthenticationSession**, and Chrome in a new custom tab on Android. On iOS, the user will be asked whether to allow the app to authenticate using the given url **(OAuth flow with deep linking redirection)**.
`closeAuth`   | Dismisses the current authentication session.
`isAvailable` | Detect if the device supports this plugin.

### iOS Options

Property       | Description
-------------- | ------
`dismissButtonStyle` (String)        | The style of the dismiss button. [`done`/`close`/`cancel`]
`preferredBarTintColor` (String)     | The color to tint the background of the navigation bar and the toolbar. [`white`/`#FFFFFF`]
`preferredControlTintColor` (String) | The color to tint the control buttons on the navigation bar and the toolbar. [`gray`/`#808080`]
`readerMode` (Boolean)               | A value that specifies whether Safari should enter Reader mode, if it is available. [`true`/`false`]
`animated` (Boolean)                 | Animate the presentation. [`true`/`false`]
`modalPresentationStyle` (String)    | The presentation style for modally presented view controllers. [`automatic`/`none`/`fullScreen`/`pageSheet`/`formSheet`/`currentContext`/`custom`/`overFullScreen`/`overCurrentContext`/`popover`]
`modalTransitionStyle` (String)      | The transition style to use when presenting the view controller. [`coverVertical`/`flipHorizontal`/`crossDissolve`/`partialCurl`]
`modalEnabled` (Boolean)             | Present the **SafariViewController** modally or as push instead. [`true`/`false`]
`enableBarCollapsing` (Boolean)      | Determines whether the browser's tool bars will collapse or not. [`true`/`false`]
`ephemeralWebSession` (Boolean)      | Prevent re-use cookies of previous session (openAuth only) [`true`/`false`]

### Android Options
Property       | Description
-------------- | ------
`showTitle` (Boolean)   | Sets whether the title should be shown in the custom tab. [`true`/`false`]
`toolbarColor` (String)           | Sets the toolbar color. [`gray`/`#808080`]
`secondaryToolbarColor` (String)  | Sets the color of the secondary toolbar. [`white`/`#FFFFFF`]
`enableUrlBarHiding` (Boolean)    | Enables the url bar to hide as the user scrolls down on the page. [`true`/`false`]
`enableDefaultShare` (Boolean)    | Adds a default share item to the menu. [`true`/`false`]
`animations` (Object)             | Sets the start and exit animations. [`{ startEnter, startExit, endEnter, endExit }`]
`headers` (Object)                | The data are key/value pairs, they will be sent in the HTTP request headers for the provided url. [`{ 'Authorization': 'Bearer ...' }`]
`forceCloseOnRedirection` (Boolean) | Open Custom Tab in a new task to avoid issues redirecting back to app scheme. [`true`/`false`]
`hasBackButton` (Boolean)         | Sets a back arrow instead of the default `X` icon to close the custom tab. [`true`/`false`]
`browserPackage` (String)         | Package name of a browser to be used to handle Custom Tabs.
`showInRecents` (Boolean)         | Determining whether browsed website should be shown as separate entry in Android recents/multitasking view. [`true`/`false`]

### Demo

```ts
import { Utils, Dialogs } from '@nativescript/core';
import { InAppBrowser } from '@akylas/nativescript-inappbrowser';

...
  openLink = async () => {
    try {
      const url = 'https://www.google.com'
      if (await InAppBrowser.isAvailable()) {
        const result = await InAppBrowser.open(url, {
          // iOS Properties
          dismissButtonStyle: 'cancel',
          preferredBarTintColor: '#453AA4',
          preferredControlTintColor: 'white',
          readerMode: false,
          animated: true,
          modalPresentationStyle: 'fullScreen',
          modalTransitionStyle: 'coverVertical',
          modalEnabled: true,
          enableBarCollapsing: false,
          // Android Properties
          showTitle: true,
          toolbarColor: '#6200EE',
          secondaryToolbarColor: 'black',
          enableUrlBarHiding: true,
          enableDefaultShare: true,
          forceCloseOnRedirection: false,
          // Specify full animation resource identifier(package:anim/name)
          // or only resource name(in case of animation bundled with app).
          animations: {
            startEnter: 'slide_in_right',
            startExit: 'slide_out_left',
            endEnter: 'slide_in_left',
            endExit: 'slide_out_right'
          },
          headers: {
            'my-custom-header': 'my custom header value'
          },
          hasBackButton: true,
          browserPackage: '',
          showInRecents: false
        });
        Dialogs.alert({
          title: 'Response',
          message: JSON.stringify(result),
          okButtonText: 'Ok'
        });
      }
      else {
        Utils.openUrl(url);
      }
    }
    catch(error) {
      Dialogs.alert({
        title: 'Error',
        message: error.message,
        okButtonText: 'Ok'
      });
    }
  }
...
```

### Authentication Flow using Deep Linking

In order to redirect back to your application from a web browser, you must specify a unique URI to your app. To do this,
define your app scheme and replace `my-scheme` and `my-host` with your info.

- Enable deep linking (Android) - **[AndroidManifest.xml](https://github.com/proyecto26/nativescript-inappbrowser/blob/master/demo/app/App_Resources/Android/src/main/AndroidManifest.xml#L41)**
```
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="my-scheme" android:host="my-host" />
</intent-filter>
```

- Enable deep linking (iOS) - **[Info.plist](https://github.com/proyecto26/nativescript-inappbrowser/blob/master/demo/app/App_Resources/iOS/Info.plist#L21)**
```
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleTypeRole</key>
    <string>Editor</string>
    <key>CFBundleURLName</key>
    <string>my-scheme</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>my-scheme</string>
    </array>
  </dict>
</array>
```

- utilities.ts
```javascript
export const getDeepLink = (path = "") => {
  const scheme = 'my-scheme';
  const prefix = global.isAndroid ? `${scheme}://my-host/` : `${scheme}://`;
  return prefix + path;
}
```

- home-page.ts
```ts
import { Utils, Dialogs } from '@nativescript/core';
import { InAppBrowser } from '@akylas/nativescript-inappbrowser';
import { getDeepLink } from './utilities';
...
  async onLogin() {
    const deepLink = getDeepLink('callback')
    const url = `https://my-auth-login-page.com?redirect_uri=${deepLink}`
    try {
      if (await InAppBrowser.isAvailable()) {
        InAppBrowser.openAuth(url, deepLink, {
          // iOS Properties
          ephemeralWebSession: false,
          // Android Properties
          showTitle: false,
          enableUrlBarHiding: true,
          enableDefaultShare: false
        }).then((response) => {
          if (
            response.type === 'success' &&
            response.url
          ) {
            Utils.openUrl(response.url)
          }
        })
      } else Utils.openUrl(url)
    } catch (error) {
      Utils.openUrl(url)
    }
  }
...
```

### Authentication

Using in-app browser tabs (like SFAuthenticationSession/ASWebAuthenticationSession and Android Custom Tabs) where available. Embedded user-agents, known as web-views (like UIWebView and WKWebView), are explicitly not supported due to the usability and security reasons documented in [Section 8.12 of RFC 8252](https://tools.ietf.org/html/rfc8252#section-8.12).

## Contributors ✨
Please do contribute! Issues and pull requests are welcome.

### Code Contributors

This project exists thanks to all the people who contribute. [[Contribute](CONTRIBUTING.md)].

[![](https://sourcerer.io/fame/jdnichollsc/proyecto26/nativescript-inappbrowser/images/0)](https://sourcerer.io/fame/jdnichollsc/proyecto26/nativescript-inappbrowser/links/0)[![](https://sourcerer.io/fame/jdnichollsc/proyecto26/nativescript-inappbrowser/images/1)](https://sourcerer.io/fame/jdnichollsc/proyecto26/nativescript-inappbrowser/links/1)[![](https://sourcerer.io/fame/jdnichollsc/proyecto26/nativescript-inappbrowser/images/2)](https://sourcerer.io/fame/jdnichollsc/proyecto26/nativescript-inappbrowser/links/2)[![](https://sourcerer.io/fame/jdnichollsc/proyecto26/nativescript-inappbrowser/images/3)](https://sourcerer.io/fame/jdnichollsc/proyecto26/nativescript-inappbrowser/links/3)[![](https://sourcerer.io/fame/jdnichollsc/proyecto26/nativescript-inappbrowser/images/4)](https://sourcerer.io/fame/jdnichollsc/proyecto26/nativescript-inappbrowser/links/4)[![](https://sourcerer.io/fame/jdnichollsc/proyecto26/nativescript-inappbrowser/images/5)](https://sourcerer.io/fame/jdnichollsc/proyecto26/nativescript-inappbrowser/links/5)[![](https://sourcerer.io/fame/jdnichollsc/proyecto26/nativescript-inappbrowser/images/6)](https://sourcerer.io/fame/jdnichollsc/proyecto26/nativescript-inappbrowser/links/6)[![](https://sourcerer.io/fame/jdnichollsc/proyecto26/nativescript-inappbrowser/images/7)](https://sourcerer.io/fame/jdnichollsc/proyecto26/nativescript-inappbrowser/links/7)

### Collaborators
<!-- COLLABORATORS-LIST:START - Do not remove or modify this section -->
| [<img alt="jdnichollsc" src="https://avatars3.githubusercontent.com/u/2154886?v=3" width="100" /><br /><sub><b>Juan Nicholls</b></sub>](https://github.com/jdnichollsc)<br />[✉](mailto:jdnichollsc@hotmail.com) | [<img alt="NathanaelA" src="https://avatars3.githubusercontent.com/u/850871?v=3" width="100" /><br /><sub><b>Nathanael Anderson</b></sub>](https://github.com/NathanaelA)<br />[✉](mailto:nathan@master-technology.com) |
| :---: | :---: |
<!-- COLLABORATORS-LIST:END -->

#### Individuals

<a href="https://opencollective.com/proyecto26"><img src="https://opencollective.com/proyecto26/individuals.svg?width=890"></a>

## Credits 👍
* **React Native InAppBrowser:** [InAppBrowser for React Native](https://github.com/proyecto26/react-native-inappbrowser)
