import { parseFlags } from './flag_parser';
import { assert } from './test_base';
import 'source-map-support/register';

/** Simple test for FlagParser */
function run() {
  // Prepare
  let args = ['112', '--ddd=33dfs', '11=33', '--55=dd', '--ar1=', '--=321'];

  // Execute
  let flags = parseFlags(args);

  // Verify
  assert(flags.get('ddd') === '33dfs');
  assert(flags.get('55') === 'dd');
  assert(!('ar1' in flags));
  assert(!('' in flags));
  assert(!('112' in flags));
  assert(!('11' in flags));
}

try {
  run();
  console.log('ParseArgs success!');
} catch (e) {
  console.log('ParseArgs failed!' + e.stack);
}
