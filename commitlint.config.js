export default {
  extends: ["@commitlint/config-conventional"],
  ignores: [
    (message) => /bump .+ from .+ to .+/m.test(message),
    (message) => /^Bumps \[.+\]\(.+\) from .+ to .+.$/m.test(message),
  ],
};
