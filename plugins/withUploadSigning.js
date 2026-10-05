const { withAppBuildGradle } = require('expo/config-plugins');

/**
 * Signs release builds with the Play upload key instead of the debug key.
 *
 * Google Play rejects a debug-signed bundle, and `expo prebuild --clean` throws away any hand edit
 * to android/, so the signing config is re-applied every time the native project is regenerated.
 *
 * The keystore and its passwords never live in the repository. Gradle reads them as properties
 * from `~/.gradle/gradle.properties` (or `-P` on the command line):
 *
 *   CADIYASOR_UPLOAD_STORE_FILE=E:/Soge/cadi.keystore
 *   CADIYASOR_UPLOAD_STORE_PASSWORD=…
 *   CADIYASOR_UPLOAD_KEY_ALIAS=soge
 *   CADIYASOR_UPLOAD_KEY_PASSWORD=…
 *
 * Without them the build still works and stays debug-signed — fine for a tester APK; only the Play
 * upload needs the real key.
 */

const GUARD = "project.hasProperty('CADIYASOR_UPLOAD_STORE_FILE')";

const RELEASE_SIGNING = `        release {
            if (${GUARD}) {
                storeFile file(CADIYASOR_UPLOAD_STORE_FILE)
                storePassword CADIYASOR_UPLOAD_STORE_PASSWORD
                keyAlias CADIYASOR_UPLOAD_KEY_ALIAS
                keyPassword CADIYASOR_UPLOAD_KEY_PASSWORD
            }
        }
`;

module.exports = function withUploadSigning(config) {
  return withAppBuildGradle(config, (gradleConfig) => {
    let contents = gradleConfig.modResults.contents;

    if (!contents.includes('CADIYASOR_UPLOAD_STORE_FILE')) {
      const anchor = 'signingConfigs {\n';
      const at = contents.indexOf(anchor);
      if (at === -1) throw new Error('withUploadSigning: no signingConfigs block in app/build.gradle');
      const insertAt = at + anchor.length;
      contents = contents.slice(0, insertAt) + RELEASE_SIGNING + contents.slice(insertAt);

      // Only the release build type, and only inside buildTypes — signingConfigs now has a
      // `release {` of its own, which a looser match would latch onto first.
      const typesAt = contents.indexOf('buildTypes {');
      if (typesAt === -1) throw new Error('withUploadSigning: no buildTypes block in app/build.gradle');
      const head = contents.slice(0, typesAt);
      const tail = contents
        .slice(typesAt)
        .replace(
          /(release \{[\s\S]*?)signingConfig signingConfigs\.debug/,
          `$1signingConfig ${GUARD} ? signingConfigs.release : signingConfigs.debug`,
        );
      contents = head + tail;
    }

    gradleConfig.modResults.contents = contents;
    return gradleConfig;
  });
};
