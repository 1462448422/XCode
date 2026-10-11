import { getXCodeCopy } from "@zcode/i18n";
export function formatCliHelp(version, locale, detectedLocale) {
    return getXCodeCopy(locale, detectedLocale).cli.help(version);
}
