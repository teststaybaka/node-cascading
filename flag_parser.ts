/** Parsing flags. Flag format: --[flag name]=[flag value]. No spaces in between. */
let FLAG_REGEX = new RegExp('^--(.+?)=(.+?)$');

/** Parsing string arrays. */
export function parseFlags(args: string[]): Map<string, string> {
  let flags = new Map<string, string>();
  for(let i = 0; i < args.length; i++) {
    let matched = args[i].match(FLAG_REGEX);
    if (matched) {
      flags.set(matched[1], matched[2]);
    }
  }
  return flags;
}
