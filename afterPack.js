module.exports = function afterPack(context) {
  // Disable code signing to avoid winCodeSign download issue
  process.env.ELECTRON_BUILDER_WIN_SIGN = '0';
};