import Activity = android.app.Activity;
import Intent = android.content.Intent;
import NfcAdapter = android.nfc.NfcAdapter;
import Context = android.content.Context;
import ResolveInfo = android.content.pm.ResolveInfo;
import Color = android.graphics.Color;
import List = java.util.List;
import Arrays = java.util.Arrays;

import {
  Utils,
  Application,
  ApplicationEventData,
  AndroidApplication,
  AndroidActivityEventData
} from '@nativescript/core';
import {
  RedirectResult,
  OpenBrowserAsync,
  AuthSessionResult,
  BROWSER_TYPES,
  InAppBrowserOptions
} from './InAppBrowser.common';

export let CustomTabsClient: typeof androidx.browser.customtabs.CustomTabsClient;

export const ACTION_CUSTOM_TABS_CONNECTION = "android.support.customtabs.action.CustomTabsService";
export const ARROW_BACK_BLACK = 'ic_arrow_back_black';
export const ARROW_BACK_WHITE = 'ic_arrow_back_white';
export const DISMISSED_EVENT = 'DismissedEvent';

let ColorUtils: typeof androidx.core.graphics.ColorUtils ;

/**
 * Save the handler of the redirection event in order to removes listener later.
 */
let _redirectHandler: (args: ApplicationEventData) => void;
/**
 * Save the previous url in order to avoid loading the same data for a new Authentication flow.
 */
let initialUrl = '';

export const getDrawableId = Utils.ad.resources.getDrawableId;

/**
 * Get the url when the app is opened and clear the data for security concerns.
 * @param activity - Current Android Activity.
 */
export function getInitialURL(activity: Activity): string {
  if (activity) {
    const intent = activity.getIntent();
    const action = intent.getAction();
    const uri = intent.getData();
    if (uri !== null && (
      Intent.ACTION_VIEW === action ||
      NfcAdapter.ACTION_NDEF_DISCOVERED === action
    )) {
      const url = '' + uri;
      if (url === initialUrl) return null;
      initialUrl = url;
      return url;
    }
  }
  return null;
}

function waitForRedirectAsync(
  returnUrl: string
): Promise<RedirectResult> {
  return new Promise(resolve => {
    _redirectHandler = (args: ApplicationEventData) => {
      const url = getInitialURL(args.android);
      if (url && url.startsWith(returnUrl)) {
        resolve({ url: url, type: BROWSER_TYPES.SUCCESS });
      }
    };
    Application.on(Application.resumeEvent, _redirectHandler);
  });
}

/**
 * Detect Android Activity `OnResume` event once
 */
function handleAppStateActiveOnce(): Promise<Activity> {
  return new Promise(function (resolve) {
    // Browser can be closed before handling AppState change
    if (!Application.android.paused) {
      const activity = Application.android.foregroundActivity || Application.android.startActivity;
      return resolve(activity);
    }
    Application.android.once(
      AndroidApplication.activityResumedEvent,
      function(args: AndroidActivityEventData) {
        resolve(args.activity);
      }
    );
  });
}

async function checkResultAndReturnUrl(
  returnUrl: string,
  result: AuthSessionResult
): Promise<AuthSessionResult> {
  if (Application.android && result.type !== BROWSER_TYPES.CANCEL) {
    try {
      const activity = await handleAppStateActiveOnce();
      const url = getInitialURL(activity);
      return url && url.startsWith(returnUrl)
        ? { url: url, type: BROWSER_TYPES.SUCCESS }
        : result;
    } catch (error) {
      return result;
    }
  }
  return result;
}


/* Android polyfill for AuthenticationSession flow */
export function openAuthSessionPolyfillAsync(
  open: OpenBrowserAsync,
  startUrl: string,
  returnUrl: string,
  options?: InAppBrowserOptions,
): Promise<AuthSessionResult> {
  return Promise.race([
    waitForRedirectAsync(returnUrl),
    open(startUrl, options).then(function(result) {
      return checkResultAndReturnUrl(returnUrl, result);
    })
  ]);
}

export function closeAuthSessionPolyfillAsync(): void {
  if (_redirectHandler) {
    Application.off(Application.resumeEvent, _redirectHandler);
    _redirectHandler = null;
  }
}

export function getPreferredPackages(context: Context): List<ResolveInfo> {
  const serviceIntent = new Intent(ACTION_CUSTOM_TABS_CONNECTION);
  const resolveInfos = context.getPackageManager().queryIntentServices(serviceIntent, 0);
  return resolveInfos;
}

export function toolbarIsLight(themeColor: number): boolean {
  if (!ColorUtils) {
    ColorUtils = androidx.core.graphics.ColorUtils;
  }
  return ColorUtils.calculateLuminance(themeColor) > 0.5;
}

export function getDefaultBrowser(context: Context): string {
  const resolveInfos = getPreferredPackages(context);
  if (!CustomTabsClient) {
    CustomTabsClient = androidx.browser.customtabs.CustomTabsClient;
  }
  const packageName = CustomTabsClient.getPackageName(context, Arrays.asList([
    "com.android.chrome",
    "com.chrome.beta",
    "com.chrome.dev",
    "com.google.android.apps.chrome"
  ]));
  if (packageName == null && resolveInfos != null && resolveInfos.size() > 0) {
    return resolveInfos.get(0).serviceInfo.packageName;
  }
  return packageName;
}
