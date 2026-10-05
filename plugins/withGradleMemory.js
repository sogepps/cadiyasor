const { withGradleProperties } = require('expo/config-plugins');

/**
 * Gives the Gradle daemon enough heap and metaspace for a release build with lint: the Expo
 * default (2 GB / 512 MB) runs out of metaspace in `lintVitalAnalyzeRelease`. Kept as a plugin so
 * `expo prebuild --clean` does not undo it.
 */
module.exports = function withGradleMemory(config) {
  return withGradleProperties(config, (cfg) => {
    const key = 'org.gradle.jvmargs';
    const value = '-Xmx6144m -XX:MaxMetaspaceSize=1536m -XX:+HeapDumpOnOutOfMemoryError';
    const existing = cfg.modResults.find((p) => p.type === 'property' && p.key === key);
    if (existing) existing.value = value;
    else cfg.modResults.push({ type: 'property', key, value });
    return cfg;
  });
};
