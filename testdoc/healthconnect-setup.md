# Android Emulator: Health Connect Setup and Testing

**Host OS:** Pop!\_OS Linux  
**Android emulator:** Android 17, API 37  
**Purpose:** Open Health Connect, install Health Connect Toolbox, and prepare to test step-count integration in ExersAIze.

## 1. Check Android Version

**Purpose:** Confirm the Android emulator's version and API level.

```bash
adb shell getprop ro.build.version.release
adb shell getprop ro.build.version.sdk
```

**Successful result:**

- Android version: `17`
- API level: `37`

## 2. Find Installed Health Connect Packages

**Purpose:** Check whether Health Connect components are installed.

```bash
adb shell pm list packages | grep -i health
```

**Packages found:**

```text
com.google.android.health.connect.backuprestore
com.google.android.healthconnect.controller
```

## 3. Open Health Connect Settings

**Purpose:** Open the Health Connect settings screen directly from Linux.

```bash
adb shell am start -a android.health.connect.action.HEALTH_HOME_SETTINGS
```

**Successful result:**

```text
Starting: Intent { act=android.health.connect.action.HEALTH_HOME_SETTINGS }
```

**Verified:** The Health Connect screen opened in the emulator.

## 4. Download Health Connect Toolbox

**Purpose:** Obtain the Toolbox APK for inserting test health records.

The downloaded APK filename was:

```text
HealthConnectToolbox-2_3_5.apk
```

The file was located in:

```text
~/Downloads/
```

## 5. Install Health Connect Toolbox

**Purpose:** Install the APK on the running Android emulator.

```bash
cd ~/Downloads
adb install HealthConnectToolbox-2_3_5.apk
```

**Successful result:**

```text
Performing Streamed Install
Success
```

## 6. Launch Health Connect Toolbox

**Purpose:** Send a launch event to the installed Toolbox package.

```bash
adb shell monkey -p androidx.health.connect.client.devtool 1
```

**Successful result:**

```text
Events injected: 1
```

**Important:** This confirms that Android received the launch event. It does not independently confirm that the Toolbox interface opened.

## 7. Open Health Connect Settings Again

**Purpose:** Return to Health Connect when checking permissions or inserted test data.

```bash
adb shell am start -a android.health.connect.action.HEALTH_HOME_SETTINGS
```

## 8. Check Installed Toolbox Package

**Purpose:** Verify the Toolbox package is installed.

```bash
adb shell pm list packages | grep -i toolbox
```

The package identified during testing was:

```text
androidx.health.connect.client.devtool
```

## 9. Check Installed Health Connect Controller

**Purpose:** Inspect the controller package.

```bash
adb shell pm path com.google.android.healthconnect.controller
```

This displays the installed APK path if the package is available.

## 10. Insert Test Step Records

**Purpose:** Add test steps to Health Connect for ExersAIze.

Once the Toolbox interface is open:

1. Choose **Insert Health Record**.
2. Select **Activity**.
3. Select **Steps**.
4. Enter a test count, such as `2500`.
5. Set start and end times within today's date range.
6. Save the record.

Then grant ExersAIze permission to read steps through Health Connect.

**Note:** The record insertion procedure has not yet been confirmed successful in this session.

## Commands That Did Not Work as Expected

### A. Open the original guessed Toolbox package

```bash
adb shell monkey -p com.google.android.healthconnect.toolbox 1
```

Result:

```text
No activities found to run, monkey aborted.
```

**Reason:** The guessed package name did not launch the installed app.

### B. Open the original Health Connect action

```bash
adb shell am start -a android.health.connect.action.HEALTH_HOME
```

Result: No activity was found.

**Working alternative:**

```bash
adb shell am start -a android.health.connect.action.HEALTH_HOME_SETTINGS
```

### C. Resolve a launcher activity

```bash
adb shell cmd package resolve-activity --brief \
  -a android.intent.action.MAIN \
  -c android.intent.category.LAUNCHER \
  -p androidx.health.connect.client.devtool
```

Use this only if you need to investigate whether the package exposes a launcher activity. The package may not expose a standard launcher activity.

---

## Quick Reference

| Task                         | Command                                                                    |
| ---------------------------- | -------------------------------------------------------------------------- |
| Check Android version        | `adb shell getprop ro.build.version.release`                               |
| Check Android API level      | `adb shell getprop ro.build.version.sdk`                                   |
| List Health Connect packages | `adb shell pm list packages \| grep -i health`                             |
| Open Health Connect settings | `adb shell am start -a android.health.connect.action.HEALTH_HOME_SETTINGS` |
| Install Toolbox              | `adb install HealthConnectToolbox-2_3_5.apk`                               |
| Launch Toolbox               | `adb shell monkey -p androidx.health.connect.client.devtool 1`             |
| List Toolbox packages        | `adb shell pm list packages \| grep -i toolbox`                            |
| Inspect controller APK path  | `adb shell pm path com.google.android.healthconnect.controller`            |
